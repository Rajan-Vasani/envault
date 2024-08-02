import {useQueryClient} from '@tanstack/react-query';
import {Alert, Button, Form, Input, Space} from 'antd';
import Icon from 'app/components/atoms/Icon';
import {API_QUERY} from 'constant/query';
import {routes} from 'constant/routes';
import {useCallback, useEffect, useState} from 'react';
import {Link, useNavigate, useSearchParams} from 'react-router-dom';
import {useAuthLogin} from 'services/hooks/useAuth';

export const Component = props => {
  const [values, setValues] = useState({email: '', password: '', remember: false});
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {data, isError, error, isFetched, isInitialLoading} = useAuthLogin({
    ...values,
    retry: false,
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isFetched) {
      if (!isError) {
        queryClient.setQueryData([API_QUERY.USER_DATA, data?.[0]?.id], data);
        navigate(searchParams.get('redirect') ?? '/');
      }
    }
  }, [data, isError, isFetched, navigate, queryClient, searchParams]);

  const errorAlert = useCallback(() => {
    if (isError) {
      const {status} = error;
      let message = `Invalid Username or Password`;
      let type = `error`;
      if (status >= 500) {
        message = `We're having trouble contacting the ${globalThis.envault.hub} Hub, please try again later`;
        type = `info`;
      }
      return <Alert message={message} type={type} showIcon closable />;
    }
  }, [error, isError]);

  return (
    <Form
      initialValues={values}
      validateTrigger={'onSubmit'}
      onFinish={setValues}
      style={{width: '100%', marginBottom: '20'}}
    >
      {errorAlert()}
      <Form.Item name="email" rules={[{type: 'email', required: true}]}>
        <Input
          autoFocus={!values.email}
          prefix={<Icon icon="UserOutlined" type={'ant'} />}
          placeholder="Email Address"
        />
      </Form.Item>
      <Form.Item name="password" rules={[{required: true}]}>
        <Input.Password
          autoFocus={values.password}
          prefix={<Icon icon="LockOutlined" type={'ant'} />}
          type="password"
          placeholder="Password"
        />
      </Form.Item>
      <Space direction={'horizontal'}>
        <Button type="primary" htmlType="submit" loading={isInitialLoading}>
          Log in
        </Button>
        <Button type="text" key="login">
          <Link to={routes.recover}>Forgot password</Link>
        </Button>
      </Space>
    </Form>
  );
};
Component.displayName = 'Login';
