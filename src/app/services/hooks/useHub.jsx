import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {API_QUERY} from 'constant/query';
import {isNil, omitBy} from 'lodash';
import {BaseService} from 'services/api/base.service';

export const hubQuery = (props = {}) => {
  const {hub: name = globalThis.envault.hub, id, ...options} = props;
  return {
    queryKey: [API_QUERY.HUB_DATA, id || name],
    queryFn: async () => BaseService.get(`api/hub?`, {...(id ? {id} : {name})}),
    meta: {type: 'hub', id: id || name, method: 'read'},
    retry: false,
    ...options,
  };
};
export const useHub = props => useQuery(hubQuery(props));

export const useHubCreateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async data => BaseService.post(`api/hub?`, undefined, omitBy(data, isNil)),
    meta: {type: 'hub user', id: '', method: 'create'},
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: [API_QUERY.USER_DATA]});
    },
  });
};

export const useHubUpdateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async data => BaseService.patch(`api/hub?`, undefined, omitBy(data, isNil)),
    meta: {type: 'hub user', id: '', method: 'update'},
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: [API_QUERY.USER_DATA]});
    },
  });
};

export const useHubRemoveMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async query => BaseService.remove('api/hub?', query),
    meta: {type: 'hub', id: '', method: 'remove'},
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: [API_QUERY.USER_DATA]});
    },
  });
};

export const hubUserQuery = (props = {}) => {
  const {hub = globalThis.envault.hub, ...options} = props;
  return {
    queryKey: [API_QUERY.GET_HUB_USER, hub],
    queryFn: async () => BaseService.get(`api/hub-user?`, {hub}),
    meta: {type: 'hub user', id: '', method: 'read'},
    retry: false,
    enabled: !!hub,
    ...options,
  };
};
export const useHubUser = props => useQuery(hubUserQuery(props));

export const useHubUserCreateMutation = () => {
  const queryClient = useQueryClient();
  const _hub = globalThis.envault.hub;
  return useMutation({
    mutationFn: async ({hub = _hub, ...data}) => BaseService.post(`api/hub-user?`, {hub}, omitBy(data, isNil)),
    meta: {type: 'hub user', id: '', method: 'create'},
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: [API_QUERY.GET_HUB_USER]});
    },
  });
};

export const useHubUserUpdateMutation = () => {
  const queryClient = useQueryClient();
  const _hub = globalThis.envault.hub;
  return useMutation({
    mutationFn: async ({hub = _hub, ...data}) => BaseService.patch(`api/hub-user?`, {hub}, omitBy(data, isNil)),
    meta: {type: 'hub user', id: '', method: 'update'},
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: [API_QUERY.GET_HUB_USER]});
    },
  });
};

export const useHubUserRemoveMutation = () => {
  const queryClient = useQueryClient();
  const _hub = globalThis.envault.hub;
  return useMutation({
    mutationFn: async ({hub = _hub, ...query}) => BaseService.remove(`api/hub-user?`, {hub, ...query}),
    meta: {type: 'hub user', id: '', method: 'remove'},
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: [API_QUERY.GET_HUB_USER]});
    },
  });
};
