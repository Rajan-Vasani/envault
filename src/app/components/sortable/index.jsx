import {PlusOutlined} from '@ant-design/icons';
import {DndContext, DragOverlay, PointerSensor, TouchSensor, useSensor, useSensors} from '@dnd-kit/core';
import {SortableContext, arrayMove, rectSortingStrategy} from '@dnd-kit/sortable';
import {useStyles} from 'component/droppable';
import {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {dropAnimationConfig} from 'utils/dnd';
import {v4 as uuidv4} from 'uuid';
import {SortableItem} from './item';

const ActionStep = ({children}) => {
  const stepStyle = {
    flex: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
  };
  return <div style={stepStyle}>{children}</div>;
};

export const Wrapper = ({children, center, style}) => {
  const wrapperStyle = {
    display: 'flex',
    width: '100%',
    boxSizing: 'border-box',
    padding: '20px',
    justifyContent: 'center',
  };
  return <div style={wrapperStyle}>{children}</div>;
};

export const List = ({children, columns = 1, horizontal = false, style}) => {
  const {styles} = useStyles();
  const gridHorizontalStyle = {
    gridAutoFlow: 'column',
  };
  return (
    <div
      style={{
        ...style,
        '--columns': columns,
        ...(horizontal && gridHorizontalStyle),
      }}
      className={styles.List}
    >
      {children}
    </div>
  );
};

export function Sortable({
  animateLayoutChanges,
  getNewIndex,
  adjustScale = false,
  dropAnimation = dropAnimationConfig,
  handle = true,
  items: initialItems = [],
  isDisabled = () => false,
  removable,
  renderItem,
  reorderItems = arrayMove,
  strategy = rectSortingStrategy,
  useDragOverlay = true,
  modifiers,
  handleItemClick = () => {},
  updateItem = () => {},
  activeItem,
  Container = List,
}) {
  const [items, setItems] = useState(() => initialItems ?? []);
  const [activeId, setActiveId] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
  );
  const isFirstAnnouncement = useRef(true);
  const getIndex = id => items.indexOf(items.find(item => item.id === id));

  const activeIndex = activeId ? getIndex(activeId) : -1;

  const handleRemove = id => setItems(items => items.filter(item => item.id !== id));

  const handleAdd = () => {
    const newId = uuidv4();
    const newItem = {
      id: newId,
      key: newId,
      content: `Step ${items.length}`,
      title: `Step ${items.length}`,
      schema: undefined,
    };
    setItems([...items, newItem]);
  };

  useEffect(() => {
    if (!activeId) {
      isFirstAnnouncement.current = true;
    }
  }, [activeId]);

  useEffect(() => {
    if (items) {
      updateItem(items);
    }
  }, [items, updateItem]);

  const itemStyle = {};

  const handleStyle = {};

  return (
    <DndContext
      sensors={sensors}
      onDragStart={({active}) => {
        if (!active) {
          return;
        }
        setActiveId(active.id);
      }}
      onDragEnd={({over}) => {
        setActiveId(null);

        if (over) {
          const overIndex = getIndex(over.id);
          if (activeIndex !== overIndex) {
            setItems(items => reorderItems(items, activeIndex, overIndex));
          }
        }
      }}
      onDragCancel={() => setActiveId(null)}
      modifiers={modifiers}
    >
      <Wrapper>
        <SortableContext items={items} strategy={strategy}>
          <Container>
            {items.map((value, index) => (
              <SortableItem
                key={value.id}
                id={value.id}
                handle={handle}
                index={index}
                disabled={isDisabled(value)}
                renderItem={renderItem}
                onRemove={items.length > 1 && (() => handleRemove(value.id))}
                animateLayoutChanges={animateLayoutChanges}
                useDragOverlay={useDragOverlay}
                getNewIndex={getNewIndex}
                itemStyle={itemStyle}
                handleStyle={handleStyle}
                onItemClick={handleItemClick}
                activeItem={activeItem}
              >
                <ActionStep>{value.title}</ActionStep>
              </SortableItem>
            ))}
            <div
              className="envault-task-step-item base-shadow"
              style={{
                ...itemStyle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                cursor: 'pointer',
              }}
              onClick={handleAdd}
            >
              <PlusOutlined />
            </div>
          </Container>
        </SortableContext>
      </Wrapper>
      {useDragOverlay
        ? createPortal(
            <DragOverlay adjustScale={adjustScale} dropAnimation={dropAnimationConfig}>
              {activeId ? (
                <SortableItem
                  renderItem={renderItem}
                  animateLayoutChanges={animateLayoutChanges}
                  // getNewIndex={getNewIndex}
                  itemStyle={itemStyle}
                  dragOverlay
                >
                  <ActionStep>{items.find(item => item.id === activeId)?.title}</ActionStep>
                </SortableItem>
              ) : null}
            </DragOverlay>,
            document.body,
          )
        : null}
    </DndContext>
  );
}
