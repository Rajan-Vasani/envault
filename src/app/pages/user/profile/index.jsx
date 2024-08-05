import {EditOutlined} from '@ant-design/icons';
import {App, Button, Form, Input} from 'antd';
import {useUser, useUserUpdateMutation} from 'hooks/useUser';
import {useEffect, useState} from 'react';

export const Component = props => {
  const {data: [user] = [{}], isFetched} = useUser();
  const {mutate: updateUser} = useUserUpdateMutation();
  const [loading, setLoading] = useState();
  const {notification} = App.useApp();
  const [isEditing, setEditing] = useState(false);
  const [form] = Form.useForm();
  const [submittable, setSubmittable] = useState(false);
  const values = Form.useWatch([], form);

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
    <div className="flex justify-center items-center">
      <div className="bg-blue-800 w-[500px] md:w-[500px] lg:w-[600px] h-40 rounded-lg absolute top-24 drop-shadow-lg"></div>
      <div className="mt-16 p-10 pb-2 w-full max-w-md bg-white drop-shadow-xl text-xl rounded-xl">
        <Form form={form} name="validateOnly" layout="vertical" autoComplete="off" onFinish={onFinish}>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-center flex-grow text-xl font-semibold tracking-wider">User Profile</h1>
            <EditOutlined className="ml-2 cursor-pointer" onClick={() => setEditing(!isEditing)} />
          </div>
          <hr className="mb-7" />
          <div className="space-y-7 mb-2">
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
              className="w-full mt-8"
            >
              Save
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

Component.displayName = 'PersonalProfile';
