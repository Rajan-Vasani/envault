import {ExclamationCircleOutlined} from '@ant-design/icons';
import {App, Button, Card, Form, Input, Popconfirm} from 'antd';
import {createStyles} from 'antd-style';
import {useUser, useUserUpdateMutation} from 'hooks/useUser';
import {useEffect, useState} from 'react';

const useStyles = createStyles(({token, css}) => ({
  card: css`
    box-shadow: ${token.boxShadowTertiary};
    border: 1px solid ${token.colorBorder};
  `,
}));

export const Component = props => {
  const {data: [user] = [{}], isFetched} = useUser();
  const {mutate: updateUser} = useUserUpdateMutation();
  const [loading, setLoading] = useState();
  const {notification} = App.useApp();
  const [isEditing, setEditing] = useState(false);
  const [form] = Form.useForm();
  const {styles} = useStyles();

  useEffect(() => {
    if (!isFetched) return;
    if (!user) return;
    form.setFieldsValue({username: user.name, email: user.email});
  }, [isFetched, user]);

  const onFinish = values => {
    setLoading(true);
    updateUser(values, {
      onSuccess: () => {
        notification.open({type: 'success', description: 'Successfully updated details'});
      },
      onError: () => {
        notification.open({type: 'error', description: 'Could not update user'});
      },
      onSettled: () => {
        setEditing(false);
        setLoading(false);
      },
    });
  };

  return (
    <Card
      className={styles.card}
      title={'User Profile'}
      actions={[
        <Button
          key={'edit'}
          type={'default'}
          onClick={() => {
            setEditing(!isEditing);
          }}
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </Button>,
        <Button key={'save'} type={'primary'} htmlType={'submit'} loading={loading} disabled={!isEditing}>
          Save
        </Button>,
        <Popconfirm
          key={'reset'}
          title={'Confirm password reset'}
          okText={'Reset'}
          icon={<ExclamationCircleOutlined style={{color: 'red'}} />}
        >
          <Button danger={true}>Reset Password</Button>
        </Popconfirm>,
      ]}
    >
      <Form form={form} onFinish={onFinish} labelCol={{span: 4}} labelWrap={true} requiredMark={'optional'}>
        <Form.Item hidden name={'id'}>
          <Input type={'hidden'} />
        </Form.Item>
        <Form.Item
          label={'Username'}
          name={'username'}
          rules={[
            {
              required: true,
              message: 'Username cannot be blank.',
            },
          ]}
        >
          <Input disabled={!isEditing} />
        </Form.Item>
        <Form.Item
          label={'Email Address'}
          name={'email'}
          rules={[
            {
              required: true,
              message: 'Email cannot be blank.',
            },
            {
              type: 'email',
              message: 'Please enter a valid email address.',
            },
          ]}
        >
          <Input disabled={!isEditing} />
        </Form.Item>
      </Form>
    </Card>
  );
};

Component.displayName = 'PersonalProfile';
