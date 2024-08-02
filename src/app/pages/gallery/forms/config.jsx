import {SearchOutlined} from '@ant-design/icons';
import {Flex, Form, Input, Select, Space, TreeSelect} from 'antd';
import {StreamIndicator} from 'app/components/atoms/StreamIndicator';
import TimeRange from 'app/components/molecules/TimeRange';
import {useNodeFilter} from 'app/services/hooks/useNode';
import {useTimeRange} from 'app/services/hooks/useTimeRange';
import {useContext, useEffect} from 'react';
import GalleryContext from '../context/gallery';

export const GalleryConfig = () => {
  const {
    isEdit,
    previousData,
    filterLabel,
    activeTimelapse,
    filterLabelOptions = [],
    setFilterLabel,
    setTimeRange,
    selectedNodes,
    setSelectedNodes,
    eventState,
    handleStreamStateChange,
  } = useContext(GalleryContext);

  const [form] = Form.useForm();
  const {data: tree} = useNodeFilter({filters: ['group', 'timelapse']});
  const initTimeRange = useTimeRange(previousData);

  const handleNodeChange = node => {
    const series = node.map(id => tree.find(node => node.id === id));
    setSelectedNodes(series);
  };

  const filterLabelChange = label => {
    setFilterLabel(label);
  };

  useEffect(() => {
    form.setFieldsValue({dataSource: selectedNodes.map(node => node?.id)});
  }, [selectedNodes, form]);

  useEffect(() => {
    form.setFieldsValue({activeTimelapse: activeTimelapse});
  }, [activeTimelapse, form]);

  useEffect(() => {
    form.setFieldsValue({filterLabel: filterLabel});
  }, [filterLabel, form]);

  const handleTimeRangeChange = range => {
    form.setFieldsValue({timeRange: range});
    setTimeRange(range);
  };

  return (
    <Space direction={'vertical'} gap="large" style={{width: '100%'}}>
      <Flex justify="space-between" gap="middle">
        <StreamIndicator eventState={eventState} onChange={handleStreamStateChange} />
        <TimeRange value={initTimeRange} onChange={handleTimeRangeChange} />
      </Flex>
      <Form form={form} layout="vertical" name="galleryConfig" requiredMark={false}>
        <Form.Item label="ActiveTimelapse" hidden name={'activeTimelapse'}>
          <Input />
        </Form.Item>
        <Form.Item label="Timelapses" name={'dataSource'}>
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
            onChange={handleNodeChange}
            style={{width: '100%'}}
            disabled={!isEdit}
          />
        </Form.Item>
        <Form.Item label="Filter Label" name={'filterLabel'}>
          <Select
            showSearch
            style={{width: '100%'}}
            placeholder="All"
            options={[{label: 'All', value: 'all'}, ...filterLabelOptions]}
            onChange={filterLabelChange}
            disabled={!isEdit}
          />
        </Form.Item>
      </Form>
    </Space>
  );
};
