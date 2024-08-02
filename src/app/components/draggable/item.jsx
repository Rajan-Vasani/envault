import {useDraggable} from '@dnd-kit/core';
import {Draggable} from '.';

const DraggableItem = ({handle, id, data, children, style, disabled = false, ...props}) => {
  const {isDragging, setNodeRef, listeners} = useDraggable({
    id: id,
    data: data,
    disabled: disabled,
  });

  return (
    <Draggable
      dragging={isDragging}
      ref={setNodeRef}
      handle={handle}
      listeners={listeners}
      style={{
        opacity: isDragging ? 0 : undefined,
        ...style,
      }}
      label={id}
      {...props}
    >
      {children}
    </Draggable>
  );
};

export default DraggableItem;
