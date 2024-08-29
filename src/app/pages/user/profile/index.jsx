import {App, Avatar, Button, Card, Flex, Form, Input} from 'antd';
import {createStyles} from 'antd-style';
import {routes} from 'app/constant/routes';
import Icon from 'components/atoms/Icon';
import {useUser, useUserUpdateMutation} from 'hooks/useUser';
import {isNil, omitBy} from 'lodash';
import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {getInitials} from 'utils/string';

const useStyles = createStyles(({token, css}) => ({
  card: css`
    box-shadow: ${token.boxShadowTertiary};
    border: 1px solid ${token.colorBorder};
    width: 100%;
  `,
  cardTitle: css`
    text-align: center;
  `,
}));

export const ProfileForm = () => {};

export const Component = props => {
  const {data: [user] = [{}], isFetched} = useUser();
  const {mutate: updateUser} = useUserUpdateMutation();
  const [loading, setLoading] = useState();
  const [isEditing, setIsEditing] = useState(false);
  const {notification} = App.useApp();
  const [form] = Form.useForm();
  const {styles} = useStyles();

  useEffect(() => {
    if (!isFetched) return;
    if (!user) return;
    form.setFieldsValue(user);
  }, [form, user, isFetched]);

  const onFinish = values => {
    setLoading(true);
    updateUser(omitBy(values, isNil), {
      onSuccess: () => {
        notification.success({description: 'Successfully updated details'});
      },
      onError: () => {
        notification.error({description: 'Could not update user'});
      },
      onSettled: () => {
        setIsEditing(false);
        setLoading(false);
      },
    });
  };
  const handleSave = () => {
    form.submit();
  };

  const handleEdit = value => {
    if (isEditing) {
      form.resetFields();
      form.setFieldsValue(user);
    }
    setIsEditing(editing => !editing);
  };

  return (
    <Card
      title={'Profile'}
      className={styles.card}
      classNames={{title: styles.cardTitle}}
      extra={
        <Button
          key={'edit'}
          type={'text'}
          onClick={handleEdit}
          icon={isEditing ? <Icon icon={'CloseOutlined'} type={'ant'} /> : <Icon icon={'EditOutlined'} type={'ant'} />}
        />
      }
    >
      <Form form={form} onFinish={onFinish} requiredMark={'optional'} disabled={!isEditing} layout={'vertical'}>
        <Flex vertical align={'center'}>
          <Avatar
            size={64}
            style={{
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            {getInitials(user?.name)}
          </Avatar>
        </Flex>
        <Form.Item hidden name={'id'}>
          <Input type={'hidden'} />
        </Form.Item>
        <Form.Item
          label={'Username'}
          name={'name'}
          rules={[
            {
              required: true,
              message: 'Username cannot be blank.',
            },
          ]}
        >
          <Input />
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
          <Input />
        </Form.Item>
        <Form.Item
          name={'password'}
          label={'Password'}
          rules={[{min: 6, message: 'Password must be at least 6 characters.'}]}
          hasFeedback
        >
          <Input.Password placeholder={'**************'} />
        </Form.Item>
        <Form.Item
          name={'confirm'}
          label={'Confirm Password'}
          rules={[
            ({getFieldValue}) => ({required: getFieldValue('password'), message: 'Please confirm your password!'}),
            ({getFieldValue}) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('The new password that you entered do not match!'));
              },
            }),
          ]}
          dependencies={['password']}
          hasFeedback
        >
          <Input.Password placeholder={'**************'} />
        </Form.Item>
      </Form>
      {isEditing ? (
        <Button
          block
          type={'primary'}
          onClick={handleSave}
          loading={loading}
          disabled={!isEditing}
          icon={<Icon icon={'SaveOutlined'} type={'ant'} />}
        >
          Save
        </Button>
      ) : (
        <Link to={routes.logout}>
          <Button block key={'save'} danger type={'default'} icon={<Icon icon={'LogoutOutlined'} type={'ant'} />}>
            Logout
          </Button>
        </Link>
      )}
    </Card>
  );
};

Component.displayName = 'PersonalProfile';
