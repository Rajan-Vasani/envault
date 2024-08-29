import {Button, Collapse, Flex, Form, Input, Switch, Typography} from 'antd';
import {createStyles} from 'antd-style';
import {FormSchedule} from 'app/components/molecules/FormSchedule';
const {Text} = Typography;

const useStyles = createStyles(({css, token}) => ({
  collapse: css`
    margin-bottom: 16;
    .ant-collapse-item .ant-collapse-header {
      align-items: center;
    }
  `,
}));

export const CsiConfig = props => {
  const form = Form.useFormInstance();
  const isScheduleEnabled = Form.useWatch(['schedule', 'enable'], {form});
  const {styles} = useStyles();
  const configPrefix = ['driver', 'config'];

  return (
    <>
      <Collapse
        size={'small'}
        className={styles.collapse}
        collapsible={'icon'}
        items={[
          {
            key: 'general',
            label: 'Collection',
            extra: (
              <Form.Item layout={'horizontal'} name={['schedule', 'enable']} style={{marginBottom: 0}}>
                <Switch />
              </Form.Item>
            ),
            children: (
              <>
                <FormSchedule prefix={['schedule']} />
                <Collapse
                  size={'small'}
                  style={{marginBottom: 16}}
                  items={[
                    {
                      key: 'host',
                      label: (
                        <>
                          <Text>Host</Text> <Text type={'secondary'}>(leave blank to use defaults)</Text>
                        </>
                      ),
                      children: (
                        <>
                          <Form.Item label={'Host'} name={[...configPrefix, 'url']}>
                            <Input placeholder={'https://csiweb.envault.com.au'} />
                          </Form.Item>
                          <Flex gap={'small'} align={'flex-start'}>
                            <Form.Item label={'Username'} name={[...configPrefix, 'username']} style={{flex: 1}}>
                              <Input placeholder={'**************'} />
                            </Form.Item>
                            <Form.Item label={'Password'} name={[...configPrefix, 'password']} style={{flex: 1}}>
                              <Input placeholder={'**************'} />
                            </Form.Item>
                          </Flex>
                        </>
                      ),
                    },
                  ]}
                />
                <Collapse
                  size={'small'}
                  style={{marginBottom: 16}}
                  items={[
                    {
                      key: 'collect',
                      label: 'Collection',
                      children: (
                        <>
                          <Form.Item label={'Lookback'} name={[...configPrefix, 'lookback']}>
                            <Input addonAfter={'minutes'} type={'number'} />
                          </Form.Item>
                          <Form.Item label={'Tables'} name={[...configPrefix, 'tablename']}>
                            <Flex gap={'small'}>
                              <Form.Item noStyle>
                                <Input />
                              </Form.Item>
                              <Button type={'primary'}> Fetch </Button>
                            </Flex>
                          </Form.Item>
                        </>
                      ),
                    },
                  ]}
                />
              </>
            ),
          },
        ]}
      />
      <Collapse
        size={'small'}
        style={{marginBottom: 16}}
        items={[
          {
            key: 'map',
            label: 'Mapping',
            children: (
              <>
                <Form.Item label={'Lookback'} name={[...configPrefix, 'lookback']}>
                  <Input addonAfter={'minutes'} type={'number'} />
                </Form.Item>
                <Form.Item label={'Tables'} name={[...configPrefix, 'tablename']}>
                  <Flex gap={'small'}>
                    <Form.Item noStyle>
                      <Input />
                    </Form.Item>
                    <Button type={'primary'}> Fetch </Button>
                  </Flex>
                </Form.Item>
              </>
            ),
          },
        ]}
      />
    </>
  );
};
