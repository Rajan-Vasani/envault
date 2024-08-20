import {Button, Flex, Form, Input, Switch} from 'antd';
import {Schedule} from 'components/molecules/Schedule';
export const CsiConfig = props => {
  const form = Form.useFormInstance();
  const isScheduleEnabled = Form.useWatch(['schedule', 'enable'], {form});
  return (
    <>
      <Form.Item layout={'horizontal'} label={'Schedule'} name={['schedule', 'enable']} style={{marginBottom: 0}}>
        <Switch />
      </Form.Item>
      {isScheduleEnabled && (
        <>
          <Form.Item name={['schedule', 'set']}>
            <Schedule />
          </Form.Item>
          <Form.Item label={'Host'} name={['url']}>
            <Input />
          </Form.Item>
          <Flex gap={'small'} align={'flex-start'}>
            <Form.Item label={'Username'} name={['username']} style={{flex: 1}}>
              <Input />
            </Form.Item>
            <Form.Item label={'Password'} name={['password']} style={{flex: 1}}>
              <Input />
            </Form.Item>
          </Flex>
          <Form.Item label={'Lookback'} name={['lookback']}>
            <Input />
          </Form.Item>
          <Form.Item label={'Tables'} name={['tablename']}>
            <Flex gap={'small'}>
              <Form.Item noStyle>
                <Input />
              </Form.Item>
              <Button type={'primary'}> Fetch </Button>
            </Flex>
          </Form.Item>
        </>
      )}
    </>
  );
};
