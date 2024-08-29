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
        border-radius: ${token.borderRadius}px;
        transition: border-color 0.2s;
        color: ${token.colorText};
        &:hover {
          border-color: ${token.colorPrimaryBorder};
        }
      `,
      isOver && over,
      dragging && enter,
    ),
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
