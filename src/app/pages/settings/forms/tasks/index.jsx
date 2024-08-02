import {DeleteOutlined, EditOutlined} from '@ant-design/icons';
import {useQueryClient} from '@tanstack/react-query';
import {App, Button, Drawer, Popconfirm, Switch} from 'antd';
import {createStyles} from 'antd-style';
import ErrorBoundary from 'components/error/boundary';
import FormTable from 'components/molecules/FormTable';
import {API_QUERY} from 'constant/query';
import {useEffect, useState} from 'react';
import {useNodeDeleteMutation, useNodeSaveMutation} from 'services/hooks/useNode';
import {useAllTask} from 'services/hooks/useTask';
import {useOwner} from 'services/hooks/useUser';
import TaskControl from './TaskControl';
import ExecuteForm from './components/ExecuteForm';
import TaskTrigger from './components/TaskTrigger';
import ExecutionDetails from './executionDetails';

const useStyles = createStyles(({css}) => ({
  historyDrawer: css`
    .ant-drawer-header-title {
      justify-content: end;
    }
  `,
  executeDrawer: css`
    .ant-drawer-header-title {
      flex-direction: row-reverse;
    }
  `,
}));

export const Component = props => {
  const [disabled, setDisabled] = useState(true);
  const {message} = App.useApp();
  const {data: taskData, isPending} = useAllTask({hub: globalThis.envault.hub});
  const {data: ownerData} = useOwner();
  const {mutate: deleteNode} = useNodeDeleteMutation();
  const {mutate: saveNode} = useNodeSaveMutation();
  const queryClient = useQueryClient();

  const [dataSource, setDataSource] = useState([]);
  const [task, setTask] = useState(false);
  const [history, setHistory] = useState(false);
  const [execute, setExecute] = useState(false);
  const [trigger, setTrigger] = useState(false);
  const [activeLoading, setActiveLoading] = useState(false);
  const {styles} = useStyles();

  useEffect(() => {
    setDataSource(taskData);
  }, [taskData]);

  function deleteRecord(values) {
    deleteNode(
      {id: values.id},
      {
        onSuccess: () => {
          message.success(`Task ${values.name} delete success!`);
        },
        onSettled: () => {
          queryClient.invalidateQueries({queryKey: [API_QUERY.GET_ALL_TASK, globalThis.envault.hub]});
        },
      },
    );
  }

  const handleActivateTask = (checked, values) => {
    setActiveLoading(values);
    saveNode(
      {type: 'task', data: {...values, active: checked}},
      {
        onSuccess: data => {
          message.success('Task save success!');
          queryClient.invalidateQueries({queryKey: [API_QUERY.GET_ALL_TASK, globalThis.envault.hub]});
        },
        onSettled: () => {
          setActiveLoading(false);
        },
      },
    );
  };

  const columns = {
    data: [
      {
        title: 'Task Name',
        key: 'name',
        dataIndex: 'name',
        sorter: 1,
        width: '20%',
      },
      {
        title: 'Last Execution',
        key: 'last_execution',
        dataIndex: 'last_execution',
        sorter: 2,
        width: '20%',
      },
      {
        title: 'Last Status',
        key: 'last_status',
        dataIndex: 'last_status',
        sorter: 3,
        width: '20%',
      },
    ],
    actions: {
      title: 'Actions',
      key: 'action',
      dataIndex: 'action',
      actionItems: record => [
        <Button key={'history'} disabled={false} onClick={() => setHistory(record)}>
          History
        </Button>,
        <Button
          key={'execute'}
          type="primary"
          disabled={disabled}
          onClick={() => {
            setExecute(record);
          }}
        >
          Execute
        </Button>,
        <Button
          key={'trigger'}
          type="primary"
          disabled={disabled}
          onClick={() => {
            setTrigger(record);
          }}
        >
          Triggers
        </Button>,
        <Button key={'edit'} icon={<EditOutlined />} disabled={disabled} onClick={() => setTask(record)}></Button>,
        <Popconfirm
          key={'popDelete'}
          title="Delete the task"
          description="Are you sure to delete this task?"
          onConfirm={() => deleteRecord(record)}
          okText="Yes"
          cancelText="No"
        >
          <Button key={'delete'} icon={<DeleteOutlined />} disabled={disabled} danger></Button>
        </Popconfirm>,
        <Switch
          key={'active'}
          checked={record?.active}
          onChange={checked => handleActivateTask(checked, record)}
          disabled={disabled}
          loading={activeLoading?.id === record?.id}
        />,
      ],
    },
  };

  return (
    <ErrorBoundary>
      <FormTable
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        disabled={disabled}
        setDisabled={setDisabled}
        type="task"
        onClick={() => setTask(true)}
        loading={isPending}
      />
      <Drawer
        closeIcon={false}
        getContainer={false}
        placement={'bottom'}
        open={task}
        onClose={() => setTask(false)}
        size={'large'}
        styles={{header: {textAlign: 'center'}, body: {width: '100%'}}}
        height={'100%'}
        destroyOnClose={true}
      >
        <TaskControl hubId={globalThis.envault.hub} task={task} setTask={setTask} ownerData={ownerData} />
      </Drawer>
      <Drawer
        className={styles.historyDrawer}
        getContainer={false}
        placement={'bottom'}
        open={history}
        onClose={() => setHistory(false)}
        size={'large'}
        styles={{header: {textAlign: 'center'}, body: {width: '100%'}}}
        height={'100%'}
        destroyOnClose={true}
      >
        <ExecutionDetails
          hubId={globalThis.envault.hub}
          taskID={history.id}
          isEdit={!disabled}
          message={message}
          ownerData={ownerData}
        />
      </Drawer>
      <Drawer
        className={styles.executeDrawer}
        getContainer={false}
        placement={'left'}
        open={execute}
        onClose={() => setExecute(false)}
        size={'large'}
        styles={{header: {textAlign: 'center'}, body: {width: '100%'}}}
        height={'100%'}
        destroyOnClose={true}
        title={`User payload for ${execute?.name}`}
      >
        <ExecuteForm
          record={execute}
          message={message}
          onCancel={() => {
            setExecute(false);
          }}
        />
      </Drawer>
      <Drawer
        className={styles.executeDrawer}
        getContainer={false}
        placement={'left'}
        open={trigger}
        onClose={() => setTrigger(false)}
        size={'large'}
        styles={{header: {textAlign: 'center'}, body: {width: '100%'}}}
        height={'100%'}
        destroyOnClose={true}
        title={` Triggers of ${trigger?.name}`}
      >
        <TaskTrigger
          task={trigger}
          message={message}
          onCancel={() => {
            setTrigger(false);
          }}
          hub={globalThis.envault.hub}
        />
      </Drawer>
    </ErrorBoundary>
  );
};
Component.displayName = 'TaskManagement';
