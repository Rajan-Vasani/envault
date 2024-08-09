import {App, Flex, Form, Input, Select, Switch, Tag} from 'antd';
import ErrorBoundary from 'app/components/error/boundary';
import FormTable from 'components/molecules/FormTable';
import {useHubUserCreateMutation, useHubUserRemoveMutation, useHubUserUpdateMutation} from 'hooks/useHub';
import {useRole, useRoleMemberDeleteMutation, useRoleMemberPutMutation} from 'hooks/useRole';
import {useHubUserRoles} from 'hooks/useUser';
import {differenceBy, isEqual} from 'lodash';
import {useEffect, useState} from 'react';

export const Component = props => {
  const {data: userRolesData = [], isSuccess} = useHubUserRoles();
  const {data: roleData = []} = useRole();
  const {mutate: addUser} = useHubUserCreateMutation();
  const {mutate: updateUser} = useHubUserUpdateMutation();
  const {mutate: removeUser} = useHubUserRemoveMutation();
  const {mutate: addRole} = useRoleMemberPutMutation();
  const {mutate: removeRole} = useRoleMemberDeleteMutation();
  const [dataSource, setDataSource] = useState([]);
  const [disabled, setDisabled] = useState(true);
  const [form] = Form.useForm();
  const {notification} = App.useApp();

  useEffect(() => {
    setDataSource(userRolesData);
  }, [userRolesData, form]);

  const handleRemoveUser = record => {
    if (record.id) {
      notification.info({description: 'Deleting user...'});
      removeUser(
        {id: record.id},
        {
          onSuccess: () => {
            notification.success({description: 'User deleted'});
          },
          onError: () => {
            notification.error({description: 'Could not delete user'});
          },
        },
      );
    }
  };

  const handleSave = values => {
    const {roles, ...user} = values;
    const initValues = dataSource.find(item => item.id === user.id);
    const isUpdateRequired = !isEqual(initValues, values);

    if (isUpdateRequired) {
      if (typeof user.id === 'number') {
        notification.info({description: 'Updating user...'});
        updateUser(user, {
          onSuccess: () => {
            notification.success({description: 'User updated'});
          },
          onError: () => {
            notification.error({description: 'Could not update user'});
          },
        });
        const rolesToAdd = differenceBy(roles, initValues.roles, 'id');
        for (const role of rolesToAdd) {
          addRole({user: user.id, role: role.id});
        }
        const rolesToRemove = differenceBy(initValues.roles, roles, 'id');
        for (const role of rolesToRemove) {
          removeRole({user: user.id, role: role.id});
        }
      } else {
        notification.info({description: 'Inviting new user...'});
        delete user.id;
        addUser(user, {
          onSuccess: data => {
            notification.success({description: 'User successfully added to hub'});
            for (const role of roles) {
              addRole({user: data[0].id, role: role.id});
            }
          },
        });
      }
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
      email: '',
      roles: [],
    };
    setDataSource(dataSource => [newData, ...dataSource]);
    return newData;
  };

  const columns = {
    data: [
      {
        title: 'Name',
        key: 'name',
        dataIndex: 'name',
        width: '20%',
        defaultSortOrder: 'ascend',
        sorter: 1,
        filter: true,
        filterSearch: true,
      },
      {
        title: 'Email',
        width: '30%',
        key: 'email',
        dataIndex: 'email',
        editable: record => typeof record.id === 'string',
        formItem: <Input />,
        formItemProps: {
          rules: [{required: true}, {type: 'email'}],
        },
        sorter: 2,
        filter: true,
        filterSearch: true,
      },
      {
        title: 'Role',
        key: 'roles',
        dataIndex: 'roles',
        editable: true,
        formItem: <Select mode={'multiple'} options={roleData.map(role => ({value: role.id, label: role.name}))} />,
        formItemProps: {
          getValueProps: value => {
            if (Array.isArray(value)) {
              return {value: value.map(item => ({value: item.id, label: item.name}))};
            }
          },
          normalize: value => {
            if (Array.isArray(value)) {
              return value.map(item => roleData.find(role => role.id === item));
            }
          },
        },
        render: roles => {
          return (
            <Flex wrap>
              {roles.map(role => (
                <Tag key={role.id}>{role.name}</Tag>
              ))}
            </Flex>
          );
        },
      },
      {
        title: 'Admin',
        width: '10%',
        key: 'is_admin',
        dataIndex: 'is_admin',
        editable: true,
        formItem: <Switch />,
        formItemProps: {
          valuePropName: 'checked',
        },
        render: isAdmin => {
          return isAdmin ? <Tag color="red">Admin</Tag> : <Tag color="green">User</Tag>;
        },
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
        <FormTable
          columns={columns}
          dataSource={dataSource}
          rowKey={record => record?.id}
          loading={!isSuccess}
          newText={'Invite'}
          paginationText={'Users'}
          onPagination={handleCancel}
          onNew={handleNew}
          onSave={handleSave}
          onCancel={handleCancel}
          onRemove={handleRemoveUser}
          onDisabled={setDisabled}
          disabled={disabled}
        />
      </Form>
    </ErrorBoundary>
  );
};

Component.displayName = 'UserManagement';
