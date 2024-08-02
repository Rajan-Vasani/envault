import {SearchOutlined} from '@ant-design/icons';
import {useDndMonitor} from '@dnd-kit/core';
import {TreeSelect} from 'antd';
import Icon from 'components/atoms/Icon';
import {Droppable} from 'components/droppable';
import {useNode} from 'services/hooks/useNode';

const WidgetDroppable = props => {
  const {data: tree} = useNode();
  const {selectedNode, onSelectedNode = () => {}, acceptType, item} = props;

  const handleNodeSelect = v => {
    const nodeItem = tree.find(item => item.id === v);
    if (acceptType.includes(nodeItem.type)) {
      onSelectedNode(nodeItem);
    } else {
      alert(`Please select a ${acceptType} node`);
    }
  };

  const handleDragEnd = (active, over) => {
    const currentNode = active.data.current;
    if (!over || over.id.replace('widget-droppable-', '') !== item.id) {
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

  if (selectedNode) {
    return null;
  }

  const helperStyle = {
    position: 'relative',
    borderRadius: '8px',
    padding: '16px',
    width: '100%',
    textAlign: 'center',
    height: '100%',
  };

  return (
    <Droppable
      key={`widget-droppable-${item.id}`}
      id={`widget-droppable-${item.id}`}
      acceptedTypes={acceptType}
      target={item.id}
    >
      <div style={helperStyle}>
        <Icon icon={'Realtime'} type={'envault'} alt={'Drag&Drop'} raw style={{width: '20%', height: 'auto'}} />
        <br />
        <p style={{fontSize: '12px'}}>Drag&Drop to get started</p>
        <br />
        <TreeSelect
          placeholder={
            <>
              <SearchOutlined />
              Browse timelapse...
            </>
          }
          treeData={tree}
          treeDataSimpleMode={{
            id: 'id',
            pId: 'parent',
            rootPId: null,
          }}
          showSearch
          fieldNames={{value: 'id', label: 'name'}}
          treeIcon
          treeLine={true}
          listHeight={500}
          treeNodeFilterProp="name"
          onChange={handleNodeSelect}
          style={{width: '300px', marginBottom: '10px'}}
        />
      </div>
    </Droppable>
  );
};

export default WidgetDroppable;
