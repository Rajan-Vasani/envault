import {App, Button, Card, Flex, Layout} from 'antd';
import Icon from 'app/components/atoms/Icon';
import ExecutionHistory from 'pages/task/components/executionHistory';
import TaskTrigger from 'pages/task/components/trigger';
import {useState} from 'react';
import {useOutletContext, useParams} from 'react-router-dom';
const {Content} = Layout;

export const Component = props => {
  const {nodeId: _nodeId} = useParams();
  const nodeId = +_nodeId;
  const {hub, node} = useOutletContext();
  const [disabled, setDisabled] = useState(true);
  const {message} = App.useApp();

  const handleDisabled = () => {
    setDisabled(disabled => !disabled);
  };

  const descriptionItems = [
    {key: '1', label: 'Name', children: node.name},
    {key: '2', label: 'ID', children: node.id},
    {key: '3', label: 'Type', children: node.type},
  ];

  return (
    <Content>
      <Flex vertical gap={'small'} style={{padding: '10px', overFlowY: 'auto'}}>
        <Card>Task Status</Card>
        <Card
          title={'Triggers'}
          extra={
            <Button
              onClick={handleDisabled}
              icon={<Icon icon={disabled ? 'LockOutlined' : 'UnlockOutlined'} type={'ant'} />}
            />
          }
        >
          <TaskTrigger task={node} hub={hub} disabled={disabled} />
        </Card>
        <Card>Actions</Card>
        <Card
          title={'History'}
          extra={
            <Button
              onClick={handleDisabled}
              icon={<Icon icon={disabled ? 'LockOutlined' : 'UnlockOutlined'} type={'ant'} />}
            />
          }
        >
          <ExecutionHistory hubId={globalThis.envault.hub} taskID={nodeId} disabled={disabled} message={message} />
        </Card>
      </Flex>
    </Content>
  );
};
Component.displayName = 'TaskPage';
