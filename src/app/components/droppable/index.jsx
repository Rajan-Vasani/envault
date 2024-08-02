import {useDroppable} from '@dnd-kit/core';
import {createStyles} from 'antd-style';

export const useStyles = createStyles(({token, css, cx}, {isOver, dragging}) => {
  const over = css`
    border-color: ${token.colorPrimaryBorder};
  `;
  const enter = css`
    border-color: ${token.colorPrimaryBorderHover};
  `;
  return {
    droppable: cx(
      css`
        position: relative;
        box-sizing: border-box;
        height: 100%;
        min-height: 100px;
        min-width: 100px;
        border: 1px dashed ${token.colorBorder};
        border-radius: ${token.borderRadius}px;
        transition: border-color 0.2s;
        background: ${token.colorBgContainer};
        color: ${token.colorText};
        &:hover {
          border-color: ${token.colorPrimaryBorder};
        }
      `,
      isOver && over,
      dragging && enter,
    ),
    list: css`
      display: grid;
      box-sizing: border-box;
      grid-auto-rows: max-content;
      grid-template-columns: repeat(var(--columns), 1fr);
      gap: 10px;
      padding: 10px;
      border-radius: ${token.borderRadius}px;
      background: ${token.colorBgContainer};
      &:after {
        content: '';
        height: 10px;
        grid-column-start: span var(--columns, 1);
      }
    `,
  };
});

export const Droppable = ({children, id, dragging, acceptedTypes, target}) => {
  const {isOver, setNodeRef} = useDroppable({
    id,
    data: {
      accepts: acceptedTypes,
      target,
    },
  });
  const {styles} = useStyles({isOver, dragging, children});

  return (
    <div ref={setNodeRef} className={styles.droppable} id={id} key={id}>
      {children}
    </div>
  );
};
