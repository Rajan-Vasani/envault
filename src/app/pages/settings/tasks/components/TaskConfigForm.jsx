import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy} from '@dnd-kit/sortable';
import {Button, Flex, Form} from 'antd';
import {useTheme} from 'antd-style';
import {useEffect, useRef, useState} from 'react';
import {v4 as uuidv4} from 'uuid';
import {ActionSchema} from './ActionSchema';

export const DraggingItem = () => {
  const theme = useTheme();

  const draggingItemStyle = {
    boxShadow: theme.boxShadowSecondary,
    borderRadius: theme.borderRadius,
    display: 'flex',
    alignItems: 'center',
  };

  return (
    <div style={draggingItemStyle} className="envault-sortable-item isDragging">
      <button className="envault-task-step-item-button handle">
        <svg viewBox="0 0 20 20" width="16">
          <path
            fill="#c3c3c3"
            d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"
          ></path>
        </svg>
      </button>
      <div>{document.querySelector('.isDragging .envault-action-label')?.textContent ?? 'Action Step'}</div>
    </div>
  );
};
const TaskConfigForm = props => {
  const {
    task: {actions},
  } = props;
  const [form] = Form.useForm();
  const [activeItem, setActiveItem] = useState(null);
  const [formActions, setFormActions] = useState(actions);

  //dnd-kit
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
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const isFirstAnnouncement = useRef(true);

  useEffect(() => {
    if (!activeItem) {
      isFirstAnnouncement.current = true;
    }
  }, [activeItem]);

  //dnd-kit
  const handleDragStart = e => {
    const {active} = e;
    setActiveItem(formActions[active.id]);
  };

  const handleDragEnd = (e, {move}) => {
    const {active, over} = e;
    if (over && active.id !== over?.id) {
      const oldId = formActions.findIndex(x => x.id === active.id);
      const newId = formActions.findIndex(x => x.id === over.id);
      move(oldId, newId);
      setFormActions(form.getFieldValue('actions'));
    }
    setActiveItem(null);
  };

  return (
    <Form form={form} name="taskConfig" autoComplete="off" initialValues={{actions}}>
      <Form.List name={'actions'}>
        {(fields, {add, remove, move}) => {
          const items = fields.map(field => ({
            ...field,
            id: form.getFieldValue('actions')[field.name].id,
          }));
          const itemIds = items.map(({id}) => id);
          return (
            <Flex vertical>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={e => handleDragStart(e)}
                onDragEnd={e => handleDragEnd(e, {move})}
              >
                <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
                  {items.map((item, index) => (
                    <Form.Item key={item.key} name={item.name}>
                      <ActionSchema remove={remove} item={item} index={index} />
                    </Form.Item>
                  ))}
                </SortableContext>
                <DragOverlay>{activeItem ? <ActionSchema value={activeItem} /> : null}</DragOverlay>
              </DndContext>
              <Button type="dashed" onClick={() => add({id: uuidv4()})} block>
                + Add Step
              </Button>
            </Flex>
          );
        }}
      </Form.List>
    </Form>
  );
};

export default TaskConfigForm;
