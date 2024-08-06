import {App, Button, Card, Form, Input} from 'antd';
import {createStyles} from 'antd-style';
import {Icon} from 'components/atoms/Icon';
import {useUser, useUserUpdateMutation} from 'hooks/useUser';
import {useEffect, useState} from 'react';

const useStyles = createStyles(({token, css}) => ({
  mainDiv: css`
    display: flex;
    justify-content: center;
    align-items: center;
  `,
  backgroundDiv: css`
    width: 500px;
    height: 10rem;
    border-radius: 0.5rem;
    position: absolute;
    top: 6rem;
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
    background-color: ${token.colorPrimary};
    @media (min-width: 768px) {
      width: 500px;
    }
    @media (min-width: 1024px) {
      width: 600px;
    }
  `,
  formContainer: css`
    margin-top: 4rem;
    position: relative;
    padding: 0.5rem 1.2rem 0.5rem 1.2rem;
    width: 100%;
    max-width: 28rem;
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.2);
    font-size: 1.25rem;
    border-radius: 0.75rem;
  `,
  formHeader: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  `,
  formTitle: css`
    flex-grow: 1;
    text-align: center;
    font-size: 1.25rem;
    font-weight: 600;
    letter-spacing: 0.05rem;
  `,
  editButton: css`
    margin-left: 0.5rem;
    cursor: pointer;
    border: 1px solid black;
    padding: 4px;
    border-radius: 5px;
  `,
  divider: css`
    margin-bottom: 1.75rem;
  `,
  formItems: css`
    margin-bottom: 2rem;
    & > * {
      margin-bottom: 1.75rem;
    }
  `,
  submitButton: css`
    width: 100%;
    margin-top: 0.5rem;
    background-color: ${token.colorPrimary};
  `,
}));

export const Component = props => {
  const {data: [user] = [{}], isFetched} = useUser();
  const {mutate: updateUser} = useUserUpdateMutation();
  const [loading, setLoading] = useState();
  const {notification} = App.useApp();
  const [isEditing, setEditing] = useState(false);
  const [form] = Form.useForm();
  const [submittable, setSubmittable] = useState(false);
  const values = Form.useWatch([], form);
  const {styles} = useStyles();

  useEffect(() => {
    form
      .validateFields({validateOnly: true})
      .then(() => setSubmittable(true))
      .catch(() => setSubmittable(false));
  }, [form, values]);

  useEffect(() => {
    if (!isFetched) return;
    if (!user) return;
    form.setFieldsValue(user);
  }, [isFetched, user]);

  const onFinish = values => {
    setLoading(true);
    updateUser(values, {
      onSuccess: () => {
        notification.success({description: 'Successfully updated details'});
      },
      onError: () => {
        notification.error({description: 'Could not update user'});
      },
      onSettled: () => {
        setEditing(false);
        setLoading(false);
      },
    });
  };
  const onSave = values => {
    form.submit();
  };

  return (
    <div className={styles.mainDiv}>
      <div className={styles.backgroundDiv}></div>
      <Card className={styles.formContainer}>
        <Form form={form} name="validateOnly" layout="vertical" autoComplete="off" onFinish={onFinish}>
          <div className={styles.formHeader}>
            <h1 className={styles.formTitle}>User Profile</h1>
            <Icon
              icon={!isEditing ? 'LockOutlined' : 'UnlockOutlined'}
              type="ant"
              shape="circle"
              className={styles.editButton}
              onClick={() => setEditing(!isEditing)}
            />
          </div>
          <hr className={styles.divider} />
          <div className={styles.formItems}>
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
            <Form.Item
              name={'password'}
              label={'Password'}
              rules={[
                {
                  required: true,
                  type: 'string',
                },
                {min: 6, message: 'Password must be at least 6 characters.'},
              ]}
              hasFeedback
            >
              <Input.Password disabled={!isEditing} />
            </Form.Item>
            <Form.Item
              name={'confirm'}
              label={'Confirm Password'}
              rules={[
                {
                  required: true,
                  type: 'string',
                  message: 'Please confirm your password!',
                },
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
              <Input.Password disabled={!isEditing} />
            </Form.Item>
          </div>
          <Form.Item>
            <Button
              key={'save'}
              type={'primary'}
              onClick={onSave}
              loading={loading}
              disabled={!isEditing || !submittable}
              className={styles.submitButton}
            >
              Save
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

Component.displayName = 'PersonalProfile';
