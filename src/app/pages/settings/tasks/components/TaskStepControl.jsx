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
import {useEffect, useRef, useState} from 'react';
import {v4 as uuidv4} from 'uuid';
import {ActionSchema} from './ActionSchema';

const TaskStepControl = props => {
  const {name, value} = props;
  const [activeItem, setActiveItem] = useState(null);
  const [formActions, setFormActions] = useState(value);
  const form = Form.useFormInstance();

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
      setFormActions(form.getFieldValue(name));
    }
    setActiveItem(null);
  };

  // TODO: need to get the correct name for the form item
  return (
    <Form.List name={name}>
      {(fields, {add, remove, move}) => {
        const check = form.getFieldValue(name);
        const items = fields.map(field => ({
          ...field,
          id: form.getFieldValue(name)[field.name].id,
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
  );
};

export default TaskStepControl;
