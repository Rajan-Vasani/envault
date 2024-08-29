import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {BaseService} from 'api/base.service';
import {API_QUERY} from 'constant/query';
import {isNil, omitBy} from 'lodash';

export const groupQuery = (props = {}) => {
  const {hub, ...options} = props;
  return {
    queryKey: [...API_QUERY.GROUP, hub],
    queryFn: async () => BaseService.get(`api/group?`, {hub}),
    meta: {type: 'group', id: 'all', method: 'read'},
    enabled: !!hub,
    ...options,
  };
};
export const useGroup = (props = {}) => {
  const {hub = globalThis.envault.hub, ...rest} = props;
  return useQuery(groupQuery({hub, ...rest}));
};

export const useGroupAddMutation = (props = {}) => {
  const queryClient = useQueryClient();
  const {hub: _hub = globalThis.envault.hub} = props;

  return useMutation({
    mutationFn: async ({hub = _hub, ...data}) => BaseService.put(`api/group?`, {hub}, omitBy(data, isNil)),
    meta: {type: 'group', id: 'all', method: 'create / update'},
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: API_QUERY.GROUP});
    },
  });
};

export const groupGeoQuery = (props = {}) => {
  const {hub, ...options} = props;
  return {
    queryKey: [...API_QUERY.GROUP_GEO, hub],
    queryFn: async () => BaseService.get(`api/group?`, {hub}, {Accept: 'application/geo+json'}),
    meta: {type: 'group', id: 'all', method: 'read'},
    enabled: !!hub,
    ...options,
  };
};

export const useGroupGeo = (props = {}) => {
  const {hub = globalThis.envault.hub, ...rest} = props;
  return useQuery(groupGeoQuery({hub, ...rest}));
};
