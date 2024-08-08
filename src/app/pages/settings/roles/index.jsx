import {useQueryClient} from '@tanstack/react-query';
import {App, Card, Form, Input} from 'antd';
import {createStyles} from 'antd-style';
import ErrorBoundary from 'components/error/boundary';
import FormTable from 'components/molecules/FormTable';
import {API_QUERY} from 'constant/query';
import {useRole, useRoleDeleteMutation, useRolePutMutation} from 'hooks/useRole';
import {isEqual} from 'lodash';
import {useEffect, useState} from 'react';

const useStyles = createStyles(({token, css}) => ({
  card: css`
    margin: auto;
    box-shadow: 0px 4px 42px -9px rgba(0, 0, 0, 0.1);
    margin-top: 20;
  `,
}));

export const Component = props => {
  const {data: roleData = [], isPending} = useRole();
  const {data: roleACLData = []} = useRole({role: 'acl'});
  const {mutate: deleteRole} = useRoleDeleteMutation();
  const {mutate: addRole} = useRolePutMutation();
  const queryClient = useQueryClient();
  const [dataSource, setDataSource] = useState([]);
  const [disabled, setDisabled] = useState(true);
  const [form] = Form.useForm();
  const {notification} = App.useApp();
  const {styles} = useStyles();

  useEffect(() => {
    setDataSource(roleData);
  }, [roleData, form]);

  const handleDeleteRole = values => {
    notification.open({type: 'info', description: 'Deleting role...'});
    const body = {
      hub: globalThis.envault.hub,
      id: values.id,
    };
    deleteRole(
      {...body},
      {
        onSuccess: () => {
          notification.open({type: 'success', description: 'Role deleted'});
          queryClient.invalidateQueries({queryKey: [API_QUERY.GET_ROLE_HUB, globalThis.envault.hub]});
        },
        onError: () => {
          notification.open({type: 'error', description: 'Could not delete role'});
        },
      },
    );
  };

  const handleSave = role => {
    const initValues = dataSource.find(item => item.id === role.id);
    const isUpdateRequired = !isEqual(initValues, role);
    if (isUpdateRequired) {
      if (typeof role.id !== 'number') {
        delete role.id;
      }
      notification.open({type: 'info', description: 'Updating role...'});
      addRole(role, {
        onSuccess: () => {
          notification.open({type: 'success', description: 'Role updated'});
        },
      });
    }
  };

  const handleCancel = record => {
    if (typeof record.id !== 'number') {
      setDataSource(dataSource => dataSource.filter(item => item.email !== record.email));
    }
  };

  const handleNew = () => {
    const newData = {
      id: `new-${dataSource.length + 1}`,
      name: '',
      description: '',
    };
    setDataSource(dataSource => [newData, ...dataSource]);
    return newData;
  };

  const columns = {
    data: [
      {
        title: 'Role',
        key: 'name',
        dataIndex: 'name',
        editable: true,
        formItem: <Input />,
        formItemProps: {
          rules: [{required: true}, {type: 'string'}],
        },
        sorter: 1,
        filter: true,
        filterSearch: true,
      },
      {
        title: 'Description',
        key: 'description',
        dataIndex: 'description',
        editable: true,
        formItem: <Input />,
        sorter: 2,
      },
    ],
    actions: {
      title: 'Actions',
      key: 'action',
      dataIndex: 'action',
      editable: true,
      actionItems: [],
    },
  };

  return (
    <ErrorBoundary>
      <Form form={form} component={false}>
        <Card className={styles.card} style={{width: '90%'}}>
          <FormTable
            columns={columns}
            dataSource={dataSource}
            rowKey={record => record?.id}
            loading={isPending}
            newText={'Add Role'}
            paginationText={'Roles'}
            onPagination={handleCancel}
            onNew={handleNew}
            onSave={handleSave}
            onCancel={handleCancel}
            onRemove={handleDeleteRole}
            onDisabled={setDisabled}
            disabled={disabled}
            maxTableWidth={'100%'}
            maxFormWidth={'100%'}
          />
        </Card>
      </Form>
    </ErrorBoundary>
  );
};

Component.displayName = 'RolesManagement';
