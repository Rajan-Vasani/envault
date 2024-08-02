import {Button, Col, Empty, Flex, Row} from 'antd';
import {useTaskTriggerById} from 'app/services/hooks/useTaskTrigger';
import {useState} from 'react';
import TaskTriggerItem from './triggerItem';

//@TODO: this should be a table not a horizontal form..
const TaskTrigger = props => {
  const {task, message, onCancel} = props;
  const {data: triggerList = []} = useTaskTriggerById({hub: globalThis.envault.hub, task: task?.id});
  const [addTrigger, setAddTrigger] = useState(false);

  const handleTriggerFinish = () => {
    onCancel();
    setAddTrigger(false);
  };
  return triggerList.length || addTrigger ? (
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
          setAddTrigger={setAddTrigger}
          hubId={globalThis.envault.hub}
          message={message}
          handleTriggerFinish={handleTriggerFinish}
        />
      )}
      {triggerList.map(trigger => (
        <TaskTriggerItem
          key={trigger.id}
          trigger={trigger}
          setAddTrigger={setAddTrigger}
          hubId={globalThis.envault.hub}
          taskId={task.id}
          message={message}
          handleTriggerFinish={handleTriggerFinish}
        />
      ))}
    </Flex>
  ) : (
    <Empty description={'no triggers'}>
      <Button type="primary" onClick={() => setAddTrigger({event: 'data/insert', owner: task?.owner, task: task?.id})}>
        Add Trigger
      </Button>
    </Empty>
  );
};

export default TaskTrigger;
