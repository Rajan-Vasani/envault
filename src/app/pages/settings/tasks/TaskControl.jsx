import {useQueryClient} from '@tanstack/react-query';
import {App, Col, Form, Row, Typography} from 'antd';
import {createStyles} from 'antd-style';
import {API_QUERY} from 'app/constant/query';
import {useNodeSaveMutation} from 'app/services/hooks/useNode';
import dayjs from 'dayjs';
import TaskHeader from './TaskHeader';
import TaskConfigForm from './components/TaskConfigForm';

const useStyles = createStyles(({token, css}) => ({
  content: css`
    min-height: 260px;
    padding: 16px;
    color: ${token.colorTextTertiary};
    background-color: ${token.colorFillAlter};
    border-radius: ${token.borderRadiusLG};
    border: 1px dashed ${token.colorBorder};
    display: 'flex';
    flex-direction: 'column';
  `,
}));

const TaskControl = props => {
  const {task, setTask = () => {}, ownerData} = props;
  const {message} = App.useApp();
  const queryClient = useQueryClient();
  const styles = useStyles();

  const {mutate: saveNode} = useNodeSaveMutation();

  const taskSave = async value => {
    const {taskInfo, taskConfig} = value;
    if (!taskConfig.actions.some(item => item.type && item.type.trim() !== '')) {
      message.info('Please select at least one action type');
      return;
    }
    message.info('Saving your task');
    const actionSteps = taskConfig.actions
      .filter(item => item)
      .map(action => {
        const {id, ...rest} = action || {};
        return {...rest};
      });
    saveNode(
      {type: 'task', hub: globalThis.envault.hub, data: {...taskInfo, actions: actionSteps}},
      {
        onSuccess: () => {
          message.success('Task save success!');
          queryClient.invalidateQueries({queryKey: [...API_QUERY.TASK, globalThis.envault.hub]});
        },
        onSettled: () => {
          setTask(false);
        },
      },
    );
  };

  const onFormFinish = async (name, {forms}) => {
    if (name === 'taskSubmit') {
      try {
        // Wait for all validations to complete
        await Promise.all(Object.keys(forms).map(formName => forms[formName].validateFields()));
        // Check for errors in all forms
        const errors = Object.keys(forms).reduce((acc, formName) => {
          const formErrors = forms[formName].getFieldsError().filter(({errors}) => errors.length > 0);
          return [...acc, ...formErrors];
        }, []);

        if (errors.length > 0) {
          console.log('There are error fields in the forms:', errors);
          throw new Error('Validation failed');
        } else {
          const taskConfig = forms['taskConfig'].getFieldsValue(true);
          let taskSubmitValue = forms['taskSubmit'].getFieldsValue(true);
          const taskInfoValue = forms['taskInfo'].getFieldsValue(true);
          const {schedule} = taskSubmitValue;
          if (schedule) {
            const {type, value, at, tz, dow, day} = schedule || {};
            let scheduleByType;
            switch (schedule.type) {
              case '@interval':
                scheduleByType = {type, value: value + ' minutes'};
                break;
              case '@daily':
                scheduleByType = {type, at: dayjs(at).format('HH:mm'), tz};
                break;
              case '@weekly':
                scheduleByType = {type, dow, at: dayjs(at).format('HH:mm'), tz};
                break;
              case '@monthly':
                scheduleByType = {type, day, at: dayjs(at).format('HH:mm'), tz};
                break;

              default:
                break;
            }
            taskSubmitValue.schedule = scheduleByType;
          }
          taskSave({taskConfig, taskInfo: {...taskInfoValue, ...taskSubmitValue}});
        }
      } catch (errInfo) {
        console.log('Validate Failed:', errInfo);
      }
      return;
    }
  };

  const onFormChange = (name, {changedFields, forms}) => {};

  return (
    <Form.Provider onFormFinish={onFormFinish} onFormChange={onFormChange}>
      <TaskHeader task={task} onClose={() => setTask(false)} hub={globalThis.envault.hub} ownerData={ownerData} />
      <br />
      <br />
      <Row gutter={8}>
        <Col span={18}>
          <TaskConfigForm task={task} />
        </Col>
        <Col span={6}>
          <div className={styles.content}>
            <Typography>
              <pre>{JSON.stringify('Comming soon', null, 2)}</pre>
            </Typography>
          </div>
        </Col>
      </Row>
    </Form.Provider>
  );
};

export default TaskControl;
