import {useDndMonitor} from '@dnd-kit/core';
import {App, Button} from 'antd';
import {findDescendants} from 'app/utils/tree';
import {DraggableOverlay} from 'components/draggable/overlay';
import {Droppable} from 'components/droppable';
import {useNode} from 'hooks/useNode';
import {useNodeContext} from 'layouts/node/context';
import GalleryLoader from 'pages/gallery/gallery';

export const Component = props => {
  const {updateNodeParams} = useNodeContext();
  const {data: tree} = useNode();
  const {notification} = App.useApp();
  const acceptedTypes = ['timelapse', 'device', 'group'];

  //dnd-kit
  const handleLargeGroup = nodes => {
    const key = `warning-${Date.now()}`;
    return notification.warning({
      message: 'Warning',
      description: (
        <>
          This action will load <b>{nodes.length}</b> timelapse nodes, this could result in long load times
        </>
      ),
      key,
      duration: 0,
      btn: (
        <Button
          onClick={() => {
            updateNodeParams('config.option.timelapse', prev => [...(Array.isArray(prev) ? prev : []), ...nodes]);
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
          const groupNodes = descendants.filter(node => node.type === 'timelapse');
          const nodes = groupNodes.map(s => ({
            name: s.name,
            node: s,
          }));
          if (nodes.length > 10) {
            handleLargeGroup(nodes);
          }
          return updateNodeParams('config.option.timelapse', prevTimelapse => [
            ...(Array.isArray(prevTimelapse) ? prevTimelapse : []),
            ...nodes,
          ]);
        }
        if (type === 'device') {
          return; // add routine / trigger for adding sensors from a device
        }
        return updateNodeParams('config.option.timelapse', prevTimelapse => [
          ...(Array.isArray(prevTimelapse) ? prevTimelapse : []),
          {name, node: active.data.current},
        ]);
      }
      handleRejectedType(type, accepts);
    },
  });

  return (
    <>
      <Droppable key={'timelapse-droppable'} id={'timelapse-droppable'} acceptedTypes={acceptedTypes}>
        <GalleryLoader />
      </Droppable>
      <DraggableOverlay />
    </>
  );
};
export default Component;
Component.displayName = 'Gallery';
