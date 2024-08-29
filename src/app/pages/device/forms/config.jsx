import {App, Collapse, Descriptions, Flex, Form, Input, Select, Typography} from 'antd';
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
  const {type, eui, key} = Form.useWatch('driver', {form, preserve: true}) ?? {};

  useEffect(() => {
    setForm(form);
    return () => setForm(null);
  }, [form, setForm]);

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
                    <Collapse
                      size={'small'}
                      items={[
                        {
                          key: 'API',
                          label: 'Rest API',
                          children: (
                            <Descriptions
                              bordered
                              column={1}
                              items={[
                                {
                                  key: 'Host',
                                  label: 'Hostname',
                                  children: <Text copyable>https://api.envault.io/device/{eui}/uplink</Text>,
                                },
                                {
                                  key: 'Headers',
                                  label: 'Headers',
                                  children: (
                                    <Flex vertical gap={'small'}>
                                      <Text copyable>X-Api-Key: {key}</Text>
                                      <Text copyable>Accept-Version: latest</Text>
                                    </Flex>
                                  ),
                                },
                              ]}
                            />
                          ),
                        },
                        {
                          key: 'MQTT',
                          label: 'MQTT',
                          children: (
                            <Descriptions
                              bordered
                              column={1}
                              items={[
                                {
                                  key: 'host',
                                  label: 'Hostname',
                                  children: (
                                    <Flex vertical gap={'small'}>
                                      <Text copyable>mqtt://mqtt.envault.io:1883</Text>
                                      <Text copyable>mqtts://mqtt.envault.io:8883</Text>
                                    </Flex>
                                  ),
                                },
                                {
                                  key: 'topic',
                                  label: 'Topic',
                                  children: <Text copyable>device/{eui}/uplink</Text>,
                                },
                                {
                                  key: 'Username',
                                  label: 'Username',
                                  children: <Text copyable>{eui}</Text>,
                                },
                                {
                                  key: 'Password',
                                  label: 'Password',
                                  children: <Text copyable>{key}</Text>,
                                },
                              ]}
                            />
                          ),
                        },
                        {
                          key: 'FTP',
                          label: 'FTP',
                          children: (
                            <Descriptions
                              bordered
                              column={1}
                              items={[
                                {
                                  key: 'Host',
                                  label: 'Hostname',
                                  children: <Text copyable>ftp://ftp.envault.io:21</Text>,
                                },
                                {
                                  key: 'Directory',
                                  label: 'Directory',
                                  children: <Text copyable>device/{nodeAttrs?.id}/uplink/</Text>,
                                },
                                {
                                  key: 'Username',
                                  label: 'Username',
                                  children: <Text copyable>{eui}</Text>,
                                },
                                {
                                  key: 'Password',
                                  label: 'Password',
                                  children: <Text copyable>{key}</Text>,
                                },
                              ]}
                            />
                          ),
                        },
                      ]}
                    />
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
