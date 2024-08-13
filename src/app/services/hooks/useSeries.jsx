import {useMutation, useQueries, useQuery, useQueryClient} from '@tanstack/react-query';
import {API_QUERY} from 'constant/query';
import {isNil, omitBy} from 'lodash';
import {useCallback} from 'react';
import {BaseService} from 'services/api/base.service';

export const seriesQuery = (props = {}) => {
  const {hub = globalThis.envault.hub, ...options} = props;
  return {
    queryKey: [API_QUERY.GET_SERIES_LIST, hub],
    queryFn: async () => BaseService.get(`api/series?`, {hub}),
    meta: {type: 'series', id: 'all', method: 'read'},
    enabled: !!hub,
    ...options,
  };
};
export const useSeries = props => useQuery(seriesQuery(props));

export const seriesDataQuery = (props = {}) => {
  const {
    hub = globalThis.envault.hub,
    series,
    range: {from, to},
    ...options
  } = props;
  const query = omitBy({hub, series, from, to}, isNil);
  return {
    queryKey: [API_QUERY.SERIES_DATA, series, from, to],
    queryFn: async () => BaseService.get(`api/series-data?`, query),
    meta: {type: 'series data', id: series, method: 'read'},
    keepPreviousData: true,
    enabled: !!series && !!from,
    ...options,
  };
};

export const useSeriesData = props => useQuery(seriesDataQuery(props));

export const useSeriesDataList = props => {
  const {hub = globalThis.envault.hub, series, ...rest} = props;
  return useQueries({
    queries: series ? series.map(({id}) => seriesDataQuery({series: id, hub, ...rest})) : [],
    combine: useCallback(
      results => ({
        isLoading: results.some(query => query.isLoading),
        isSuccess: results.length ? results.every(query => query.isSuccess) : false,
        isSomeSuccess: results.some(query => query.isSuccess),
        isError: results.some(query => query.isError),
        data: series?.reduce((acc, {id}, index) => ({...acc, [id]: results[index].data}), {}),
      }),
      [series],
    ),
  });
};

export const useTokenisedSeriesList = props => {
  const {tokens} = props;
  return useQueries({
    queries: tokens
      ? Object.entries(tokens).map(([series, accessToken]) => ({
          queryKey: [API_QUERY.SERIES_DATA, +series],
          queryFn: async () => BaseService.get(`api/series-data?`, {access_token: accessToken}),
        }))
      : [],
    combine: useCallback(
      results => ({
        isLoading: results.some(query => query.isLoading),
        isSuccess: results.length ? results.every(query => query.isSuccess) : false,
        isSomeSuccess: results.some(query => query.isSuccess),
        isError: results.some(query => query.isError),
        data: Object.entries(tokens).reduce((acc, [series], index) => ({...acc, [series]: results[index].data}), {}),
      }),
      [tokens],
    ),
  });
};

export const useSeriesDataUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => data,
    onSuccess: data => {
      const {seriesId, range, latestData} = data;
      const from = range?.from?.valueOf().toString();
      const to = range?.to?.valueOf().toString();
      queryClient.setQueryData([API_QUERY.GET_SERIES_DETAIL, seriesId, from, to], oldData =>
        oldData
          ? {
              [seriesId]: [...latestData, ...oldData[seriesId]],
            }
          : oldData,
      );
    },
  });
};
