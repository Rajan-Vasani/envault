import {SearchOutlined} from '@ant-design/icons';
import {Collapse, Divider, Flex, Form, Input, Segmented, Space, TreeSelect} from 'antd';
import {useTheme} from 'antd-style';
import FormItem from 'antd/es/form/FormItem';
import {StreamIndicator} from 'app/components/atoms/StreamIndicator';
import TimeRange from 'app/components/molecules/TimeRange';
import {useTimeRange} from 'app/services/hooks/useTimeRange';
import {useNestedNodeFilter, useNodeFilter} from 'hooks/useNode';
import {cloneDeep} from 'lodash';
import ChartBuilder from 'pages/chart/components/builder';
import {useContext, useEffect, useMemo, useState} from 'react';
import ChartContext from '../context';

export const SeriesConfig = props => {
  const {setForm, node, disabled} = props;
  const {
    userConfig,
    eventState,
    handleStreamStateChange,
    setUserConfig,
    selectedNodes,
    setTimeRange,
    previousData,
    isEdit,
    setSelectedNodes,
  } = useContext(ChartContext);
  const {data: tree = []} = useNestedNodeFilter({filters: ['series', 'group']});
  const {data: allSeries = []} = useNodeFilter({filters: ['series']});
  const theme = useTheme();
  const initTimeRange = useTimeRange(previousData);
  const [form] = Form.useForm();

  const [isGlobal, setIsGlobal] = useState(true);

  useEffect(() => {
    setForm(form);
  }, [form, setForm]);

  const handleNodeChange = node => {
    const selectedIdArray = node.map(s => s.value);
    const selectedSeries = allSeries.filter(s => selectedIdArray.includes(s.id));
    setSelectedNodes(selectedSeries);
  };

  const overrides = useMemo(() => {
    if (userConfig) {
      return Object.keys(userConfig).filter(value => selectedNodes.some(node => node.id == value));
    }
    return [];
  }, [userConfig, selectedNodes]);

  const changeOverrides = (newOverrides, extra) => {
    if (extra?.preValue?.length > newOverrides?.length) {
      const newConfig = cloneDeep(userConfig);
      delete newConfig[extra?.triggerValue];
      setUserConfig(newConfig);
    } else if (extra?.preValue?.length < newOverrides?.length) {
      const globalConfigArray = Object.entries(userConfig)?.filter(
        value => !selectedNodes.some(node => node.id == value[0]),
      );
      const globalConfig = Object.fromEntries(globalConfigArray);
      const newConfig = cloneDeep(userConfig);
      newConfig[extra?.triggerValue] = globalConfig;
      setUserConfig(newConfig);
    }
  };

  const handleTimeRangeChange = range => {
    form.setFieldsValue({timeRange: range});
    setTimeRange(range);
  };
  useEffect(() => {
    if (selectedNodes.length) {
      form.setFieldsValue({selectedNodes: selectedNodes.map(s => ({value: s.id, label: s.name}))});
    }
  }, [selectedNodes, form]);
  useEffect(() => {
    if (userConfig) {
      form.setFieldsValue({userConfig});
    }
  }, [userConfig, form]);

  return (
    <Space direction={'vertical'} gap="middle" style={{width: '100%'}}>
      <Flex justify="space-between" gap="middle">
        <StreamIndicator eventState={eventState} onChange={handleStreamStateChange} />
        <TimeRange value={initTimeRange} onChange={handleTimeRangeChange} />
      </Flex>
      <Form form={form} layout="vertical" name="chartConfig" requiredMark={false}>
        <Form.Item hidden name="userConfig">
          <Input />
        </Form.Item>
        <Form.Item label="Series" name="selectedNodes">
          <TreeSelect
            placeholder={
              <>
                <SearchOutlined />
                &nbsp; Add Series...
              </>
            }
            treeData={tree}
            treeDataSimpleMode={{
              id: 'id',
              pId: 'parent',
              rootPId: null,
            }}
            showSearch
            multiple
            maxTagCount={3}
            fieldNames={{value: 'id', label: 'name'}}
            treeIcon
            treeLine={true}
            listHeight={500}
            treeNodeFilterProp="name"
            labelInValue={true}
            onChange={handleNodeChange}
            style={{width: '100%'}}
            disabled={!isEdit}
          />
        </Form.Item>
        <Divider orientation={'left'} type={'horizontal'} plain>
          Mode
        </Divider>
        <Segmented
          value={isGlobal}
          options={[
            {value: true, label: 'Global'},
            {value: false, label: 'Overrides'},
          ]}
          block
          onChange={e => setIsGlobal(e)}
          disabled={!isEdit}
        />
      </Form>
      {isGlobal ? (
        <ChartBuilder isGlobal={isGlobal} userConfig={userConfig} setUserConfig={setUserConfig} />
      ) : (
        <>
          <FormItem label="Overridden">
            <TreeSelect
              treeData={selectedNodes}
              fieldNames={{label: 'name', value: 'id'}}
              treeCheckable={true}
              onChange={(value, _, extra) => changeOverrides(value, extra)}
              defaultValue={overrides.map(Number)}
            />
          </FormItem>
          {overrides.length > 0 && (
            <Collapse
              defaultActiveKey={overrides[0]}
              expandIconPosition="end"
              bordered={true}
              style={{background: theme.colorBgContainer}}
              items={overrides.map((sid, index) => ({
                key: sid,
                label: selectedNodes.find(node => node.id === +sid).name,
                children: (
                  <ChartBuilder
                    series={selectedNodes.find(node => node.id === +sid)}
                    position={index}
                    isGlobal={isGlobal}
                    userConfig={userConfig}
                    setUserConfig={setUserConfig}
                  />
                ),
              }))}
            />
          )}
        </>
      )}
    </Space>
  );
};
