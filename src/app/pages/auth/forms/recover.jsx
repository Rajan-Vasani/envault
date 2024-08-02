import {useQueryClient} from '@tanstack/react-query';
import {Alert, Button, Form, Input, Result, Space} from 'antd';
import Icon from 'components/atoms/Icon';
import {API_QUERY} from 'constant/query';
import {routes} from 'constant/routes';
import {useAuthReset} from 'hooks/useAuth';
import {useUserRecovery} from 'hooks/useUser';
import {jwtDecode} from 'jwt-decode';
import {useEffect, useState} from 'react';
import {Link, useNavigate, useSearchParams} from 'react-router-dom';
import {useAuthLogin} from 'services/hooks/useAuth';
import {useHub} from 'services/hooks/useHub';

export const Component = props => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [credentials, setCredentials] = useState({email: null, name: null, password: null});
  const [errorMessage, setErrorMessage] = useState(null);
  const params = token ? jwtDecode(token) : null;
  const {data: hub} = useHub();
  const {
    isFetched: isResetFetched,
    isInitialLoading: isResetLoading,
    isError: isResetError,
    error: resetError,
  } = useAuthReset({
    ...credentials,
    enabled: !!(!params && credentials.email),
  });

  const {
    isFetched: isRecoverFetched,
    isInitialLoading: isRecoverLoading,
    isError: isRecoverError,
    error: recoverError,
  } = useUserRecovery({
    ...credentials,
    token,
    retry: false,
  });

  const {
    data: userData,
    isError: isAuthError,
    error: authError,
    isFetched: isAuthFetched,
    refetch,
    isInitialLoading: isAuthLoading,
  } = useAuthLogin({
    ...credentials,
    enabled: false,
    retry: false,
  });

  const queryClient = useQueryClient();

  // Redirect to the specified page if authentication is successful
  useEffect(() => {
    if (isAuthFetched) {
      if (!isAuthError) {
        queryClient.setQueryData([API_QUERY.USER_DATA, userData[0].id], userData);
        navigate(searchParams.get('redirect') ?? '/');
      }
    }
  }, [isAuthError, isAuthFetched, navigate, queryClient, searchParams, userData]);

  // Get and set error message if there is an error during password reset or recovery
  useEffect(() => {
    async function getError(res) {
      const body = await res.text();
      try {
        const text = JSON.parse(body);
        setErrorMessage(text);
      } catch {
        setErrorMessage({message: body});
      }
    }
    if (isResetError) {
      getError(resetError);
    }
    if (isRecoverError) {
      getError(recoverError);
    }
    if (isAuthError) {
      getError(authError);
    }
  }, [authError, isAuthError, isRecoverError, isResetError, recoverError, resetError]);

  const isInitialLoading = isResetLoading || isRecoverLoading;
  const isError = isResetError || isRecoverError || isAuthError;
  const values = {email: token ? params.email : null};

  return isRecoverFetched && !isRecoverError ? (
    <Result
      status="success"
      title="You're all set!"
      subTitle={`Login to the ${hub?.[0]?.full_name} hub now?`}
      extra={[
        <Button type="primary" key="hubLogin" loading={isAuthLoading} onClick={refetch}>
          Login to Hub
        </Button>,
      ]}
    />
  ) : isResetFetched && !isResetError ? (
    <Result
      status="success"
      title="Password reset request submitted"
      subTitle={`You will receive a notification shortly with steps to continue`}
      extra={[
        <Button type="primary" key="login">
          <Link to={routes.login}>Back to Login</Link>
        </Button>,
      ]}
    />
  ) : (
    <Form
      validateTrigger={'onSubmit'}
      initialValues={values}
      onFinish={setCredentials}
      style={{width: '100%', marginBottom: '20'}}
    >
      {isError && <Alert message={`Error: ${errorMessage?.message}`} type={'error'} showIcon closable />}
      <Form.Item name="email" rules={[{type: 'email', required: true}]} hasFeedback>
        <Input
          autoFocus={true}
          prefix={<Icon icon={'MailOutlined'} type={'ant'} />}
          placeholder="Email Address"
          disabled={params?.type === 'password_reset'}
        />
      </Form.Item>
      {token && (
        <>
          {params?.type === 'user_register' && (
            <Form.Item name="name" rules={[{type: 'string'}]} hasFeedback>
              <Input autoFocus={true} prefix={<Icon icon={'UserOutlined'} type={'ant'} />} placeholder="Name" />
            </Form.Item>
          )}
          <Form.Item
            name="password"
            rules={[
              {type: 'password', required: true, message: 'Enter your new password'},
              {min: 6, message: 'Must be at least 6 characters'},
              {pattern: `.*[0-9].*`, message: 'Must have at least 1 number'},
            ]}
            validateTrigger={'onChange'}
            hasFeedback
          >
            <Input.Password
              autoFocus={true}
              prefix={<Icon icon={'LockOutlined'} type={'ant'} />}
              placeholder="Password"
            />
          </Form.Item>
          <Form.Item
            name="confirm"
            rules={[
              {type: 'password', required: true, message: 'Confirm your password'},
              ({getFieldValue}) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
            validateTrigger={'onChange'}
            hasFeedback
          >
            <Input.Password
              autoFocus={true}
              prefix={<Icon icon={'LockOutlined'} type={'ant'} />}
              placeholder="Confirm Password"
            />
          </Form.Item>
        </>
      )}
      <Space direction={'horizontal'}>
        <Button type="primary" htmlType="submit" loading={isInitialLoading}>
          Let&apos;s go
        </Button>
        <Button type="text" key="login">
          <Link to={routes.login}>Return to Login</Link>
        </Button>
      </Space>
    </Form>
  );
};
Component.displayName = 'Recover';
