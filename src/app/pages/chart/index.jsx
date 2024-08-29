import {useDndMonitor} from '@dnd-kit/core';
import {App, Button} from 'antd';
import {findDescendants} from 'app/utils/tree';
import {DraggableOverlay} from 'components/draggable/overlay';
import {Droppable} from 'components/droppable';
import {useNode} from 'hooks/useNode';
import {useNodeContext} from 'layouts/node/context';
import {initSeries} from 'pages/chart/config';
import {Outlet} from 'react-router-dom';

export const Component = props => {
  const {updateNodeParams} = useNodeContext();
  const {data: tree} = useNode();
  const {notification} = App.useApp();
  const acceptedTypes = ['series', 'group'];

  //dnd-kit
  const handleLargeGroup = nodes => {
    const key = `warning-${Date.now()}`;
    return notification.warning({
      message: 'Warning',
      description: (
        <>
          This action will load <b>{nodes.length}</b> series nodes, this could result in long load times
        </>
      ),
      key,
      duration: 0,
      btn: (
        <Button
          onClick={() => {
            updateNodeParams('config.option.series', prev => [...(Array.isArray(prev) ? prev : []), ...nodes]);
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
      const {type, id, name, sensor} = active.data.current;
      const {accepts} = over.data.current;
      if (accepts.includes(type)) {
        if (type === 'group') {
          const descendants = findDescendants(tree, id);
          const groupNodes = descendants.filter(node => node.type === 'series');
          const nodes = groupNodes.map(s => ({
            name: s.name,
            node: s,
            ...initSeries['line'],
          }));
          if (nodes.length > 10) {
            handleLargeGroup(nodes);
          }
          return updateNodeParams('config.option.series', prevSeries => [
            ...(Array.isArray(prevSeries) ? prevSeries : []),
            ...nodes,
          ]);
        }
        if (type === 'device') {
          return; // add routine / trigger for adding sensors from a device
        }
        return updateNodeParams('config.option.series', prevSeries => [
          ...(Array.isArray(prevSeries) ? prevSeries : []),
          {
            name,
            node: active.data.current,
            ...initSeries['line'],
          },
        ]);
      }
      handleRejectedType(type, accepts);
    },
  });

  return (
    <>
      <Droppable key={'chart-droppable'} id={'chart-droppable'} acceptedTypes={acceptedTypes}>
        <Outlet />
      </Droppable>
      <DraggableOverlay />
    </>
  );
};
export default Component;
Component.displayName = 'Chart';
