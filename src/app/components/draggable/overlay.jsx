import {DragOverlay, useDndContext} from '@dnd-kit/core';
import {CSS} from '@dnd-kit/utilities';
import {createPortal} from 'react-dom';
import {Draggable} from '.';

const dropAnimationConfig = {
  keyframes({transform}) {
    return [
      {transform: CSS.Transform.toString(transform.initial)},
      {
        transform: CSS.Transform.toString({
          ...transform.final,
          scaleX: 0.94,
          scaleY: 0.94,
        }),
      },
    ];
  },
  sideEffects({active, dragOverlay}) {
    active.node.style.opacity = '0';

    const button = dragOverlay.node.querySelector('button');

    if (button) {
      button.animate(
        [
          {
            boxShadow: '-1px 0 15px 0 rgba(34, 33, 81, 0.01), 0px 15px 15px 0 rgba(34, 33, 81, 0.25)',
          },
          {
            boxShadow: '-1px 0 15px 0 rgba(34, 33, 81, 0), 0px 15px 15px 0 rgba(34, 33, 81, 0)',
          },
        ],
        {
          duration: 250,
          easing: 'ease',
          fill: 'forwards',
        },
      );
    }

    return () => {
      active.node.style.opacity = '';
    };
  },
};

export function DraggableOverlay({axis, dropAnimation = dropAnimationConfig}) {
  const {active} = useDndContext();

  return createPortal(
    <DragOverlay dropAnimation={dropAnimation}>
      {active ? (
        <Draggable
          axis={axis}
          dragging
          dragOverlay
          id={active.id}
          label={active.data.current?.name}
          style={{padding: '10px'}}
        />
      ) : null}
    </DragOverlay>,
    document.body,
  );
}
