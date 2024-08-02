import {Button, Collapse, Empty, Flex, Form, Input, InputNumber, Segmented, Select, Switch, Tooltip} from 'antd';
import Icon from 'components/atoms/Icon';
import {capitaliseString} from 'utils/string';

export const DataZoomFormList = props => {
  const {name: listName} = props;
  const form = Form.useFormInstance();
  const AxisOptions = Form.useWatch(
    values => ({
      yAxis: values?.option?.yAxis?.map(({name, type}, index) => ({label: name || `${index}-${type}`, value: index})),
      xAxis: values?.option?.xAxis?.map(({name, type}, index) => ({label: name || `${index}-${type}`, value: index})),
    }),
    form,
  );

  return (
    <Form.List name={[...listName]}>
      {(fields, {add, remove}) => {
        fields = Array.isArray(fields) ? fields : [fields];
        const items = fields.map((field, index) => {
          const path = [...listName, field.name];
          const {type, orient} = form.getFieldValue(path);
          return {
            key: field.key,
            label: (
              <Flex justify={'space-between'}>
                <div>{field.name}</div>
                <div>{capitaliseString(type)}</div>
              </Flex>
            ),
            children: (
              <>
                <Form.Item hidden label={'ID'} name={[field.name, 'id']}>
                  <Input type={'hidden'} />
                </Form.Item>
                <Form.Item label={'Type'} name={[field.name, 'type']}>
                  <Select
                    options={[
                      {value: 'inside', label: 'Inside'},
                      {value: 'slider', label: 'Slider'},
                    ]}
                  />
                </Form.Item>
                {
                  {
                    inside: (
                      <>
                        <Form.Item label={'Disabled'} name={[field.name, 'disabled']} valuePropName={'checked'}>
                          <Switch />
                        </Form.Item>
                        <Form.Item
                          label={'Zoom with Mouse Wheel'}
                          name={[field.name, 'zoomOnMouseWheel']}
                          valuePropName={'checked'}
                        >
                          <Switch />
                        </Form.Item>
                        <Form.Item
                          label={'Move with Mouse Move'}
                          name={[field.name, 'moveOnMouseMove']}
                          valuePropName={'checked'}
                        >
                          <Switch />
                        </Form.Item>
                        <Form.Item
                          label={'Move with Mouse Wheel'}
                          name={[field.name, 'moveOnMouseWheel']}
                          valuePropName={'checked'}
                        >
                          <Switch />
                        </Form.Item>
                      </>
                    ),
                    slider: (
                      <>
                        <Form.Item label={'Show'} name={[field.name, 'show']} valuePropName={'checked'}>
                          <Switch />
                        </Form.Item>
                        <Form.Item label={'Realtime'} name={[field.name, 'realtime']} valuePropName={'checked'}>
                          <Switch />
                        </Form.Item>
                        <Flex justify={'space-between'}>
                          <Form.Item label={'Start'} name={[field.name, 'start']}>
                            <InputNumber min={0} max={100} />
                          </Form.Item>
                          <Form.Item label={'End'} name={[field.name, 'end']}>
                            <InputNumber min={0} max={100} />
                          </Form.Item>
                        </Flex>
                      </>
                    ),
                  }[type]
                }
                <Form.Item label={'Zoom Axis'} name={[field.name, 'orient']}>
                  <Segmented
                    options={[
                      {label: 'X Axis', value: 'horizontal'},
                      {label: 'Y Axis', value: 'vertical'},
                    ]}
                    block
                  />
                </Form.Item>
                {
                  {
                    horizontal: (
                      <Form.Item label={'X Axis'} name={[field.name, 'xAxisIndex']}>
                        <Select options={AxisOptions?.xAxis} mode={'multiple'} />
                      </Form.Item>
                    ),
                    vertical: (
                      <Form.Item label={'Y Axis'} name={[field.name, 'yAxisIndex']}>
                        <Select options={AxisOptions?.yAxis} mode={'multiple'} />
                      </Form.Item>
                    ),
                  }[orient]
                }
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
                onClick={() => add({type: 'slider'})}
              />
            </Tooltip>
          </Flex>
        );
      }}
    </Form.List>
  );
};

export default DataZoomFormList;
