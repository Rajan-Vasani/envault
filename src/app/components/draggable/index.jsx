import {forwardRef} from 'react';

export const Draggable = forwardRef(function Draggable(
  {axis, dragOverlay, dragging, handle, label, listeners, transform, style, children, ...props},
  ref,
) {
  return (
    <div
      style={{
        ...style,
        '--translate-x': `${transform?.x ?? 0}px`,
        '--translate-y': `${transform?.y ?? 0}px`,
      }}
      {...props}
      data-cypress="draggable-item"
      {...(handle ? {} : listeners)}
      tabIndex={handle ? -1 : undefined}
      ref={ref}
    >
      {children}
    </div>
  );
});
