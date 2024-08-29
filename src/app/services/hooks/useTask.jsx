import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {API_QUERY} from 'app/constant/query';
import {isNil, omitBy} from 'lodash';
import {BaseService} from 'services/api/base.service';

export const taskQuery = (props = {}) => {
  const {hub, id, ...options} = props;
  const query = omitBy({hub, id}, isNil);
  return {
    queryKey: [...API_QUERY.TASK, hub, id],
    queryFn: async () => BaseService.get(`api/task?`, query),
    meta: {type: 'task', id, method: 'read'},
    enabled: !!id,
    ...options,
  };
};

export const useTask = (props = {}) => {
  const {hub = globalThis.envault.hub, ...rest} = props;
  return useQuery(taskQuery({hub, ...rest}));
};

export const allTaskQuery = (props = {}) => {
  const {hub, ...options} = props;
  return {
    queryKey: [...API_QUERY.TASK, hub],
    queryFn: async () => BaseService.get(`api/task?`, {hub}),
    meta: {type: 'task', id: 'all', method: 'read'},
    ...options,
  };
};

export const useAllTask = (props = {}) => {
  const {hub = globalThis.envault.hub, ...rest} = props;
  return useQuery(allTaskQuery({hub, ...rest}));
};

export const taskExecutionQuery = (props = {}) => {
  const {hub, task, from, to, pageSize, pageNum, ...options} = props;
  const query = omitBy({hub, task, from, to, pageSize, pageNum}, isNil);
  return {
    queryKey: [...API_QUERY.TASK_EXECUTE, hub, task],
    queryFn: async () => BaseService.get(`api/execution?`, query),
    meta: {type: 'task execution', id: task, method: 'read'},
    enabled: !!task,
    ...options,
  };
};

export const useTaskExecution = (props = {}) => {
  const {hub = globalThis.envault.hub, ...rest} = props;
  return useQuery(taskExecutionQuery({hub, ...rest}));
};

export const useTaskDeleteMutation = () => {
  const queryClient = useQueryClient();
  const _hub = globalThis.envault.hub;

  return useMutation({
    mutationFn: ({hub = _hub, id}) => BaseService.remove(`api/task?`, {hub, id}),
    meta: {type: 'task', id: '', method: 'delete'},
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: API_QUERY.TASK});
    },
  });
};

export const taskExecutionPayload = (props = {}) => {
  const {hub, task, payload} = props;
  const query = omitBy({hub, task}, isNil);
  return BaseService.post(`api/execution?`, query, payload);
};

export const useTaskExecutionPayload = (props = {}) => {
  const {hub = globalThis.envault.hub} = props;
  return useMutation({
    mutationFn: async ({task, payload}) => taskExecutionPayload({hub, task, payload}),
    meta: {type: 'task execution', id: '', method: 'create'},
  });
};
