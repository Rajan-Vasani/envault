import {ExclamationCircleFilled, PlusOutlined} from '@ant-design/icons';
import {App, Button, Form, Input, List, Modal, Popconfirm, Select, Space, Tag, Typography} from 'antd';
import {useAllUser, useUser} from 'app/services/hooks/useUser';
import {useHubUserCreateMutation} from 'hooks/useHub';
import {useEffect, useState} from 'react';
const {confirm} = Modal;
const {Search} = Input;

export const Component = props => {
  const {hubId} = props;
  const {data: userData, isFetched: isUserFetched} = useAllUser();
  const {data: hubData, isFetched: isHubFetched} = useUser();
  // Confirm all data is fetched before attempting to do any processing
  const isFetched = isUserFetched && isHubFetched;
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState([]);
  const [editingKey, setEditingKey] = useState('');
  const {message} = App.useApp();
  const {mutate: putUser} = useHubUserCreateMutation();

  const removeUserButtonPress = keyID => {
    confirm({
      content: 'Are you sure you want to remove this user?',
      icon: <ExclamationCircleFilled />,
      okText: 'Remove User',
      okType: 'danger',
      onOk() {
        console.log('RemoveUser key: ', keyID);
      },
    });
  };

  const onSearch = value => console.log(value);

  function selectSort(a, b, selectSource) {
    const itemA = selectSource.find(item => item.id === a).name;
    const itemB = selectSource.find(item => item.id === b).name;
    return (itemA?.length ? itemA : '').localeCompare(itemB?.length ? itemB : '');
  }

  // Map users to table
  function fillUserData(data) {
    const hubs = data?.hubs?.map(hubData => hubData.id);
    return {
      key: data.id,
      name: data.name,
      email: data.email,
      admin: data.hubs[0]?.is_app_admin,
      hubs: hubs,
    };
  }

  useEffect(() => {
    setDataSource(userData?.map(fillUserData));
  }, [isFetched, userData]);

  function addRow() {
    setEditingKey(null);
    form.setFieldsValue({admin: false, email: null, key: null, hubs: []});
    setDataSource([{admin: false, email: null, key: null, name: 'Invite User', hubs: []}].concat(dataSource));
  }

  const isEditing = record => record.key === editingKey;
  const edit = record => {
    form.setFieldsValue({
      key: record.key,
      hubs: record.hubs,
      admin: record.admin,
    });
    setEditingKey(record.key);
  };
  const cancel = () => {
    if (editingKey === null) {
      setDataSource(dataSource.filter(data => data.key !== null));
    }
    setEditingKey('');
  };
  const save = async key => {
    try {
      const formData = await form.validateFields();
      const newData = [...dataSource];
      const index = newData.findIndex(item => key === item.key);
      const updateRoles = userKey => {
        if (index > -1) {
          const item = newData[index];
          newData.splice(index, 1, {
            ...item,
            ...formData,
          });
          newData[index].role.forEach(role => {
            if (!dataSource[index].role.includes(role)) {
              console.log('Add');
              const newRole = {
                hub: hubId,
                user: userKey,
                role: role,
              };
              console.log(newRole);
              addRole(
                {...newRole},
                {
                  onError: () => {
                    message.open({type: 'error', content: 'Could not update roles'});
                  },
                },
              );
            }
          });
          dataSource[index].role.forEach(role => {
            if (!newData[index].role.includes(role)) {
              console.log('Remove');
              const oldRole = {
                hub: hubId,
                user: userKey,
                role: role,
              };
              console.log(oldRole);
              delRole(
                {...oldRole},
                {
                  onError: () => {
                    message.open({type: 'error', content: 'Could not update roles'});
                  },
                },
              );
            }
          });
        }
      };
      if (key === null || formData.admin !== newData[index].admin) {
        const newUserData = {
          hub: hubId,
          user: newData[index].key,
          email: formData.email,
          is_admin: formData.admin,
        };
        putUser(
          {...newUserData},
          {
            onSuccess: data => {
              if (key === null) {
                message.open({type: 'success', content: 'User added'});
              } else {
                message.open({type: 'success', content: 'User updated'});
              }
              updateRoles(data[0].user);
            },
            onError: () => {
              message.open({type: 'error', content: 'Could not add user'});
            },
          },
        );
      } else {
        updateRoles(newData[index].key);
      }
      setDataSource(newData);
      setEditingKey('');
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  function createEditButton(item) {
    return isEditing(item) ? (
      <Space>
        <Popconfirm title="Confirm Save:" onConfirm={() => save(item.key)}>
          <Button type="link">Save</Button>
        </Popconfirm>
        <Popconfirm title="Confirm Cancel:" onConfirm={cancel}>
          <Button type="link">Cancel</Button>
        </Popconfirm>
        {editingKey === null ? null : (
          <Button danger onClick={() => removeUserButtonPress(item.key)}>
            Remove User
          </Button>
        )}
      </Space>
    ) : (
      <Space>
        <Button type="link" disabled={editingKey !== ''} onClick={() => edit(item)}>
          Edit
        </Button>
      </Space>
    );
  }

  function createButtonGroup(item) {
    return <Space wrap={true}>{createEditButton(item)}</Space>;
  }

  function createListItem(item) {
    const selectSection = (
      <Select
        mode="multiple"
        allowClear
        disabled={editingKey !== item.key || item.admin}
        options={hubData[0].hubs}
        fieldNames={{label: 'name', value: 'id'}}
        value={item.hubs}
        size="default"
        placeholder="Select hubs here"
        onChange={(value, option) => value.sort((a, b) => selectSort(a, b, option))}
        style={{
          width: '100%',
        }}
      />
    );
    const titleSwitch = (
      <Space align="center">
        <Typography>{item.name}</Typography>
        {item.admin ? <Tag color="red">Admin</Tag> : null}
      </Space>
    );
    const descriptionSwitch =
      editingKey === null && editingKey === item.key ? (
        <Form.Item
          label="Email"
          name="email"
          rules={[
            {
              type: 'email',
              message: 'Please enter a valid email',
            },
            {
              required: true,
              message: 'Please enter a valid email',
            },
          ]}
        >
          <Input placeholder="Insert Email here" size="middle" />
        </Form.Item>
      ) : (
        <Typography.Text type="secondary">{item.email}</Typography.Text>
      );
    const formSwitch =
      editingKey !== item.key ? (
        selectSection
      ) : (
        <Form.Item name="hubs" rules={[{type: 'array'}]}>
          {selectSection}
        </Form.Item>
      );
    return (
      <List.Item key={item.id} actions={[createButtonGroup(item)]}>
        <List.Item.Meta title={titleSwitch} description={descriptionSwitch} />
        {formSwitch}
      </List.Item>
    );
  }

  return (
    <>
      <Space>
        <Search placeholder="input search text" onSearch={onSearch} enterButton />
        <Button
          disabled={dataSource?.findIndex(user => user.key === null) > -1}
          type="primary"
          onClick={() => addRow()}
          icon={<PlusOutlined />}
        >
          Invite
        </Button>
      </Space>
      <Form form={form} size="small">
        <List
          // columns={columns}
          itemLayout="vertical"
          dataSource={dataSource}
          pagination={{
            position: 'both',
            align: 'center',
            showSizeChanger: true,
            showQuickJumper: true,
            defaultPageSize: 20,
            defaultCurrent: 1,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} Users`,
          }}
          renderItem={item => createListItem(item)}
          scroll={{x: 'max-content'}}
        />
      </Form>
    </>
  );
};

Component.displayName = 'AllUserManagement';
