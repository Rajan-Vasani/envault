import {useMutation, useQueries, useQuery, useQueryClient} from '@tanstack/react-query';
import {BaseService} from 'api/base.service';
import {API_QUERY} from 'constant/query';
import {compact, isNil, omitBy} from 'lodash';
import {useCallback} from 'react';

export const roleQuery = (props = {}) => {
  const {hub = globalThis.envault.hub, role, ...options} = props;
  const query = omitBy({hub, role}, isNil);
  return {
    queryKey: [...API_QUERY.ROLE, ...Object.values(query)],
    queryFn: async () => BaseService.get(`api/role?`, query),
    meta: {type: 'role', id: role || 'all', method: 'read'},
    retry: false,
    ...options,
  };
};
export const useRole = props => useQuery(roleQuery(props));

export const roleMemberQuery = (props = {}) => {
  const {hub, user, role, ...options} = props;
  const query = omitBy({hub, user, role}, isNil);
  return {
    queryKey: [...API_QUERY.ROLE_MEMBER, ...Object.values(query)],
    queryFn: async () => BaseService.get(`api/role-member?`, query),
    meta: {type: 'role member', id: 'all', method: 'read'},
    retry: false,
    ...options,
  };
};
export const useRoleUsers = props => {
  const {hub = globalThis.envault.hub, roles} = props;
  return useQueries({
    queries: roles ? roles.map(role => roleMemberQuery({hub, role})) : [],
    combine: useCallback(
      results => ({
        isLoading: results.some(query => query.isLoading),
        isSuccess: results.length ? results.every(query => query.isSuccess) : false,
        isSomeSuccess: results.some(query => query.isSuccess),
        isError: results.some(query => query.isError),
        data: results.map(result => result.data).reduce((a, v) => ({...a, ...v}), {}),
      }),
      [],
    ),
  });
};

export const useUserRoles = props => {
  const {hub = globalThis.envault.hub, users} = props;
  return useQueries({
    queries: users ? users.map(user => roleMemberQuery({hub, user})) : [],
    combine: useCallback(
      results => ({
        isLoading: results.some(query => query.isLoading),
        isSuccess: results.length ? results.every(query => query.isSuccess) : false,
        isSomeSuccess: results.some(query => query.isSuccess),
        isError: results.some(query => query.isError),
        data: compact(results.map(result => result.data).reduce((a, v) => a.concat(v), [])),
      }),
      [],
    ),
  });
};

export const useRolePutMutation = () => {
  const queryClient = useQueryClient();
  const _hub = globalThis.envault.hub;
  return useMutation({
    mutationFn: async ({hub = _hub, ...data}) => BaseService.put(`api/role?`, {hub}, omitBy(data, isNil)),
    meta: {type: 'role', id: '', method: 'create / update'},
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: API_QUERY.ROLE});
    },
  });
};

export const useRoleDeleteMutation = () => {
  const _hub = globalThis.envault.hub;
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({hub = _hub, ...query}) => BaseService.remove(`api/role?`, {hub, ...query}),
    meta: {type: 'role', id: '', method: 'delete'},
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: API_QUERY.ROLE});
    },
  });
};

export const useRoleMemberPutMutation = () => {
  const queryClient = useQueryClient();
  const _hub = globalThis.envault.hub;
  return useMutation({
    mutationFn: async ({hub = _hub, ...data}) => BaseService.put(`api/role-member?`, {hub}, omitBy(data, isNil)),
    meta: {type: 'role member', id: '', method: 'create / update'},
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: API_QUERY.ROLE});
    },
  });
};

export const useRoleMemberDeleteMutation = () => {
  const queryClient = useQueryClient();
  const _hub = globalThis.envault.hub;
  return useMutation({
    mutationFn: async ({hub = _hub, ...query}) => BaseService.remove(`api/role-member?`, {hub, ...query}),
    meta: {type: 'role member', id: '', method: 'delete'},
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: API_QUERY.ROLE});
    },
  });
};
