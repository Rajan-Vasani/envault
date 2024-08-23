import {App, Button, Flex, Form, Input} from 'antd';
import {createStyles} from 'antd-style';
import Icon from 'app/components/atoms/Icon';
import FormTable from 'components/molecules/FormTable';
import {useHubCreateMutation, useHubRemoveMutation, useHubUpdateMutation} from 'hooks/useHub';
import {useUser} from 'hooks/useUser';
import {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';

const useStyles = createStyles(({token, css}) => ({
  table: css`
    box-shadow: ${token.boxShadowTertiary};
    border-radius: ${token.borderRadius}px;
    border: 1px solid ${token.colorBorder};
  `,
}));

export const Component = () => {
  const {userId} = useParams();
  const {data: [user = {}] = [], isSuccess} = useUser({id: +userId});
  const {mutate: updateHub} = useHubUpdateMutation();
  const {mutate: createHub} = useHubCreateMutation();
  const {mutate: removeHub} = useHubRemoveMutation();
  const [dataSource, setDataSource] = useState(user.hubs);
  const [disabled, setDisabled] = useState(true);
  const [form] = Form.useForm();
  const {styles} = useStyles();
  const {notification} = App.useApp();

  useEffect(() => {
    setDataSource(user.hubs);
  }, [user.hubs]);

  const handleDelete = record => {
    const saved = user.hubs.some(hub => hub.name === record.name);
    if (!saved) {
      setDataSource(dataSource => dataSource.filter(item => item.name !== record.name));
      return;
    }
    removeHub(
      {name: record.name},
      {
        onSuccess: () => {
          notification.success({description: 'Hub deleted successfully'});
        },
      },
    );
  };

  const handleSave = values => {
    const existing = user.hubs.some(hub => hub.name === values.name);
    if (existing) {
      updateHub(values, {
        onSuccess: () => {
          notification.success({description: 'Hub updated successfully'});
        },
      });
    } else {
      createHub(values, {
        onSuccess: () => {
          notification.success({description: 'Hub created successfully'});
        },
      });
    }
  };

  const handleCancel = record => {
    const existing = user.hubs.some(hub => hub.name === record.name);
    if (!existing) {
      setDataSource(dataSource => dataSource.filter(item => item.name !== record.name));
    }
  };

  const handleNew = () => {
    const newData = {
      full_name: `New Hub`,
      name: `new_hub_${dataSource.length + 1}`,
    };
    setDataSource(dataSource => [...dataSource, newData]);
    return newData;
  };

  const columns = {
    data: [
      {
        title: 'Name',
        dataIndex: 'full_name',
        width: '30%',
        editable: true,
        formItem: <Input />,
        formItemProps: {
          getValueFromEvent: value => {
            const full_name = value?.target?.value;
            if (full_name) {
              form.setFields([{name: 'name', value: full_name.toLowerCase().replace(/[\W_]/g, '').slice(0, 18)}]);
              return full_name;
            }
          },
          rules: [
            {required: true, message: '* please enter a hub name'},
            {min: 2, message: '* must be at least 2 characters'},
            {type: 'string'},
          ],
        },
      },
      {
        title: 'Domain',
        dataIndex: 'name',
        editable: true,
        required: true,
        formItem: <Input />,
        formItemProps: {
          rules: [
            {
              required: true,
              message: '* please enter a hub domain',
            },
            {type: 'string'},
            {
              min: 2,
              message: '* must be at least 2 characters',
            },
            {
              max: 18,
              message: '* must be at most 18 characters',
            },
            {
              pattern: /^[a-z0-9]+$/,
              message: '* must be lowercase and contain only letters and numbers',
            },
            {
              validator: async (rule, value) => {
                if (value && user.hubs.some(hub => hub.name === value && hub.name !== form.getFieldValue('name'))) {
                  throw new Error('Hub domain already exists');
                }
              },
            },
          ],
        },
      },
    ],
    actions: {
      title: 'Actions',
      width: '20%',
      editable: true,
      actionItems: record => [
        <Button
          key={'settings'}
          href={`${globalThis.envault.getOrigin(record.name)}/hub/settings`}
          icon={<Icon icon={'SettingOutlined'} type={'ant'} />}
        >
          Settings
        </Button>,
        <Button
          key={'explore'}
          href={`${globalThis.envault.getOrigin(record.name)}/hub/explore`}
          icon={<Icon icon={'LoginOutlined'} type={'ant'} />}
        >
          Explore
        </Button>,
      ],
    },
  };

  return (
    <Flex vertical gap={'middle'}>
      <Form form={form} component={false}>
        <FormTable
          className={styles.table}
          columns={columns}
          dataSource={dataSource}
          rowKey={record => record?.name}
          loading={!isSuccess}
          newText={'New Hub'}
          paginationText={'Hubs'}
          onPagination={handleCancel}
          onNew={handleNew}
          onSave={handleSave}
          onCancel={handleCancel}
          onRemove={handleDelete}
          onDisabled={setDisabled}
          disabled={disabled}
        />
      </Form>
    </Flex>
  );
};
Component.displayName = 'AppAdminHubs';
