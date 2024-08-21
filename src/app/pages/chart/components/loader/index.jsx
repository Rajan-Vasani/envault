import {Flex, Skeleton} from 'antd';
import {Echarts} from 'app/pages/chart/components/echarts/init';
import Icon from 'components/atoms/Icon';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import {useSeriesDataList, useTokenisedSeriesList} from 'hooks/useSeries';
import {useNodeContext} from 'layouts/node/context';
import {differenceBy, isArray, isEmpty, isEqual, mergeWith, unionBy} from 'lodash';
import {useMemo} from 'react';
import {parseTimeFrom} from 'utils/time';
dayjs.extend(isBetween);

// Streaming setup
// import {useSeriesDataUpdate} from 'hooks/useSeries';
// const {mutate: updateSeries} = useSeriesDataUpdate();
// const streamUrlArray = useMemo(() => {
//   if (subNodes?.length) {
//     return subNodes.map(node => ({
//       url: new URL(`api/series-stream?` + new URLSearchParams({series: node.id, hub: hub.id}), globalThis.envault.origin).toString(),
//       id: node.id,
//     }));
//   }
//   return null;
// }, [subNodes, hub.id]);
// const {data, readyState} = useEventListStream(streamUrlArray, isStream);
// useEffect(() => {
//   if (data && Object.keys(data).length) {
//     Object.keys(data).forEach(id => updateSeries({seriesId: id, range: timeRange, latestData: data[id]}));
//   }
// }, [data, timeRange, updateSeries]);
// useEffect(() => {
//   if (subNodes.length === 0 || !!timeRange?.to) return;
//   const allClosed = Object.values(readyState).every(v => v === 2);
//   const onceOpen = Object.values(readyState).includes(1);
//   if (allClosed) {
//     setStreamState(EVENTSTATES.ENABLE);
//   }
//   if (onceOpen) {
//     setStreamState(EVENTSTATES.OPEN);
//   }
// }, [readyState, timeRange, subNodes]);
const newDataSelector = (oldConfig, newConfig) => {
  if (isEmpty(oldConfig) || isEmpty(newConfig)) {
    return [];
  }
  const newRange = newConfig?.global?.timeRange;
  const oldRange = oldConfig?.global?.timeRange;
  const newSeries = newConfig?.option?.series || [];
  const oldSeries = oldConfig?.option?.series || [];
  const deltaSeries = differenceBy(newSeries, oldSeries, 'id');
  const allSeries = unionBy(newSeries, oldSeries, 'id');
  const rangeMatch = isEqual(newRange, oldRange);

  if (!rangeMatch) {
    return allSeries;
  }
  if (deltaSeries.length) {
    return deltaSeries;
  }
  return [];
};

const ChartLoader = props => {
  const {nodeAttrs, nodeParams, mergeNodeParams} = useNodeContext();
  // load tokenised data from chart definition
  const {data: initialData, isLoading: isInitialLoading} = useTokenisedSeriesList({tokens: nodeParams?.data});
  // load series data requested by user, only do this when node.config !== initialConfig
  const seriesList = nodeParams.config?.option?.series?.map(({id}) => id in nodeParams.data) ?? [];
  const {data: newData, isLoading: isNewLoading} = useSeriesDataList({
    series: seriesList,
    range: {
      ...nodeParams.config?.global?.timeRange,
      from: parseTimeFrom(nodeParams.config?.global?.timeRange)?.valueOf(),
    },
    enabled: !!seriesList.length,
  });

  const data = useMemo(
    () =>
      mergeWith(initialData, newData, (objValue, srcValue) => {
        if (isArray(objValue)) {
          return unionBy(objValue, srcValue, 'datetime');
        }
      }),
    [initialData, newData],
  );

  const option = useMemo(() => {
    if (!nodeParams.config?.option) return undefined;
    const _option = structuredClone(nodeParams.config.option);
    _option.series = _option.series.map(s => {
      const timeRange = s.timeRange || nodeParams.config.global.timeRange;
      const from = parseTimeFrom(timeRange);
      const to = timeRange?.to ? dayjs(timeRange.to) : dayjs();
      const name = s.name || data[s.id]?.[0]?.name || s.id;
      const series = data[s.id]
        ? data[s.id]
            .map(d => ({value: [d.datetime, d.value]}))
            .filter(d => dayjs(d.value[0]).isBetween(from, to, null, '[]'))
        : [];
      return {
        ...s,
        name,
        data: series,
      };
    });
    return _option;
  }, [nodeParams.config, data]);

  const handleZoom = zoomData => {
    mergeNodeParams?.({config: {option: {dataZoom: {start: zoomData.start, end: zoomData.end}}}});
  };

  return option ? (
    <Echarts loading={isInitialLoading || isNewLoading} option={option} onZoom={handleZoom} />
  ) : (
    <Flex justify={'center'} align={'center'} style={{height: '100%'}}>
      <Skeleton.Node active style={{width: '25vh', height: '25vh'}}>
        <Icon icon={'Realtime'} type={'envault'} alt={'Drag&Drop'} raw />
      </Skeleton.Node>
    </Flex>
  );
};
export default ChartLoader;
