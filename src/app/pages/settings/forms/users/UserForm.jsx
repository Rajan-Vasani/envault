import {useQueryClient} from '@tanstack/react-query';
import {App, Button, Col, Form, Input, Row, Select, Switch} from 'antd';
import {API_QUERY} from 'app/constant/query';
import {useHubUserNewMutation, useHubUserUpdateMutation} from 'hooks/useHub';
import {useRoleMemberDeleteMutation, useRoleMemberPutMutation} from 'hooks/useRole';
import {useState} from 'react';

const UserForm = props => {
  const [form] = Form.useForm();
  const {user, roleData = [], isEdit, setUser} = props;
  const {roles: initRole = []} = user;
  const [loading, setLoading] = useState();
  const {message} = App.useApp();
  const {mutate: putUser} = useHubUserNewMutation();
  const {mutate: updateUser} = useHubUserUpdateMutation();
  const {mutate: addRole} = useRoleMemberPutMutation();
  const {mutate: delRole} = useRoleMemberDeleteMutation();
  const queryClient = useQueryClient();

  const updateRoles = roles => {
    const {id} = user;
    roles.forEach(role => {
      if (!initRole.includes(role)) {
        const newRole = {
          hub: globalThis.envault.hub,
          user: id,
          role: role,
        };
        addRole(
          {...newRole},
          {
            onSuccess: () => {
              message.open({type: 'success', content: 'Roles updated'});
            },
            onError: () => {
              message.open({type: 'error', content: 'Could not update roles'});
            },
            onSettled: () => {
              queryClient.invalidateQueries({queryKey: [API_QUERY.GET_ROLE_MEMBER, globalThis.envault.hub]});
            },
          },
        );
      }
    });
    initRole.forEach(role => {
      if (!roles.includes(role)) {
        const oldRole = {
          hub: globalThis.envault.hub,
          user: id,
          role: role,
        };
        delRole(
          {...oldRole},
          {
            onSettled: () => {
              queryClient.invalidateQueries({queryKey: [API_QUERY.GET_ROLE_MEMBER, globalThis.envault.hub]});
            },
          },
        );
      }
    });
  };

  const onFinish = values => {
    const {roles, ...rest} = values;
    setLoading(true);
    if (!user?.id) {
      message.open({type: 'infor', content: 'Adding user...'});
      putUser(
        {...rest, hub: globalThis.envault.hub},
        {
          onSuccess: data => {
            message.open({type: 'success', content: 'User saved'});
            queryClient.invalidateQueries({queryKey: [API_QUERY.GET_HUB_USER, globalThis.envault.hub]});
            if (roles?.length) {
              roles.forEach(role => {
                const newRole = {
                  hub: globalThis.envault.hub,
                  user: data?.id,
                  role: role,
                };
                addRole(
                  {...newRole},
                  {
                    onSuccess: () => {
                      message.open({
                        type: 'success',
                        content: 'User roles updated successful!',
                      });
                      setTimeout(() => setUser(false), 500);
                    },
                    onError: () => {
                      message.open({type: 'error', content: 'Could not update roles'});
                    },
                  },
                );
              });
            }
          },
          onError: () => {
            message.open({type: 'error', content: 'Could not add user'});
          },
          onSettled: () => {
            setLoading(false);
          },
        },
      );
    } else {
      message.open({type: 'infor', content: 'Updating user...'});
      if (!(user.email === values.email && user.role === values.role && user.is_admin === values.is_admin)) {
        updateUser(
          {...rest, hub: globalThis.envault.hub, id: user?.id},
          {
            onSuccess: data => {
              message.open({type: 'success', content: 'User saved'});
              queryClient.invalidateQueries({queryKey: [API_QUERY.GET_HUB_USER, globalThis.envault.hub]});
              setLoading(false);
              setTimeout(() => setUser(false), 500);
            },
            onError: () => {
              message.open({type: 'error', content: 'Could not update user'});
            },
          },
        );
      }
      updateRoles(roles);
    }
    setLoading(false);
  };

  return (
    <>
      <Row justify="center">
        <Col xs={{span: 22}} sm={{span: 16}}>
          <Form
            form={form}
            onFinish={onFinish}
            labelCol={{span: 8}}
            wrapperCol={{span: 16}}
            labelWrap={true}
            disabled={!isEdit}
            initialValues={user}
          >
            {user?.name && (
              <Form.Item label="Name">
                <Input placeholder="Name" value={user?.name} disabled />
              </Form.Item>
            )}
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  message: 'Email is required',
                },
              ]}
            >
              <Input placeholder="Email" disabled={user?.id} />
            </Form.Item>
            <Form.Item label="Roles" name="roles">
              <Select
                mode="multiple"
                allowClear
                options={roleData}
                fieldNames={{label: 'name', value: 'id'}}
                size="default"
                placeholder="Select roles here"
              />
            </Form.Item>
            <Form.Item label="Admin" name="is_admin" valuePropName={'checked'} style={{marginBottom: '0px'}}>
              <Switch />
            </Form.Item>
            <Form.Item wrapperCol={{offset: 8, span: 8}}>
              <Button type="primary" htmlType="submit" disabled={!isEdit} loading={loading}>
                {user?.id ? 'Save' : 'Invite'} User
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </>
  );
};

export default UserForm;
