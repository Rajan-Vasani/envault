import {useQueryClient} from '@tanstack/react-query';
import {App, Button, Col, Form, Input, Row, Select} from 'antd';
import {API_QUERY} from 'app/constant/query';
import {useRoleKeyPutMutation} from 'app/services/hooks/useKeys';
import {useState} from 'react';

const KeyUpdate = props => {
  const [form] = Form.useForm();
  const {keyDetails, roleData, isEdit, setKey} = props;
  const [selectedRole, setSelectedRole] = useState(keyDetails.id);
  const [roleDescription, setRoleDescription] = useState(keyDetails.description);
  const [loading, setLoading] = useState();
  const {message} = App.useApp();
  const {mutate: saveKey} = useRoleKeyPutMutation();
  const queryClient = useQueryClient();

  function createOptionsFromData(data, textName, valueName) {
    return {
      label: data[textName],
      value: data[valueName],
    };
  }

  const roleOptions = roleData.map(data => createOptionsFromData(data, 'name', 'id'));

  const onFinish = values => {
    setLoading(true);
    const keyData = {
      hub: globalThis.envault.hub,
      key: keyDetails.key,
      ...values,
    };
    saveKey(
      {...keyData},
      {
        onSuccess: () => {
          message.open({type: 'success', content: `Key ${!keyDetails?.id ? 'created' : 'updated'}`});
          queryClient.invalidateQueries({queryKey: [API_QUERY.GET_HUB_API_KEY, globalThis.envault.hub]});
          queryClient.invalidateQueries({queryKey: [API_QUERY.GET_ROLE_HUB, globalThis.envault.hub]});
          setTimeout(() => setKey(false), 500);
        },
        onError: () => {
          message.open({type: 'error', content: 'Could not create key'});
        },
        onSettled: () => {
          setLoading(false);
        },
      },
    );
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
          >
            <Form.Item
              label="Role"
              name="role"
              initialValue={selectedRole}
              rules={[
                {
                  required: true,
                  message: 'Please select a Role',
                },
              ]}
            >
              <Select
                options={roleOptions}
                placeholder="Select a Role"
                showSearch
                onChange={role => {
                  setSelectedRole(role);
                }}
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              />
            </Form.Item>
            <Form.Item
              label="Description"
              name="description"
              initialValue={roleDescription}
              rules={[
                {
                  message: 'Please give a description of the Key being generated',
                },
              ]}
            >
              <Input
                placeholder="Device Name / Description"
                onChange={input => {
                  setRoleDescription(input);
                }}
              />
            </Form.Item>
            <Form.Item wrapperCol={{offset: 8, span: 8}}>
              <Button type="primary" htmlType="submit" disabled={!isEdit} loading={loading}>
                {keyDetails?.id ? 'Save' : 'Create'} Key
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </>
  );
};

export default KeyUpdate;
