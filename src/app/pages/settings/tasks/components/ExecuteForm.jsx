import {useQueryClient} from '@tanstack/react-query';
import {Button, Form, Input, Space} from 'antd';
import {createStyles} from 'antd-style';
import {API_QUERY} from 'app/constant/query';
import {useTaskExecutionPayload} from 'app/services/hooks/useTask';
import {useState} from 'react';

const useStyles = createStyles(({css, token}) => ({
  content: css`
    min-height: 260px;
    padding: 16px;
    color: ${token.colorTextTertiary};
    background-color: ${token.colorFillAlter};
    border-radius: ${token.borderRadiusLG};
    display: flex;
    flex-direction: column;
  `,
  formatButton: css`
    position: absolute;
    z-index: 1;
    top: 8px;
    right: 8px;
  `,
}));

const {TextArea} = Input;
const ExecuteForm = props => {
  const {record, onCancel = () => {}, message} = props;
  const [form] = Form.useForm();
  const {mutate: executePayload} = useTaskExecutionPayload();
  const queryClient = useQueryClient();
  const [text, setText] = useState();
  const {styles} = useStyles();

  const onFinish = values => {
    message.open({type: 'infor', content: 'Executing payload...'});
    executePayload(
      {task: record?.id, payload: JSON.parse(values?.payload)},
      {
        onSuccess: () => {
          message.open({type: 'success', content: 'Payload executed!'});
        },
        onError: () => {
          message.open({type: 'error', content: 'Could not executed this payload! Please try again later!'});
        },
        onSettled: () => {
          queryClient.invalidateQueries({queryKey: [API_QUERY.GET_ALL_TASK]});
        },
      },
    );
  };
  const formatInput = () => {
    try {
      const payload = JSON.parse(text);
      form.setFieldsValue({payload: JSON.stringify(payload, null, 2)});
    } catch (error) {
      console.log(error);
    }
  };
  const handlePayloadChange = e => {
    setText(e.target.value);
  };

  return (
    <Form labelCol={{span: 6}} wrapperCol={{span: 18}} form={form} onFinish={onFinish}>
      <div style={{position: 'relative'}}>
        <Button type="button" onClick={formatInput} className={styles.formatButton}>
          JSON
        </Button>
        <Form.Item name="payload" wrapperCol={{span: 24}}>
          <TextArea
            className={styles.content}
            rows={16}
            placeholder="Your payload here"
            onChange={handlePayloadChange}
          />
        </Form.Item>
        <Form.Item wrapperCol={{span: 24}} style={{textAlign: 'center'}}>
          <Space>
            <Button htmlType="submit" type="primary">
              Execute
            </Button>
            <Button type="button" onClick={() => onCancel()}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </div>
    </Form>
  );
};

export default ExecuteForm;
