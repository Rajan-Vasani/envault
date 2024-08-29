import {Flex, Skeleton} from 'antd';
import {Echarts} from 'app/pages/chart/components/echarts';
import Icon from 'components/atoms/Icon';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import {useSeriesDataList} from 'hooks/useSeries';
import {useNodeContext} from 'layouts/node/context';
import {merge} from 'lodash';
import {baseOption} from 'pages/chart/config';
import {useMemo} from 'react';
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

const getDataList = params => {
  const data = params.data;
  const option = params.config?.option;
  const global = params.config?.global;
  const series = option?.series ?? [];
  const seriesDataList = {series: [], device: []};
  for (const [index, s] of series.entries()) {
    const xIndex = option.xAxis?.[s.xAxisIndex];
    const to = xIndex?.type === 'time' && xIndex.max ? xIndex.max : global?.timeRange?.to;
    const from = xIndex?.type === 'time' && xIndex.min ? xIndex.min : global?.timeRange?.from;

    seriesDataList[s.node.type][index] = {
      ...s.node,
      ...data[index],
      to,
      from,
    };
    delete seriesDataList[s.node.type][index].type;
  }
  return seriesDataList;
};

export const Component = props => {
  const {nodeAttrs, nodeParams, updateNodeParams} = useNodeContext();
  // load tokenised data from chart definition
  const {series, device} = getDataList(nodeParams);

  const {data, isLoading: isInitialLoading} = useSeriesDataList({series});
  //const {deviceData, isLoading: isDeviceLoading} = useDeviceDataList(device);
  // load series data requested by user, only do this when node.config !== initialConfig

  const option = useMemo(() => {
    if (!nodeParams.config?.option) return undefined;
    const _option = structuredClone(nodeParams.config.option);
    if (Object.keys(_option).length <= 1) {
      merge(_option, baseOption);
      updateNodeParams('config.option', _option);
    }
    _option.series = _option.series.map(s => {
      const name = s.name ?? s.node.name;
      const series = data[s.node.id] ? data[s.node.id].map(d => ({value: [d.datetime, d.value]})) : [];
      return {
        ...s,
        name,
        data: series,
      };
    });
    return _option;
  }, [nodeParams.config, data]);

  const handleZoom = zoomData => {
    updateNodeParams('config.option.dataZoom', zoomData);
  };

  return option ? (
    <Echarts loading={isInitialLoading} option={option} onZoom={handleZoom} />
  ) : (
    <Flex justify={'center'} align={'center'} style={{height: '100%'}}>
      <Skeleton.Node active style={{width: '25vh', height: '25vh'}}>
        <Icon icon={'Realtime'} type={'envault'} alt={'Drag&Drop'} raw />
      </Skeleton.Node>
    </Flex>
  );
};
export default Component;
Component.displayName = 'Chart-Loader';
