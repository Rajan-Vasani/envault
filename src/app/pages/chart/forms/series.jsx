import {Button, Cascader, Collapse, Divider, Empty, Flex, Form, Input, Popover, Select, Tooltip} from 'antd';
import Icon from 'components/atoms/Icon';
import {useNestedNodeFilter, useNodeFilter} from 'hooks/useNode';
import {mapTypeOptions} from 'pages/chart/config';
import {ChartTypeConfig} from 'pages/chart/forms';
import {useState} from 'react';
import {findAncestors} from 'utils/tree';

export const SeriesFormList = props => {
  const {name: listName} = props;
  const form = Form.useFormInstance();
  const {data: tree = []} = useNodeFilter({filters: ['series', 'group']});
  const {data: nestedTree = []} = useNestedNodeFilter({filters: ['series', 'group']});
  const [seriesSelectorOpen, setSeriesSelectorOpen] = useState(false);
  const AxisOptions = Form.useWatch(
    values => ({
      yAxis: values?.option?.yAxis?.map(({name, type}, index) => ({label: name || `${index}-${type}`, value: index})),
      xAxis: values?.option?.xAxis?.map(({name, type}, index) => ({label: name || `${index}-${type}`, value: index})),
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
          const {id, name, type, coordinateSystem} = form.getFieldValue([...listName, field.name]);
          const series = tree.find(node => node.id === id);
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
                <Form.Item label={'Name'} name={[field.name, 'name']}>
                  <Input allowClear placeholder={series?.name} />
                </Form.Item>
                <Form.Item
                  label={'Series'}
                  name={[field.name, 'id']}
                  getValueProps={getCascaderValueProps}
                  normalize={normalizeCascader}
                >
                  <Cascader options={nestedTree} showSearch fieldNames={{label: 'name', value: 'id'}} />
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

        const addSeries = series => {
          setSeriesSelectorOpen(false);
          add({id: series.pop(), type: 'line'});
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
