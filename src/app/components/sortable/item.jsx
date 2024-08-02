/* eslint-disable max-len */
import {defaultAnimateLayoutChanges, useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

const animateLayoutChanges = args => defaultAnimateLayoutChanges({...args, wasDragging: true});

export const SortableItem = props => {
  const {handle, onRemove = false, itemStyle = {}, handleStyle, wrapperStyle = {}, data} = props;
  const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({
    id: `${props.id}`,
    data: data,
    animateLayoutChanges,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        'transform': CSS.Transform.toString(transform),
        'display': 'flex',
        'border': isDragging ?? '1px solid black',
        ...itemStyle,
        'transition': [transition, wrapperStyle?.transition].filter(Boolean).join(', '),
        '--translate-x': transform ? `${Math.round(transform.x)}px` : undefined,
        '--translate-y': transform ? `${Math.round(transform.y)}px` : undefined,
        '--scale-x': transform?.scaleX ? `${transform.scaleX}` : undefined,
        '--scale-y': transform?.scaleY ? `${transform.scaleY}` : undefined,
      }}
      className={`envault-sortable-item ${isDragging ? 'isDragging' : ''}`}
    >
      {handle ? (
        <button
          className="envault-task-step-item-button handle"
          {...attributes}
          {...listeners}
          style={{...handleStyle}}
        >
          <svg viewBox="0 0 20 20" width="16">
            <path
              fill="#c3c3c3"
              d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"
            ></path>
          </svg>
        </button>
      ) : null}
      <div
        className="base-shadow"
        style={{
          flex: '1',
        }}
      >
        {props.children}
        {onRemove ? (
          <button className="envault-task-step-item-button remove" onClick={onRemove} style={{...handleStyle}}>
            <svg width="8" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.99998 -0.000206962C2.7441 -0.000206962 2.48794 0.0972617 2.29294 0.292762L0.292945 2.29276C-0.0980552 2.68376 -0.0980552 3.31682 0.292945 3.70682L7.58591 10.9998L0.292945 18.2928C-0.0980552 18.6838 -0.0980552 19.3168 0.292945 19.7068L2.29294 21.7068C2.68394 22.0978 3.31701 22.0978 3.70701 21.7068L11 14.4139L18.2929 21.7068C18.6829 22.0978 19.317 22.0978 19.707 21.7068L21.707 19.7068C22.098 19.3158 22.098 18.6828 21.707 18.2928L14.414 10.9998L21.707 3.70682C22.098 3.31682 22.098 2.68276 21.707 2.29276L19.707 0.292762C19.316 -0.0982383 18.6829 -0.0982383 18.2929 0.292762L11 7.58573L3.70701 0.292762C3.51151 0.0972617 3.25585 -0.000206962 2.99998 -0.000206962Z" />
            </svg>
          </button>
        ) : null}
      </div>
    </div>
  );
};
