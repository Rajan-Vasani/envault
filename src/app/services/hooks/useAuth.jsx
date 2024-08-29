import {useQuery} from '@tanstack/react-query';
import {BaseService} from 'api/base.service';
import {API_QUERY} from 'app/constant/query';

export const authLoginQuery = (props = {}) => {
  const {email, password, ...options} = props;
  return {
    queryKey: [...API_QUERY.AUTH_LOGIN, email, password],
    queryFn: async () => BaseService.post(`api/auth/login`, undefined, {email, password}),
    meta: {type: 'user', id: email, method: 'login'},
    enabled: !!email,
    cacheTime: 0,
    ...options,
  };
};
export const useAuthLogin = props => useQuery(authLoginQuery(props));

export const authLogoutQuery = (props = {}) => {
  return {
    queryKey: [...API_QUERY.AUTH_LOGOUT],
    queryFn: async () => BaseService.post(`api/auth/logout`),
    meta: {type: 'user', id: '', method: 'logout'},
    cacheTime: 0,
    ...props,
  };
};
export const useAuthLogout = props => useQuery(authLogoutQuery(props));

export const authResetQuery = (props = {}) => {
  const {email, ...options} = props;
  return {
    queryKey: [...API_QUERY.AUTH_RESET, email],
    queryFn: async () => BaseService.post(`api/auth/reset_password`, undefined, {email}),
    meta: {type: 'user', id: email, method: 'reset password'},
    enabled: !!email,
    cacheTime: 0,
    ...options,
  };
};
export const useAuthReset = props => useQuery(authResetQuery(props));
