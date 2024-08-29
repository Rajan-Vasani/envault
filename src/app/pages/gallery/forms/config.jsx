import {App, Button, Cascader, Collapse, Divider, Empty, Flex, Form, Input, Popover, Switch, Tag, Tooltip} from 'antd';
import Icon from 'components/atoms/Icon';
import {StreamIndicator} from 'components/atoms/StreamIndicator';
import TimeRange from 'components/molecules/TimeRange';
import {useNestedNodeFilter, useNodeFilter, useNodeSaveMutation} from 'hooks/useNode';
import {useNodeContext} from 'layouts/node/context';
import {isArray, mergeWith} from 'lodash';
import {useEffect, useState} from 'react';
import {findAncestors} from 'utils/tree';

const initialValues = {
  option: {
    timelapse: [],
  },
  global: {
    eventStream: false,
    timeRange: {
      from: '24h',
      to: null,
    },
  },
};

export const GalleryConfig = props => {
  const {setForm, disabled} = props;
  const {eventState, handleStreamStateChange} = {eventstate: '', handleStreamStateChange: () => {}}; // temporary
  const {nodeAttrs, nodeParams, updateNodeParams} = useNodeContext();
  const {data: tree = []} = useNodeFilter({filters: ['timelapse', 'device', 'group']});
  const {data: nestedTree = []} = useNestedNodeFilter({filters: ['timelapse', 'device', 'group']});
  const [form] = Form.useForm();
  const {mutate: saveNode} = useNodeSaveMutation({type: nodeAttrs.type});
  const [timelapseSelectorOpen, setTimelapseSelectorOpen] = useState(false);
  const {notification} = App.useApp();

  // const uniqLabelFromData = [...new Set(nodeParams.map(data => data?.label ?? 'Other'))];
  // const labelOptions = uniqLabelFromData.map(label => ({label: label, value: label}));
  const labelOptions = [{}];

  useEffect(() => {
    setForm(form);
    return () => setForm(null);
  }, [form, setForm]);

  useEffect(() => {
    if (nodeParams.config?.option || nodeParams.config?.global) {
      form.setFieldsValue(nodeParams.config);
    } else {
      form.setFieldsValue(initialValues);
    }
  }, [nodeParams.config, form]);

  const onFinish = values => {
    notification.info({description: 'Saving gallery  configuration'});
    const dataGallery = {
      id: nodeAttrs?.id,
      type: 'gallery',
      data: values.option.timelapse.reduce(
        (a, v, index) => ({
          ...a,
          [index]: {
            id: v.node.id,
            type: v.node.type,
          },
        }),
        {},
      ),
      config: {...nodeParams.config, ...values},
    };
    saveNode({data: dataGallery});
  };

  const onValuesChange = (changedValues, allValues) => {
    // merge objects, replace arrays
    updateNodeParams('config', previousValue =>
      structuredClone(mergeWith(previousValue, allValues, (a, b) => (isArray(b) ? b : undefined))),
    );
  };
  // Normalize input and output of form components to suit chart options
  // output: Global TimeRange
  const normalizeTimeRange = value => {
    if (value) {
      let {from, to, delta} = value;
      if (!to && delta) {
        from = delta.join('');
      } else {
        from = from?.valueOf();
        to = to?.valueOf();
      }
      return {from, to};
    }
  };
  // input: Tree Cascader
  const getCascaderValueProps = value => {
    if (value) {
      const ancestors = findAncestors(tree, value)?.reverse();
      const ancestorIds = [...ancestors.map(node => node.id), value];
      return {value: ancestorIds};
    }
  };
  // picker: Set fields on select
  const getCascaderValueFromEvent = (values, options, fieldName) => {
    const {id, type, name, sensor} = options[options.length - 1];
    if (values) {
      form.setFieldValue(['option', 'timelapse', [fieldName]], {node: {id, type, name, sensor}});
      return values;
    }
  };
  // output: Tree Cascader
  const normalizeCascader = value => {
    if (value) {
      return value.pop();
    }
  };

  return (
    <Flex vertical justify={'space-between'}>
      <Form
        form={form}
        layout={'horizontal'}
        labelAlign={'left'}
        name={`gallery-config-${nodeAttrs?.id}`}
        requiredMark={false}
        onFinish={onFinish}
        initialValues={initialValues}
        onValuesChange={onValuesChange}
        disabled={disabled}
      >
        <Form.Item label={'Stream'}>
          <Flex justify={'flex-start'} gap={'small'}>
            <Form.Item name={['global', 'eventStream']} noStyle valuePropName={'checked'}>
              <Switch />
            </Form.Item>
            <StreamIndicator eventState={eventState} onChange={handleStreamStateChange} />
          </Flex>
        </Form.Item>
        <Form.Item label={'Time'} name={['global', 'timeRange']} normalize={normalizeTimeRange}>
          <TimeRange />
        </Form.Item>
        <Divider orientation={'left'} type={'horizontal'} plain>
          Timelapse
        </Divider>
        <Form.List name={['option', 'timelapse']}>
          {(fields, {add, remove}) => {
            const items = fields.map((field, index) => {
              const {node, name} = form.getFieldValue(['option', 'timelapse', field.name]);
              const timelapse = tree.find(item => item.id === node.id);
              return {
                key: field.key,
                label: <Flex justify={'space-between'}>{name || timelapse?.name}</Flex>,
                children: (
                  <>
                    <Form.Item label={'Name'} name={[field.name, 'name']} initialValue={timelapse?.name}>
                      <Input allowClear />
                    </Form.Item>
                    <Form.Item
                      label={'Timelapse'}
                      name={[field.name, 'node', 'id']}
                      getValueProps={getCascaderValueProps}
                      getValueFromEvent={(values, options) => getCascaderValueFromEvent(values, options, field.name)}
                      normalize={normalizeCascader}
                    >
                      <Cascader
                        options={nestedTree}
                        showSearch
                        fieldNames={{label: 'name', value: 'id'}}
                        displayRender={(labels, selectedOptions) =>
                          labels.map((label, index) => {
                            const option = selectedOptions[index];
                            return index === labels.length - 1 ? (
                              <span key={index}>
                                {option.name} <Tag>{option.type}</Tag>
                              </span>
                            ) : (
                              <span key={index}>{label} / </span>
                            );
                          })
                        }
                        optionRender={({name, type}) => {
                          return ['timelapse', 'device'].includes(type) ? (
                            <span key={index}>
                              {name} <Tag>{type}</Tag>
                            </span>
                          ) : (
                            name
                          );
                        }}
                      />
                    </Form.Item>
                    {timelapse?.type === 'device' && (
                      <Form.Item
                        label={'Target'}
                        name={[field.name, 'node', 'target']}
                        initialValue={timelapse?.name}
                        rules={[{required: true, message: 'Target name required'}]}
                      >
                        <Input />
                      </Form.Item>
                    )}
                    <Form.Item hidden name={[field.name, 'node', 'type']} initialValue={timelapse?.type}>
                      <Input type={'hidden'} />
                    </Form.Item>
                  </>
                ),
                extra: (
                  <Tooltip title={'Remove Timelapse'}>
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

            const addTimelapse = (series, options) => {
              const {id, name, type} = options[options.length - 1];
              setTimelapseSelectorOpen(false);
              add({node: {id, name, type}, name});
            };

            return (
              <Flex vertical gap={'small'}>
                {items.length ? (
                  <Collapse size={'small'} items={items} />
                ) : (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={false} />
                )}
                <Tooltip title={'Add image source'}>
                  <Popover
                    open={timelapseSelectorOpen}
                    content={
                      <Cascader.Panel
                        placeholder={'Add Timelapse...'}
                        options={nestedTree}
                        showSearch
                        fieldNames={{label: 'name', value: 'id'}}
                        onChange={addTimelapse}
                      />
                    }
                    title={'Select timelapse'}
                    trigger={'click'}
                    placement={'bottom'}
                    onClick={() => setTimelapseSelectorOpen(open => !open)}
                  >
                    <Button
                      danger={timelapseSelectorOpen}
                      type={'dashed'}
                      icon={<Icon icon={timelapseSelectorOpen ? 'CloseOutlined' : 'PlusOutlined'} type={'ant'} />}
                      block
                    />
                  </Popover>
                </Tooltip>
              </Flex>
            );
          }}
        </Form.List>
      </Form>
    </Flex>
  );
};
