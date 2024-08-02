import {useDndMonitor} from '@dnd-kit/core';
import {Form} from 'antd';
import {Droppable} from 'components/droppable';
import {useNodeFilter} from 'hooks/useNode';
import DashboardContext from 'pages/dashboard/context';
import WidgetDroppable from 'pages/dashboard/widget/droppable';
import {useContext, useMemo} from 'react';
import {getDayjsRange, getRange} from 'utils/time';
import GalleryViewControl from './GalleryViewControl';

const GalleryDroppable = props => {
  const {onSelectedNode = () => {}, acceptType, id, children} = props;

  const handleDragEnd = (active, over) => {
    const currentNode = active.data.current;
    if (!over || over.id.replace('widget-droppable-', '') !== id) {
      return;
    }
    if (!over.data.current.accepts.includes(currentNode.type)) {
      alert(`Please select a ${over.data.current.accepts} node`);
      return;
    }
    if (active.id !== over.id) {
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
const GalleryControl = props => {
  const {widget} = props;
  const form = Form.useFormInstance();
  const widgetData = Form.useWatch('widgetData', {form, preserve: true});
  const {data: galleryData = []} = useNodeFilter({filters: ['gallery']});
  const {data: timelapseData = []} = useNodeFilter({filters: ['timelapse']});
  const {timeRange: globalTimeRange} = useContext(DashboardContext);

  const data = useMemo(() => {
    const currentGallery = galleryData.find(item => item.id === +widgetData?.id) ?? {};
    const newSeries = widgetData?.series ?? [];
    const {activeTimelapse, dataSource = [], timeRange, filterLabel} = currentGallery.config ?? {};

    const dayjsTimeRange =
      timeRange && timeRange?.relative?.days
        ? {...timeRange, ...getRange(Math.abs(timeRange.relative.days))}
        : getDayjsRange(timeRange);

    return {
      dataSource: [...new Set([...dataSource, ...newSeries])],
      filterLabel: filterLabel ?? 'all',
      activeTimelapse: activeTimelapse ?? newSeries[0] ?? dataSource[0],
      timeRange: dayjsTimeRange,
    };
  }, [widgetData, galleryData]);

  const handleNodeSelect = node => {
    if (node.type === 'gallery') {
      form.setFieldsValue({widgetData: {id: node.id}});
    }
    if (node.type === 'timelapse') {
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
        <WidgetDroppable onSelectedNode={handleNodeSelect} acceptType={['gallery', 'timelapse']} item={widget} />
      )}
      {widgetData && (
        <GalleryDroppable onSelectedNode={handleAddSeries} acceptType={['timelapse']} id={widget.id}>
          <GalleryViewControl
            selectedNodes={data?.dataSource?.map(id => timelapseData.find(item => item.id === id)).filter(item => item)}
            filterLabel={data.filterLabel}
            activeTimelapse={data.activeTimelapse}
            timeRange={globalTimeRange ?? data?.timeRange ?? {from: new Date(), to: ''}}
          />
        </GalleryDroppable>
      )}
    </>
  );
};

export default GalleryControl;
