import {useMutation, useQueries, useQuery, useQueryClient} from '@tanstack/react-query';
import {BaseService} from 'api/base.service';
import {API_QUERY} from 'constant/query';
import Cookies from 'js-cookie';
import {isNil, omitBy, union} from 'lodash';
import {useCallback, useMemo} from 'react';
import {hubUserQuery, useHubUser} from './useHub';
import {roleQuery, useRole, useUserRoles} from './useRole';

export const userQuery = (props = {}) => {
  const {_id = Cookies.get('uid'), ...options} = props;
  const id = +_id;
  return {
    queryKey: [...API_QUERY.USER, id],
    queryFn: async () => BaseService.get(`api/user?`, {id}),
    meta: {type: 'user', id, method: 'read'},
    enabled: !!id,
    retry: false,
    ...options,
  };
};

export const useUser = props => useQuery(userQuery(props));

export const allUserQuery = () => {
  return {
    queryKey: API_QUERY.USER,
    queryFn: async () => BaseService.get('api/user'),
    meta: {type: 'user', id: 'all', method: 'read'},
    retry: false,
  };
};

export const useAllUser = props => useQuery(allUserQuery(props));

export const useUserUpdateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async data => BaseService.patch('api/user', undefined, omitBy(data, isNil)),
    meta: {type: 'user', id: '', method: 'update'},
    onSettled: () => {
      queryClient.refetchQueries({queryKey: API_QUERY.USER});
    },
  });
};

export const userRecoveryQuery = (props = {}) => {
  const {name, password, token, ...options} = props;
  return {
    queryKey: [...API_QUERY.AUTH_RECOVER, password, token],
    queryFn: async () => BaseService.patch(`api/user?`, {access_token: token}, {...(name && {name}), password}),
    meta: {type: 'user', id: 'recovery', method: 'update'},
    enabled: !!(password && token),
    cacheTime: 0,
    ...options,
  };
};
export const useUserRecovery = props => useQuery(userRecoveryQuery(props));

export const useHubUserRoles = (props = {}) => {
  const {hub = globalThis.envault.hub} = props;
  const userQuery = useHubUser({hub});
  const userData = userQuery.data || [];
  const roleQuery = useRole({hub});
  const userRolesQuery = useUserRoles({hub, users: userData.map(user => user.id)});
  const results = [userQuery, roleQuery, userRolesQuery];
  const isLoading = results.some(query => query.isLoading);
  const isSomeSuccess = results.some(query => query.isSuccess);
  const isSuccess = results.every(query => query.isSuccess);
  const isError = results.some(query => query.isError);
  const [users, roles, userRoleMap] = results.map(query => query.data);
  // need to sort this out, re-rendering too much, or not enough
  const result = useMemo(() => {
    const data = isSuccess
      ? users?.map(user => {
          const userRoleIds = userRoleMap?.filter(link => link.user === user.id).map(link => link.role);
          const userRoles = roles.filter(role => userRoleIds.includes(role.id));
          return {
            ...user,
            roles: userRoles,
          };
        })
      : [];

    return {
      isLoading,
      isSuccess,
      isSomeSuccess,
      isError,
      data,
    };
  }, [isSuccess, isLoading, isSomeSuccess, isError, users, userRoleMap, roles]);
  return result;
};

export const useOwner = (props = {}) => {
  const {hub = globalThis.envault.hub, user} = props;
  const userId = user?.id || Cookies.get('uid');
  return useQueries({
    queries: [userQuery({id: userId}), roleQuery({hub}), hubUserQuery({hub})],
    combine: useCallback(
      results => {
        const [user, role, hubUser] = results;
        const isLoading = results.some(query => query.isLoading);
        const isSuccess = results.every(query => query.isSuccess);
        const isError = results.some(query => query.isError);
        const isSomeSuccess = results.some(query => query.isSuccess);
        const userData = user.isSuccess && user.data[0];
        const isAppAdmin = !!userData?.app_admin;
        const isHubAdmin = !!userData?.hubs?.find(h => h.id === hub)?.is_admin;
        const isAdmin = isAppAdmin || isHubAdmin;
        const hubUserData = hubUser.isSuccess
          ? hubUser.data.map(user => ({...user, disabled: isAdmin ? !isAdmin : user.id !== userData.id}))
          : [];
        const actorData = union(hubUserData, role.data);
        return {
          isLoading,
          isSuccess,
          isSomeSuccess,
          isError,
          data: actorData,
        };
      },
      [hub],
    ),
  });
};
