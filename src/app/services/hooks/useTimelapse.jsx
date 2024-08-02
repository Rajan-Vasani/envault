import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {BaseService} from 'api/base.service';
import {API_QUERY} from 'app/constant/query';
import {isNil, omitBy} from 'lodash';

export const timelapseImageQuery = (props = {}) => {
  const {hub, timelapse, from, to, ...options} = props;
  const query = omitBy({hub, timelapse, from, to}, isNil);
  return {
    queryKey: [API_QUERY.GET_TIMELAPSE_TOKEN, timelapse, from, to],
    queryFn: async () => BaseService.get(`api/timelapse-image?`, query),
    meta: {type: 'timelapse image', id: timelapse, method: 'read'},
    enabled: !!timelapse && !!from && !!to,
    ...options,
  };
};

export const useTimelapseImage = (props = {}) => {
  const {hub = globalThis.envault.hub, ...rest} = props;
  return useQuery(timelapseImageQuery({hub, ...rest}));
};

export const useTimelapseAddMutation = () => {
  const queryClient = useQueryClient();
  const hub = globalThis.envault.hub;

  return useMutation({
    mutationFn: data => BaseService.put(`api/timelapse?`, {hub}, omitBy(data, isNil)),
    meta: {type: 'timelapse', id: '', method: 'create / update'},
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: [API_QUERY.NODE_DATA]});
    },
  });
};

export const useTimelapseDataUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: data => {
      const {id, from, to, newImage} = data;
      queryClient.setQueryData([API_QUERY.GET_TIMELAPSE_TOKEN, id, from, to], oldData =>
        oldData ? [newImage, ...oldData] : oldData,
      );
      return data;
    },
  });
};

export const timelapseLatestImageQuery = (props = {}) => {
  const {hub, timelapse, to, page_size = 1, ...options} = props;
  const query = omitBy({hub, to, page_size, timelapse}, isNil);
  return {
    queryKey: [API_QUERY.GET_TIMELAPSE_LATEST_TOKEN, query],
    queryFn: async () => BaseService.get(`api/timelapse-image?`, query),
    enabled: !!timelapse,
    ...options,
  };
};

export const useTimelapseLatestImage = (props = {}) => {
  const {hub = globalThis.envault.hub, ...rest} = props;
  return useQuery(timelapseLatestImageQuery({hub, ...rest}));
};
