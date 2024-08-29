import {useDndMonitor} from '@dnd-kit/core';
import {Form} from 'antd';
import {Droppable} from 'components/droppable';
import EchartControl from 'pages/chart/widget/loader';
import {useDashboardContext} from 'pages/dashboard/context';
import WidgetDroppable from 'pages/dashboard/widget/droppable';
import {useMemo} from 'react';
import {useOutletContext} from 'react-router-dom';
import {useNode} from 'services/hooks/useNode';
import {getDayjsRange, getRange} from 'utils/time';

const initUserConfig = {};

const ChartDroppable = props => {
  const {onSelectedNode = () => {}, acceptType, id, children} = props;

  const handleDragEnd = (active, over) => {
    const currentNode = active.data.current;
    if (!over || over.id.replace('widget-droppable-', '') != id) {
      return;
    }
    if (!over.data.current.accepts.includes(currentNode.type)) {
      alert(`Please select a ${over.data.current.accepts} node`);
      return;
    }
    if (active.id != over.id) {
      onSelectedNode(currentNode);
    }
  };

  useDndMonitor({
    onDragStart() {},
    onDragMove() {},
    onDragOver() {},
    onDragEnd({active, over}) {
      handleDragEnd(active, over);
    },
    onDragCancel() {},
  });

  return (
    <Droppable key={`widget-droppable-${id}`} id={`widget-droppable-${id}`} acceptedTypes={acceptType} target={id}>
      {children}
    </Droppable>
  );
};

function ChartControl(props) {
  const {widget} = props;
  const {hub} = useOutletContext();
  const form = Form.useFormInstance();
  const widgetData = Form.useWatch('widgetData', {form, preserve: true});
  const {data: tree = []} = useNode();
  const {timeRange: globalTimeRange} = useDashboardContext();

  const data = useMemo(() => {
    const currentChart = tree.find(item => item.id === +widgetData?.id) ?? {};
    const newSeries = widgetData?.series ?? [];
    const {timeRange, userConfig = initUserConfig, dataSource = []} = currentChart?.config ?? {};

    const dayjsTimeRange =
      timeRange && timeRange?.relative?.days
        ? {...timeRange, ...getRange(Math.abs(timeRange.relative.days))}
        : getDayjsRange(timeRange);
    return {
      timeRange: dayjsTimeRange,
      userConfig: userConfig,
      dataSource: [...new Set([...dataSource.map(Number), ...newSeries])],
    };
  }, [widgetData, tree]);
  const handleNodeSelect = node => {
    if (node.type === 'chart') {
      form.setFieldsValue({widgetData: {id: node.id}});
    }
    if (node.type === 'series') {
      form.setFieldsValue({widgetData: {series: [node.id]}});
    }
  };

  const handleAddSeries = node => {
    const currentSeries = widgetData?.series ?? [];
    form.setFieldsValue({widgetData: {...widgetData, series: [...currentSeries, node.id]}});
    form.validateFields(['widgetData']);
  };

  return (
    <>
      {!widgetData && (
        <WidgetDroppable onSelectedNode={handleNodeSelect} acceptType={['chart', 'series']} item={widget} />
      )}
      {widgetData && (
        <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
          <ChartDroppable onSelectedNode={handleAddSeries} acceptType={['series']} id={widget.id}>
            <EchartControl
              hub={hub}
              nodeData={data?.dataSource
                ?.map(id => tree.find(item => item.type === 'series' && item.id == id))
                .filter(node => node)}
              timeRange={data?.timeRange ?? globalTimeRange}
              userConfig={data?.userConfig}
            />
          </ChartDroppable>
        </div>
      )}
    </>
  );
}
export default ChartControl;
