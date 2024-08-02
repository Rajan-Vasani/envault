import {useMutation, useQueries, useQuery, useQueryClient} from '@tanstack/react-query';
import {App} from 'antd';
import {BaseService} from 'api/base.service';
import {API_QUERY} from 'constant/query';
import {isNil, omitBy} from 'lodash';
import {useCallback} from 'react';
import {capitaliseString} from 'utils/string';
import {arrayToTree, findDescendants, nodeTypeFilter} from 'utils/tree';

export const nodeQuery = (props = {}) => {
  const {hub = globalThis.envault.hub, type = 'node', id, ...options} = props;
  const key = Object.values(omitBy({hub, type, id}, isNil));
  const query = omitBy({hub, id}, isNil);
  return {
    queryKey: [API_QUERY.NODE_DATA, ...key],
    queryFn: async () => BaseService.get(`api/${type}?`, query),
    meta: {type: 'node', id: 'all', method: 'read'},
    enabled: !!hub,
    ...options,
  };
};
export const useNode = (props = {}) => useQuery(nodeQuery(props));

export const actorNodeACLQuery = (props = {}) => {
  const {hub = globalThis.envault.hub, actor, ...options} = props;
  return {
    queryKey: [API_QUERY.GET_NODE_ACL_ROLE, hub, actor],
    queryFn: async () => BaseService.get(`api/node-acl?`, {hub, actor: actor}),
    meta: {type: 'access control', id: actor, method: 'read'},
    retry: false,
    enabled: !!(actor && hub),
    ...options,
  };
};

export const useActorNodeACL = props => useQuery(actorNodeACLQuery(props));

export const useActorNodeACLList = props => {
  const {hub, actors, ...rest} = props;
  return useQueries({
    queries: actors ? actors.map(({id}) => actorNodeACLQuery({hub, actor: id, ...rest})) : [],
    combine: useCallback(results => ({
      isLoading: results.some(query => query.isLoading),
      isSuccess: results.every(query => query.isSuccess),
      isSomeSuccess: results.some(query => query.isSuccess),
      isError: results.some(query => query.isError),
      data: actors.reduce((acc, {id}, index) => ({...acc, [id]: results[index].data}), {}),
    })),
  });
};

export const useNodeACLPutMutation = () => {
  const queryClient = useQueryClient();
  const _hub = globalThis.envault.hub;

  return useMutation({
    mutationFn: async ({hub = _hub, ...data}) => BaseService.put(`api/node-acl?`, {hub}, omitBy(data, isNil)),
    meta: {type: 'access control', id: '', method: 'update / create'},
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: [API_QUERY.NODE_DATA]});
    },
  });
};

export const useNodeACLDeleteMutation = () => {
  const queryClient = useQueryClient();
  const _hub = globalThis.envault.hub;

  return useMutation({
    mutationFn: async ({hub = _hub, ...query}) => BaseService.remove(`api/node-acl?`, {hub, ...query}),
    meta: {type: 'access control', id: '', method: 'remove'},
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: [API_QUERY.NODE_DATA]});
    },
  });
};

export const useNodeDescendants = props => {
  const {id, ...rest} = props;
  return useNode({
    select: useCallback(data => findDescendants(data, id), [id]),
    ...rest,
  });
};

export const useNestedNode = props => {
  return useNode({select: useCallback(data => arrayToTree(data), []), ...props});
};

export const useNodeFilter = props => {
  const {filters, ...rest} = props;
  return useNode({
    select: useCallback(data => nodeTypeFilter(data, filters), [filters]),
    ...rest,
  });
};

export const useNestedNodeFilter = props => {
  const {filters = [], ...rest} = props;
  return useNode({
    select: useCallback(
      data =>
        arrayToTree(
          nodeTypeFilter(
            data.filter(node => !node.deleted),
            filters,
          ),
        ),
      [filters],
    ),
    ...rest,
  });
};

export const useNodeSaveMutation = (props = {}) => {
  const {hub: _hub = globalThis.envault.hub, type: _type} = props;
  const queryClient = useQueryClient();
  const {notification} = App.useApp();

  const updateNode = async newNode => {
    await queryClient.cancelQueries([API_QUERY.NODE_DATA, _hub, 'node']);
    queryClient.setQueryData([API_QUERY.NODE_DATA, _hub, 'node'], previous => {
      if (!previous) return [newNode];
      if (!newNode.id) {
        newNode.id = -1;
      }
      const node = previous.find(n => n.id === newNode.id);
      if (node) {
        const update = {...node, ...newNode};
        return previous.map(n => (n.id === node.id ? update : n));
      }
      return [...previous, newNode];
    });
    const previous = queryClient.getQueryData([API_QUERY.NODE_DATA, _hub, 'node']);
    return {previous};
  };

  const mutation = useMutation({
    mutationFn: async ({hub = _hub, type = _type, data}) => BaseService.put(`api/${type}?`, {hub}, data),
    meta: {type: 'node', id: '', method: 'create / update'},
    onMutate: ({data}) => updateNode({...data}),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({queryKey: [API_QUERY.NODE_DATA]});
      if (_type === 'group') {
        queryClient.invalidateQueries({queryKey: [API_QUERY.GET_GROUP_GEO]});
      }
      notification.success({
        description: `${capitaliseString(variables.data.type)} ${variables.data.id ? 'updated' : 'created'} successfully`,
      });
    },
  });

  return {...mutation, updateNode};
};

export const useNodeDeleteMutation = (props = {}) => {
  const {hub: _hub = globalThis.envault.hub} = props;
  const queryClient = useQueryClient();
  const {notification} = App.useApp();

  return useMutation({
    mutationFn: async ({hub = _hub, id}) => BaseService.remove(`api/node?`, {hub, id}),
    meta: {type: 'node', id: '', method: 'delete'},
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: [API_QUERY.NODE_DATA]});
      queryClient.invalidateQueries({queryKey: [API_QUERY.GET_GROUP_GEO]});
    },
    onSuccess: (data, variables) => {
      notification.success({
        description: `Node deleted successfully`,
      });
    },
    onError: (error, variables) => {
      notification.error({
        title: `Node delete failed`,
        description: JSON.stringify(error, null, 2),
      });
    },
  });
};
