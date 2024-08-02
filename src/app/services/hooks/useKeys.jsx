import {useMutation, useQuery} from '@tanstack/react-query';
import {BaseService} from 'api/base.service';
import {API_QUERY} from 'constant/query';
import {isNil, omitBy} from 'lodash';

export const hubKeyQuery = (props = {}) => {
  const {hub, ...options} = props;
  return {
    queryKey: [API_QUERY.GET_HUB_API_KEY, hub],
    queryFn: async () => BaseService.get(`api/role-api-key?`, {hub}),
    meta: {type: 'API key', id: 'all', method: 'read'},
    retry: false,
    ...options,
  };
};
export const useHubKey = props => useQuery(hubKeyQuery(props));

export const roleKeyQuery = (props = {}) => {
  const {hub, role, ...options} = props;
  return {
    queryKey: [API_QUERY.GET_ROLE_API_KEY, hub, role],
    queryFn: async () => BaseService.get(`api/role-member?`, {hub, role}),
    meta: {type: 'role member', id: role, method: 'read'},
    retry: false,
    ...options,
  };
};
export const useRoleKey = props => useQuery(roleKeyQuery(props));

export const useRoleKeyPutMutation = () => {
  return useMutation({
    mutationFn: async ({hub, ...data}) => BaseService.put(`api/role-api-key?`, {hub}, omitBy(data, isNil)),
    meta: {type: 'API key', id: 'all', method: 'create / update'},
    onSettled: () => {},
  });
};

export const useRoleKeyDeleteMutation = () => {
  return useMutation({
    mutationFn: async ({hub, role, key}) => BaseService.remove(`api/role-api-key?`, {hub, role, key}),
    meta: {type: 'API key', id: 'all', method: 'remove'},
    onSettled: () => {},
  });
};
