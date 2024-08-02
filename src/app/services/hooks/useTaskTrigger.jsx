import {useMutation, useQuery} from '@tanstack/react-query';
import {BaseService} from 'api/base.service';
import {API_QUERY} from 'constant/query';
import {isNil, omitBy} from 'lodash';

export const taskTriggerQuery = (props = {}) => {
  const {hub, ...options} = props;
  return {
    queryKey: [API_QUERY.GET_TASK_TRIGGER, hub],
    queryFn: async () => BaseService.get(`api/task-trigger?`, {hub}),
    meta: {type: 'Task trigger', id: 'all', method: 'read'},
    retry: false,
    ...options,
  };
};
export const taskTriggerQueryById = (props = {}) => {
  const {hub, task, ...options} = props;
  return {
    queryKey: [API_QUERY.GET_TASK_TRIGGER, hub, task],
    queryFn: async () => BaseService.get(`api/task-trigger?`, {hub, task}),
    meta: {type: 'Task trigger by id', id: 'all', method: 'read'},
    retry: false,
    enabled: !!task,
    ...options,
  };
};
export const taskTriggerPayload = (props = {}) => {
  const {hub, data} = props;
  const query = omitBy({hub}, isNil);
  return BaseService.put(`api/task-trigger?`, query, data);
};

export const useTaskTrigger = props => useQuery(taskTriggerQuery(props));

export const useTaskTriggerById = props => useQuery(taskTriggerQueryById(props));

export const useTaskTriggerPutMutation = () => {
  return useMutation({
    mutationFn: async ({hub, data}) => taskTriggerPayload({hub, data}),
    meta: {type: 'add task trigger', id: '', method: 'create'},
  });
};

export const useTaskTriggerDeleteMutation = () => {
  const _hub = globalThis.envault.hub;

  return useMutation({
    mutationFn: async ({hub = _hub, trigger}) => BaseService.remove(`api/task-trigger?`, {hub, id: trigger}),
    meta: {type: 'task trigger', id: '', method: 'delete'},
  });
};
