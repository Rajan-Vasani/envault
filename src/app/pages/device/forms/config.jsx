import {App, Collapse, Flex, Form, Input, Select, Typography} from 'antd';
import {useNodeSaveMutation} from 'hooks/useNode';
import {useNodeContext} from 'layouts/node/context';
import {isArray, mergeWith} from 'lodash';
import {deviceTypeOptions, initialValues} from 'pages/device/config';
import {DeviceTypeConfig} from 'pages/device/forms';
import {useEffect} from 'react';
const {Text} = Typography;

export const DeviceConfig = props => {
  const {setForm, disabled} = props;
  const {nodeAttrs, nodeParams, setNodeParams} = useNodeContext();
  const [form] = Form.useForm();
  const {mutate: saveNode} = useNodeSaveMutation({type: nodeAttrs.type});
  const {notification} = App.useApp();
  const type = Form.useWatch(['driver', 'type'], {form, preserve: true});

  useEffect(() => setForm?.(form), [form, setForm]);
  useEffect(() => {
    if (nodeParams) {
      form.setFieldsValue(nodeParams);
    } else {
      form.setFieldsValue(initialValues);
    }
  }, [nodeParams, form]);

  const onFinish = values => {
    const {schedule, ...driver} = values;
    notification.info({description: 'Saving device configuration'});
    saveNode({
      id: nodeAttrs?.id,
      type: 'device',
      ...driver,
    });
  };

  const onValuesChange = (changedValues, allValues) => {
    // merge objects, replace arrays
    setNodeParams?.(previousParams =>
      structuredClone(mergeWith(previousParams, allValues, (a, b) => (isArray(b) ? b : undefined))),
    );
    console.log('nodeParams', nodeParams);
  };

  return (
    <Flex vertical justify="space-between">
      <Form
        form={form}
        layout={'vertical'}
        labelAlign="left"
        name={`device-config-${nodeAttrs?.id}`}
        requiredMark={false}
        onFinish={onFinish}
        initialValues={initialValues}
        onValuesChange={onValuesChange}
        disabled={disabled}
      >
        <Collapse
          size={'small'}
          style={{marginBottom: 16}}
          items={[
            {
              key: 'access',
              label: 'Access',
              children: (
                <>
                  <Flex gap={'small'}>
                    <Form.Item
                      label={'EUI'}
                      name={['driver', 'eui']}
                      rules={[{pattern: /^[0-9a-fA-F]{16}$/, message: 'EUI must be 16 alphanumeric characters'}]}
                      style={{flex: 1}}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      label={'Key'}
                      name={['driver', 'key']}
                      rules={[{pattern: /^[0-9a-fA-F]{16}$/, message: 'EUI must be 16 alphanumeric characters'}]}
                      style={{flex: 1}}
                    >
                      <Input />
                    </Form.Item>
                  </Flex>
                  <Form.Item label={'Endpoints'}>
                    <Flex vertical gap={'small'}>
                      <Text type={'secondary'} copyable>
                        FTP: ftp://ftp.envault.io/device/{nodeAttrs?.id}
                      </Text>
                      <Text type={'secondary'} copyable>
                        HTTP: https://api.envault.io/device-uplink?device={nodeAttrs?.id}
                      </Text>
                      <Text type={'secondary'} copyable>
                        MQTT: mqtts://mqtt.envault.io/device/{nodeAttrs?.id}/uplink
                      </Text>
                    </Flex>
                  </Form.Item>
                </>
              ),
            },
          ]}
        />

        <Form.Item label={'Type'} name={['driver', 'type']}>
          <Select options={deviceTypeOptions} />
        </Form.Item>
        <DeviceTypeConfig type={type} />
      </Form>
    </Flex>
  );
};
