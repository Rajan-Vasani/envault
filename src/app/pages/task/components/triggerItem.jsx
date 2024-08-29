import {CloseOutlined} from '@ant-design/icons';
import {useQueryClient} from '@tanstack/react-query';
import {App, Button, Col, Form, Input, Row, TreeSelect} from 'antd';
import {createStyles} from 'antd-style';
import {API_QUERY} from 'app/constant/query';
import {useNode} from 'app/services/hooks/useNode';
import {useTaskTriggerDeleteMutation, useTaskTriggerPutMutation} from 'app/services/hooks/useTaskTrigger';

const useStyles = createStyles(({css}) => ({
  triggerItemInput: css`
    overflow: hidden;
    text-align: center;
    input {
      text-align: center;
    }
  `,
}));

const TaskTriggerItem = props => {
  const {trigger, setAddTrigger, taskId, handleTriggerFinish} = props;
  const [form] = Form.useForm();
  const {data: tree} = useNode({hub: globalThis.envault.hub});
  const {mutate: saveTrigger} = useTaskTriggerPutMutation();
  const {mutate: deleteTrigger} = useTaskTriggerDeleteMutation();
  const {message} = App.useApp();

  const queryClient = useQueryClient();
  const {styles} = useStyles();

  const handleTaskTriggerDelete = () => {
    if (!trigger?.id) return setAddTrigger(false);
    message.open({type: 'infor', content: 'Deleting trigger...'});
    deleteTrigger(
      {hub: globalThis.envault.hub, trigger: trigger.id},
      {
        onSuccess: () => {
          message.open({type: 'success', content: 'Trigger deleted!'});
        },
        onSettled: () => {
          queryClient.invalidateQueries({queryKey: [...API_QUERY.TASK_TRIGGER, globalThis.envault.hub, taskId]});
        },
      },
    );
  };

  const onFinish = values => {
    message.open({type: 'infor', content: `${trigger?.id ? 'Saving' : 'Adding'} trigger...`});
    saveTrigger(
      {hub: globalThis.envault.hub, data: values},
      {
        onSuccess: () => {
          message.open({type: 'success', content: 'Trigger saved!'});
          queryClient.invalidateQueries({queryKey: [...API_QUERY.TASK_TRIGGER, globalThis.envault.hub, taskId]});
        },
        onError: () => {
          message.open({type: 'error', content: 'Could not saved this trigger! Please try again later!'});
        },
        onSettled: () => {
          handleTriggerFinish(false);
        },
      },
    );
  };
  return (
    <Form layout={'inline'} form={form} onFinish={onFinish} initialValues={trigger}>
      <Row>
        <Col flex={'1 1 10%'} className={styles.triggerItemInput}>
          <Form.Item noStyle style={{width: '50px'}} label="Trigger id" name="id">
            <Input disabled />
          </Form.Item>
        </Col>
        <Col flex={'1 1 20%'} className={styles.triggerItemInput}>
          <Form.Item noStyle label="Node" name="node" rules={[{required: true, message: 'Node is required!'}]}>
            <TreeSelect
              placeholder="Node"
              treeData={tree}
              treeDataSimpleMode={{
                id: 'id',
                pId: 'parent',
                rootPId: null,
              }}
              showSearch
              fieldNames={{value: 'id', label: 'name'}}
              treeIcon
              treeLine={true}
              listHeight={500}
              treeNodeFilterProp="name"
              style={{textAlign: 'center'}}
              variant={'borderless'}
              dropdownStyle={{minWidth: '200px'}}
            />
          </Form.Item>
        </Col>

        <Col flex={'1 1 15%'} className={styles.triggerItemInput}>
          <Form.Item noStyle style={{width: '50px'}} label="Event" name="event">
            <Input disabled />
          </Form.Item>
        </Col>
        <Col flex={'1 1 20%'} className={styles.triggerItemInput}>
          <Form.Item noStyle style={{width: '50px'}} label="Task id" name="task">
            <Input disabled />
          </Form.Item>
        </Col>
        <Col flex={'1 1 15%'} className={styles.triggerItemInput}>
          <Form.Item noStyle style={{width: '50px'}} label="Task owner" name="owner">
            <Input disabled />
          </Form.Item>
        </Col>
        <Col flex={'1 1 20%'} className={styles.triggerItemInput}>
          <Form.Item style={{}}>
            <Button htmlType="submit" type="primary">
              Save
            </Button>
            <Button type="text" icon={<CloseOutlined />} onClick={handleTaskTriggerDelete}></Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default TaskTriggerItem;
