import {useQuery} from '@tanstack/react-query';
import {API_QUERY} from 'constant/query';
import {isNil, omitBy} from 'lodash';
import {BaseService} from 'services/api/base.service';

export const deviceDataQuery = (props = {}) => {
  const {
    hub = globalThis.envault.hub,
    device,
    sensor,
    created_at,
    from,
    to,
    page_size,
    page_num,
    sort,
    ...options
  } = props;
  const query = omitBy({hub, device, sensor, created_at, from, to, page_size, page_num, sort}, isNil);
  const key = Object.values(omitBy({hub, device, sensor}, isNil));
  return {
    queryKey: [...API_QUERY.DEVICE_DATA, ...key],
    queryFn: async () => BaseService.get(`api/device-data?`, query),
    meta: {type: 'series', id: 'all', method: 'read'},
    refetchInterval: 1000 * 60 * 5,
    enabled: !!hub,
    ...options,
  };
};
export const useDeviceData = props => useQuery(deviceDataQuery(props));

export const deviceImageQuery = (props = {}) => {
  const {hub = globalThis.envault.hub, device, from, to, page_size, page_num, sort, ...options} = props;
  const query = omitBy({hub, device, from, to, page_size, page_num, sort}, isNil);
  const key = Object.values(omitBy({hub, device}, isNil));
  return {
    queryKey: [...API_QUERY.DEVICE_IMAGE, ...key],
    queryFn: async () => BaseService.get(`api/device-image?`, query),
    meta: {type: 'series', id: 'all', method: 'read'},
    refetchInterval: 1000 * 60 * 5,
    enabled: !!hub,
    ...options,
  };
};

export const useDeviceImage = props => useQuery(deviceImageQuery(props));

export const deviceStateQuery = (props = {}) => {
  const {hub = globalThis.envault.hub, device, ...options} = props;

  return {
    queryKey: [...API_QUERY.DEVICE_STATE, hub, device],
    queryFn: async () => BaseService.get(`api/device-state?`, {hub, device}),
    meta: {type: 'series', id: 'all', method: 'read'},
    enabled: !!(hub && device),
    ...options,
  };
};

export const useDeviceState = props => useQuery(deviceStateQuery(props));
