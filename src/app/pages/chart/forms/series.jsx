import {Button, Cascader, Collapse, Divider, Empty, Flex, Form, Input, Popover, Select, Tag, Tooltip} from 'antd';
import Icon from 'components/atoms/Icon';
import {useNestedNodeFilter, useNodeFilter} from 'hooks/useNode';
import {initSeries, mapTypeOptions} from 'pages/chart/config';
import {ChartTypeConfig} from 'pages/chart/forms';
import {useState} from 'react';
import {findAncestors} from 'utils/tree';

export const SeriesFormList = props => {
  const {name: listName} = props;
  const form = Form.useFormInstance();
  const {data: tree = []} = useNodeFilter({filters: ['series', 'device', 'group']});
  const {data: nestedTree = []} = useNestedNodeFilter({filters: ['series', 'device', 'group']});
  const [seriesSelectorOpen, setSeriesSelectorOpen] = useState(false);
  const AxisOptions = Form.useWatch(
    values => ({
      yAxis: values?.option?.yAxis?.map(({name, type}, index) => ({
        label: name || `${type} (${index})`,
        value: index,
      })),
      xAxis: values?.option?.xAxis?.map(({name, type}, index) => ({
        label: name || `${type} (${index})`,
        value: index,
      })),
    }),
    form,
  );

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
      form.setFieldValue([...listName, [fieldName]], {node: {id, type, name, sensor}});
      return values;
    }
  };
  // output: Tree Cascader
  const normalizeCascader = value => {
    if (value) {
      return value.pop();
    }
  };

  const coordinateSystemOptions = [
    {label: 'Cartesian', value: 'cartesian2d'},
    {label: 'Polar', value: 'polar'},
  ];

  return (
    <Form.List name={[...listName]}>
      {(fields, {add, remove}) => {
        const items = fields.map((field, index) => {
          const {node, name, type, coordinateSystem} = form.getFieldValue([...listName, field.name]);
          const series = tree.find(item => item.id === node.id);
          return {
            key: field.key,
            label: (
              <Flex justify={'space-between'}>
                {name || series?.name}
                {mapTypeOptions.find(option => option.value === type).label}
              </Flex>
            ),
            children: (
              <>
                <Form.Item label={'Type'} name={[field.name, 'type']}>
                  <Select options={mapTypeOptions} />
                </Form.Item>
                <Form.Item label={'Name'} name={[field.name, 'name']} initialValue={series?.name}>
                  <Input allowClear />
                </Form.Item>
                <Form.Item
                  label={'Series'}
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
                      return ['series', 'device'].includes(type) ? (
                        <span key={index}>
                          {name} <Tag>{type}</Tag>
                        </span>
                      ) : (
                        name
                      );
                    }}
                  />
                </Form.Item>
                {series?.type === 'device' && (
                  <Form.Item
                    label={'Sensor'}
                    name={[field.name, 'node', 'sensor']}
                    initialValue={series?.name}
                    rules={[{required: true, message: 'Sensor name required'}]}
                  >
                    <Input />
                  </Form.Item>
                )}
                <Form.Item hidden name={[field.name, 'node', 'type']} initialValue={series?.type}>
                  <Input type={'hidden'} />
                </Form.Item>
                <Divider orientation={'left'} type={'horizontal'} plain>
                  Advanced
                </Divider>
                <Form.Item label={'Coordinate'} name={[field.name, 'coordinateSystem']}>
                  <Select options={coordinateSystemOptions} />
                </Form.Item>
                {
                  {
                    polar: (
                      <Form.Item label={'Polar Axis'} name={[field.name, 'xAxisIndex']}>
                        <Select options={AxisOptions?.xAxis} />
                      </Form.Item>
                    ),
                    cartesian2d: (
                      <>
                        <Form.Item label={'Y Axis'} name={[field.name, 'yAxisIndex']}>
                          <Select options={AxisOptions?.yAxis} />
                        </Form.Item>
                        <Form.Item label={'X Axis'} name={[field.name, 'xAxisIndex']}>
                          <Select options={AxisOptions?.xAxis} />
                        </Form.Item>
                      </>
                    ),
                  }[coordinateSystem]
                }
                <ChartTypeConfig type={type} path={[field.name]} />
              </>
            ),
            extra: (
              <Tooltip title={'Remove Series'}>
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

        const addSeries = (series, options) => {
          const {id, name, type} = options[options.length - 1];
          setSeriesSelectorOpen(false);
          add({node: {id, name, type}, name, ...initSeries['line']});
        };

        return (
          <Flex vertical gap={'small'}>
            {items.length ? (
              <Collapse size={'small'} items={items} />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={false} />
            )}
            <Tooltip title={'Add Series'}>
              <Popover
                open={seriesSelectorOpen}
                content={
                  <Cascader.Panel
                    placeholder={'Add Series...'}
                    options={nestedTree}
                    showSearch
                    fieldNames={{label: 'name', value: 'id'}}
                    onChange={addSeries}
                  />
                }
                title={'Select series'}
                trigger={'click'}
                placement={'bottom'}
                onClick={() => setSeriesSelectorOpen(open => !open)}
              >
                <Button
                  danger={seriesSelectorOpen}
                  type={'dashed'}
                  icon={<Icon icon={seriesSelectorOpen ? 'CloseOutlined' : 'PlusOutlined'} type={'ant'} />}
                  block
                />
              </Popover>
            </Tooltip>
          </Flex>
        );
      }}
    </Form.List>
  );
};

export default SeriesFormList;
