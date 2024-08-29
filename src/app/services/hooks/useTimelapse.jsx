import {useMutation, useQueries, useQuery, useQueryClient} from '@tanstack/react-query';
import {BaseService} from 'api/base.service';
import {API_QUERY} from 'app/constant/query';
import {isNil, omitBy} from 'lodash';

export const timelapseImageQuery = (props = {}) => {
  const {
    hub = globalThis.envault.hub,
    id: timelapse,
    device,
    from,
    to,
    page_size,
    page_num,
    sort,
    access_token,
    ...options
  } = props;
  const query = omitBy({hub, timelapse, device, from, to, page_size, page_num, sort, access_token}, isNil);
  const key = Object.values(omitBy({hub, timelapse, device, from, to}, isNil));
  return {
    queryKey: [...API_QUERY.TIMELAPSE_IMAGE, ...key],
    queryFn: async () => BaseService.get(`api/timelapse-image?`, query),
    meta: {type: 'timelapse image', id: timelapse, method: 'read'},
    refetchInterval: 1000 * 60 * 5,
    enabled: !!timelapse,
    ...options,
  };
};
export const useTimelapseImage = props => useQuery(timelapseImageQuery(props));

export const useTimelapseImageList = (props = {}) => {
  const {timelapse, ...rest} = props;
  return useQueries({
    queries: timelapse ? timelapse.map(t => timelapseImageQuery({...t, ...rest})) : [],
    combine: results => ({
      isLoading: results.some(query => query.isLoading),
      isSuccess: results.length ? results.every(query => query.isSuccess) : false,
      isSomeSuccess: results.some(query => query.isSuccess),
      isError: results.some(query => query.isError),
      data: timelapse?.reduce((acc, {id}, index) => ({...acc, [id]: results[index].data}), {}),
    }),
  });
};

export const useTimelapseAddMutation = () => {
  const queryClient = useQueryClient();
  const hub = globalThis.envault.hub;

  return useMutation({
    mutationFn: data => BaseService.put(`api/timelapse?`, {hub}, omitBy(data, isNil)),
    meta: {type: 'timelapse', id: '', method: 'create / update'},
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: API_QUERY.NODE});
    },
  });
};

export const useTimelapseImageUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: data => {
      const {id, from, to, newImage} = data;
      queryClient.setQueryData([...API_QUERY.TIMELAPSE_IMAGE, id, from, to], oldData =>
        oldData ? [newImage, ...oldData] : oldData,
      );
      return data;
    },
  });
};
