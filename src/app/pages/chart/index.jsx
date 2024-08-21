import {useDndMonitor} from '@dnd-kit/core';
import {App, Button, Layout} from 'antd';
import {findDescendants} from 'app/utils/tree';
import {DraggableOverlay} from 'components/draggable/overlay';
import {Droppable} from 'components/droppable';
import {useNode} from 'hooks/useNode';
import {useNodeContext} from 'layouts/node/context';
import ChartLoader from 'pages/chart/components/loader';
import {baseGlobal} from 'pages/chart/config';
const {Content} = Layout;

export const Component = props => {
  const {nodeParams, mergeNodeParams} = useNodeContext();
  const {data: tree} = useNode();
  const {notification} = App.useApp();
  const acceptedTypes = ['series', 'group'];

  //dnd-kit
  const handleLargeGroup = series => {
    const key = `warning-${Date.now()}`;
    return notification.warning({
      message: 'Warning',
      description: (
        <>
          This action will load <b>{series.length}</b> series nodes, this could result in long load times
        </>
      ),
      key,
      duration: 0,
      btn: (
        <Button
          onClick={() => {
            mergeNodeParams({config: {option: {series: series}}});
            notification.destroy(key);
          }}
        >
          Continue
        </Button>
      ),
    });
  };
  const handleRejectedType = (rejectedType, acceptedTypes) => {
    const key = `error-${Date.now()}`;
    return notification.error({
      message: 'Error',
      description: (
        <>
          This node type can not be added to <b>{rejectedType}</b>, please choose <b>{acceptedTypes.join(' or ')}</b>
        </>
      ),
      key,
    });
  };
  useDndMonitor({
    onDragEnd({active, over}) {
      if (!over) {
        return;
      }
      const {type, id, name} = active.data.current;
      const {accepts} = over.data.current;
      if (accepts.includes(type)) {
        if (type === 'group') {
          const descendants = findDescendants(tree, id);
          const series = descendants.filter(node => node.type === 'series');
          const chartSeries = series.map(s => ({
            id: s.id,
            name: s.name,
            type: nodeParams.config?.global?.type || baseGlobal.type,
          }));
          if (chartSeries.length > 10) {
            handleLargeGroup(series);
          }
          return mergeNodeParams({config: {option: {series: chartSeries}}});
        }
        return mergeNodeParams({
          config: {option: {series: [{id, name, type: nodeParams.config?.global?.type || baseGlobal.type}]}},
        });
      }
      handleRejectedType(type, accepts);
    },
  });

  return (
    <>
      <Droppable key={'chart-droppable'} id={'chart-droppable'} acceptedTypes={acceptedTypes}>
        <ChartLoader />
      </Droppable>
      <DraggableOverlay />
    </>
  );
};
Component.displayName = 'Chart';
