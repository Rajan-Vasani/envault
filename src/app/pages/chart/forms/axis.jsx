import {Button, Collapse, Empty, Flex, Form, Input, InputNumber, Segmented, Select, Switch, Tooltip} from 'antd';
import Icon from 'components/atoms/Icon';
import TimeRange from 'components/molecules/TimeRange';
import dayjs from 'dayjs';
import {capitaliseString} from 'utils/string';
import {parseTimeFrom} from 'utils/time';

export const AxisFormList = props => {
  const {name: listName} = props;
  const form = Form.useFormInstance();

  // input: Axis TimeRange
  const getAxisTimeRangeValueProps = props => {
    const {min, max} = props;
    const value = {
      from: min ? parseTimeFrom({from: min, to: max}) : null,
      to: max ? dayjs(max) : null,
    };
    return {value};
  };
  // output: Axis TimeRange
  const getAxisTimeRangeValueFromEvent = props => {
    const {
      value: {from, to, delta},
      path,
    } = props;
    const values = {
      min: to ? from.valueOf() : delta.join(''),
      max: to ? to.valueOf() : undefined,
    };
    form.setFields([
      {name: [...path, 'min'], value: values.min},
      {name: [...path, 'max'], value: values.max},
    ]);
    return values.min;
  };

  return (
    <Form.List name={[...listName]}>
      {(fields, {add, remove}) => {
        fields = Array.isArray(fields) ? fields : [fields];
        const items = fields.map((field, index) => {
          const path = [...listName, field.name];
          const {name, type, min, max} = form.getFieldValue(path);
          return {
            key: field.key,
            label: (
              <Flex justify={'space-between'}>
                <div>{name || field.name}</div>
                <div>{capitaliseString(type)}</div>
              </Flex>
            ),
            children: (
              <>
                <Form.Item hidden label={'ID'} name={[field.name, 'id']}>
                  <Input type={'hidden'} />
                </Form.Item>
                <Form.Item label={'Name'} name={[field.name, 'name']}>
                  <Input allowClear />
                </Form.Item>
                <Form.Item label={'Type'} name={[field.name, 'type']}>
                  <Select
                    options={[
                      {value: 'time', label: 'Time'},
                      {value: 'value', label: 'Value'},
                      {value: 'category', label: 'Category'},
                      {value: 'log', label: 'Log'},
                    ]}
                  />
                </Form.Item>
                {type === 'time' ? (
                  <>
                    <Form.Item
                      label={'Time'}
                      name={[field.name, 'min']}
                      getValueProps={value => getAxisTimeRangeValueProps({value, path, min, max})}
                      getValueFromEvent={value => getAxisTimeRangeValueFromEvent({value, path})}
                    >
                      <TimeRange />
                    </Form.Item>
                    <Form.Item hidden label={'Max'} name={[field.name, 'max']}>
                      <Input type={'hidden'} />
                    </Form.Item>
                  </>
                ) : (
                  <Flex justify={'space-between'}>
                    <Form.Item label={'Min'} name={[field.name, 'min']}>
                      <InputNumber />
                    </Form.Item>
                    <Form.Item label={'Max'} name={[field.name, 'max']}>
                      <InputNumber />
                    </Form.Item>
                  </Flex>
                )}
                {path.includes('yAxis') ? (
                  <Form.Item label={'Position'} name={[field.name, 'position']}>
                    <Segmented
                      options={[
                        {label: 'Left', value: 'left'},
                        {label: 'Right', value: 'right'},
                      ]}
                      block
                    />
                  </Form.Item>
                ) : (
                  <Form.Item label={'Position'} name={[field.name, 'position']}>
                    <Segmented
                      options={[
                        {label: 'Top', value: 'top'},
                        {label: 'Bottom', value: 'bottom'},
                      ]}
                      block
                    />
                  </Form.Item>
                )}
                <Form.Item label={'Invert'} name={[field.name, 'inverse']} valuePropName={'checked'}>
                  <Switch />
                </Form.Item>
              </>
            ),
            extra: (
              <Tooltip title={'Remove Axis'}>
                <Button
                  size={'small'}
                  type="text"
                  icon={<Icon icon="CloseOutlined" type={'ant'} />}
                  onClick={() => remove(index)}
                />
              </Tooltip>
            ),
          };
        });

        return (
          <Flex vertical gap={'small'}>
            {items.length ? (
              <Collapse size={'small'} items={items} />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={false} />
            )}
            <Tooltip title={'Add Axis'}>
              <Button
                type={'dashed'}
                icon={<Icon icon={'PlusOutlined'} type={'ant'} />}
                block
                onClick={() => add({type: 'value'})}
              />
            </Tooltip>
          </Flex>
        );
      }}
    </Form.List>
  );
};

export default AxisFormList;
