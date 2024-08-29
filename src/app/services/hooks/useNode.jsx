import {useMutation, useQueries, useQuery, useQueryClient} from '@tanstack/react-query';
import {App} from 'antd';
import {BaseService} from 'api/base.service';
import {API_QUERY} from 'constant/query';
import {isNil, isUndefined, omitBy} from 'lodash';
import {useCallback, useMemo} from 'react';
import {useRole} from 'services/hooks/useRole';
import {capitaliseString} from 'utils/string';
import {arrayToTree, findDescendants, nodeTypeFilter} from 'utils/tree';

export const nodeQuery = (props = {}) => {
  const {hub = globalThis.envault.hub, type = 'node', id, ...options} = props;
  const key = Object.values(omitBy({hub, type, id}, isNil));
  const query = omitBy({hub, id}, isNil);
  return {
    queryKey: [...API_QUERY.NODE, ...key],
    queryFn: async () => BaseService.get(`api/${type}?`, query),
    meta: {type: 'node', id: 'all', method: 'read'},
    refetchInterval: 1000 * 60 * 5,
    enabled: !!hub,
    ...options,
  };
};
export const useNode = (props = {}) => useQuery(nodeQuery(props));

export const actorNodeACLQuery = (props = {}) => {
  const {hub = globalThis.envault.hub, actor, ...options} = props;
  return {
    queryKey: [...API_QUERY.NODE_ACL, hub, actor],
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
    combine: useCallback(
      results => ({
        isLoading: results.some(query => query.isLoading),
        isSuccess: results.length ? results.every(query => query.isSuccess) : false,
        isSomeSuccess: results.some(query => query.isSuccess),
        isError: results.some(query => query.isError),
        data: actors?.reduce((acc, {id}, index) => ({...acc, [id]: results[index].data}), {}),
      }),
      [actors],
    ),
  });
};

export const useRoleACLList = (props = {}) => {
  const {hub = globalThis.envault.hub} = props;
  const roleQuery = useRole({hub});
  const roleData = roleQuery.data || [];
  const roleACLQuery = useActorNodeACLList({hub, actors: roleData});
  const results = [roleQuery, roleACLQuery];
  const isLoading = results.some(query => query.isLoading);
  const isSomeSuccess = results.some(query => query.isSuccess);
  const isSuccess = results.every(query => query.isSuccess);
  const isError = results.some(query => query.isError);
  const [roles, roleACLs] = results.map(query => query.data);
  const result = useMemo(() => {
    const data = isSomeSuccess ? roles?.map(role => ({...role, acl: roleACLs[role.id] ?? []})) : [];
    return {
      isLoading,
      isSuccess,
      isSomeSuccess,
      isError,
      data,
    };
  }, [isSuccess, isLoading, isSomeSuccess, isError, roles, roleACLs]);
  return result;
};

export const useNodeACLPutMutation = () => {
  const queryClient = useQueryClient();
  const _hub = globalThis.envault.hub;

  return useMutation({
    mutationFn: async ({hub = _hub, ...data}) => BaseService.put(`api/node-acl?`, {hub}, omitBy(data, isUndefined)),
    meta: {type: 'access control', id: '', method: 'update / create'},
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({queryKey: [...API_QUERY.NODE_ACL, variables.hub ?? _hub, variables.actor]});
    },
  });
};

export const useNodeACLDeleteMutation = () => {
  const queryClient = useQueryClient();
  const _hub = globalThis.envault.hub;

  return useMutation({
    mutationFn: async ({hub = _hub, ...query}) => BaseService.remove(`api/node-acl?`, {hub, ...query}),
    meta: {type: 'access control', id: '', method: 'remove'},
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({queryKey: [...API_QUERY.NODE_ACL, variables.hub ?? _hub, variables.actor]});
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
  const {hub: _hub = globalThis.envault.hub, type: _type = 'node'} = props;
  const queryClient = useQueryClient();
  const {notification} = App.useApp();

  const updateNode = async newNode => {
    await queryClient.cancelQueries([...API_QUERY.NODE, _hub, 'node']);
    queryClient.setQueryData([...API_QUERY.NODE, _hub, 'node'], previous => {
      if (!previous) return [newNode];
      if (!newNode.id) {
        newNode.id = -1;
      }
      if (newNode.remove) {
        return previous.filter(({id}) => id !== newNode.id);
      }
      const node = previous.find(n => n.id === newNode.id);
      if (node) {
        const update = {...node, ...newNode};
        return previous.map(n => (n.id === node.id ? update : n));
      }
      return [...previous, newNode];
    });
    const previous = queryClient.getQueryData([...API_QUERY.NODE, _hub, 'node']);
    return {previous};
  };

  const mutation = useMutation({
    mutationFn: async ({hub = _hub, type = _type, data}) => BaseService.put(`api/${type}?`, {hub}, data),
    meta: {type: 'node', id: '', method: 'create / update'},
    onMutate: ({data}) => updateNode({...data}),
    onSuccess: (data, variables) => {
      notification.success({
        description: `${capitaliseString(variables.type ?? 'node')} ${variables.data.id ? 'updated' : 'created'} successfully`,
      });
      queryClient.invalidateQueries({queryKey: API_QUERY.NODE});
      if (_type === 'group') {
        queryClient.invalidateQueries({queryKey: API_QUERY.GROUP_GEO});
      }
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
      queryClient.invalidateQueries({queryKey: API_QUERY.NODE});
      queryClient.invalidateQueries({queryKey: API_QUERY.GROUP_GEO});
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
