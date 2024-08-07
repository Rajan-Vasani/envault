import {Button, Col, Flex, Row} from 'antd';
import {useTaskTriggerById} from 'app/services/hooks/useTaskTrigger';
import {useState} from 'react';
import TaskTriggerItem from './TaskTriggerItem';

const TaskTrigger = props => {
  const {task, hub, message, onCancel} = props;
  const {data: triggerList = []} = useTaskTriggerById({hub, task: task?.id});
  const [addTrigger, setAddTrigger] = useState(false);

  const handleTriggerFinish = () => {
    onCancel();
    setAddTrigger(false);
  };
  return (
    <Flex vertical="vertical" gap="middle">
      <Button
        type="primary"
        onClick={() => setAddTrigger({event: 'data/insert', owner: task?.owner, task: task?.id})}
        style={{display: 'block', marginLeft: 'auto'}}
      >
        Add Trigger
      </Button>
      <Row>
        <Col flex={'1 1 10%'} style={{textAlign: 'center'}}>
          ID
        </Col>{' '}
        <Col flex={'1 1 20%'} style={{textAlign: 'center'}}>
          Node
        </Col>
        <Col flex={'1 1 15%'} style={{textAlign: 'center'}}>
          Event
        </Col>
        <Col flex={'1 1 20%'} style={{textAlign: 'center'}}>
          Task
        </Col>
        <Col flex={'1 1 15%'} style={{textAlign: 'center'}}>
          Owner
        </Col>
        <Col flex={'1 1 20%'} style={{textAlign: 'center'}}></Col>
      </Row>
      {addTrigger && (
        <TaskTriggerItem
          taskId={task.id}
          trigger={addTrigger}
          hub={hub}
          message={message}
          handleTriggerFinish={handleTriggerFinish}
        />
      )}
      {triggerList.map(trigger => (
        <TaskTriggerItem
          key={trigger.id}
          trigger={trigger}
          hub={hub}
          taskId={task.id}
          message={message}
          handleTriggerFinish={handleTriggerFinish}
        />
      ))}
    </Flex>
  );
};

export default TaskTrigger;
