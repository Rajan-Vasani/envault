import {Checkbox, Form, Input, Select} from 'antd';
import {useEffect, useState} from 'react';

const DeviceSchemaInput = ({deviceConfigName, deviceSchemaConfig, name}) => {
  const {type, enum: formatEnum, description} = deviceSchemaConfig || {};
  let inputElement;
  if (formatEnum) {
    inputElement = <Select showSearch options={formatEnum.map(option => ({label: option, value: option}))} />;
  } else {
    switch (type) {
      case 'array':
        inputElement = <Select mode="tags" placeholder="Add multiple item" />;
        break;
      case 'string':
        inputElement = <Input placeholder={description} />;
        break;
      case 'boolean':
        inputElement = <Checkbox />;
        break;
      default:
        inputElement = <Input />;
    }
  }

  return (
    <Form.Item label={deviceConfigName} name={[...name, deviceConfigName]} labelCol={{style: {width: 100}}}>
      {inputElement}
    </Form.Item>
  );
};

export const DeviceInput = props => {
  const {formName = [], name, data = {}} = props;
  const form = Form.useFormInstance();
  const type = Form.useWatch(['actions', ...formName, ...name, 'type'], {form, preserve: true});
  const [deviceSchema, setDeviceSchema] = useState();

  const deviceList =
    data?.anyOf?.map(device => ({
      value: device?.properties?.type?.const,
      label: device?.properties?.type?.const,
    })) || [];

  useEffect(() => {
    setDeviceSchema(data?.anyOf?.find(device => device.properties.type.const === type));
  }, [type, data]);

  const handleDeviceChange = value => {
    setDeviceSchema(data?.anyOf.find(device => device.properties.type.const === value));
  };

  return (
    <>
      <Form.Item name={[...name, 'type']} label={'Device type'} labelCol={{style: {width: 100}}}>
        <Select
          placeholder="Please select an device"
          style={{width: '100%'}}
          options={deviceList}
          onChange={handleDeviceChange}
        />
      </Form.Item>
      {deviceSchema &&
        Object.keys(deviceSchema?.properties).map(key => {
          if (key === 'type') return null;
          return (
            <DeviceSchemaInput
              key={key}
              deviceConfigName={key}
              deviceSchemaConfig={deviceSchema?.properties[key]}
              name={name}
            />
          );
        })}
    </>
  );
};
