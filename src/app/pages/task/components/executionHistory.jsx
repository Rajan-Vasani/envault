import {useQueryClient} from '@tanstack/react-query';
import {Alert, Button, DatePicker, Skeleton, Space, Typography} from 'antd';
import FormTable from 'components/molecules/FormTable';
import {API_QUERY} from 'constant/query';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import utc from 'dayjs/plugin/utc';
import {divide} from 'lodash';
import {useEffect, useState} from 'react';
import {useTaskExecution, useTaskExecutionPayload} from 'services/hooks/useTask';
dayjs.extend(utc);
dayjs.extend(localizedFormat);

const ExecutionHistory = props => {
  const {taskID, disabled, message} = props;
  const [dataRange, setDataRange] = useState([null, null]);
  const [isDataRangeSet, setIsDataRangeSet] = useState(false);
  const [pageCurrent, setPageCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const {data: executionData = [], isFetched: isExecutionDataFetched} = useTaskExecution({
    hub: globalThis.envault.hub,
    task: taskID,
    from: dataRange[0] ? dayjs(dataRange[0]).toISOString() : null,
    to: dataRange[1] ? dayjs(dataRange[1]).toISOString() : null,
    pageNum: pageCurrent - 1,
    pageSize: pageSize,
  });

  const {mutate: retryPayload} = useTaskExecutionPayload();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isDataRangeSet) {
      setDataRange([dayjs().subtract(1, 'hour'), dayjs()]);
      setIsDataRangeSet(true);
    }
  }, [isExecutionDataFetched, isDataRangeSet]);

  const getPayload = async url => {
    const response = await fetch(url);
    return response.ok ? response.json() : Promise.reject(response);
  };
  const retry = async record => {
    message.open({type: 'infor', content: 'Retrying payload...'});
    getPayload(record?.file)
      .then(returnedResponse => {
        retryPayload(
          {task: taskID, payload: returnedResponse},
          {
            onSuccess: () => {
              message.open({type: 'success', content: 'Payload executed!'});
              queryClient.invalidateQueries({queryKey: [...API_QUERY.TASK_EXECUTE, globalThis.envault.hub, taskID]});
            },
            onError: () => {
              message.open({type: 'error', content: 'Could not executed this payload! Please try again later!'});
            },
          },
        );
      })
      .catch(error => {
        console.log(error);
      });
  };

  const columns = {
    baseColumns: [
      {
        title: 'Status',
        dataIndex: 'success',
        key: 'success',
        render: record => {
          if (record === true) {
            return <Alert message="Success" type="success" showIcon />;
          } else if (record === false) {
            return <Alert message="Failure" type="error" showIcon />;
          } else {
            return <Alert message="Pending" type="info" showIcon />;
          }
        },
      },
      // {title: 'Result', dataIndex: 'result', key: 'result'},
      {
        title: 'Start',
        dataIndex: 'start_at',
        key: 'start_at',
        render: record => <Typography.Text>{dayjs(record).format('L LTS')}</Typography.Text>,
      },
      {
        title: 'End',
        dataIndex: 'end_at',
        key: 'end_at',
        render: record => <Typography.Text>{dayjs(record).format('L LTS')}</Typography.Text>,
      },
    ],
    actionColumn: {
      title: 'Actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            disabled={disabled}
            onClick={() => {
              retry(record);
            }}
          >
            Retry
          </Button>
          <Button disabled={disabled}>
            <a href={record?.file} rel="noreferrer" target="_blank">
              Payload
            </a>
          </Button>
        </Space>
      ),
    },
  };

  const onDateTimeChange = value => {
    setDataRange([dayjs(value[0]), dayjs(value[1])]);
    setPageCurrent(1);
  };
  const rangePicker = (
    <DatePicker.RangePicker
      showTime={{
        format: 'HH:mm',
      }}
      format="YYYY-MM-DD HH:mm"
      onChange={onDateTimeChange}
      value={dataRange}
      allowClear={false}
    />
  );

  return isExecutionDataFetched ? (
    <FormTable
      columns={columns}
      dataSource={executionData ?? null}
      additionalButtons={rangePicker}
      disabled={disabled}
      rowKey="id"
      pagination={{
        current: pageCurrent,
        pageSize: pageSize,
        onChange: (page, size) => {
          const newPage = Math.ceil(divide((page - 1) * pageSize + 1, size));
          setPageCurrent(newPage);
          setPageSize(size);
        },
        total: executionData?.length === pageSize ? pageSize * pageCurrent + 1 : pageSize * pageCurrent,
        showQuickJumper: false,
        showTotal: (_, range) => `${range[0]}-${pageSize * (pageCurrent - 1) + executionData?.length} Runs`,
      }}
    />
  ) : (
    <Skeleton />
  );
};

export default ExecutionHistory;
