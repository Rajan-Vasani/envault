import {Echarts} from 'app/pages/chart/components/echarts';
import {EVENTSTATES, useEventListStream} from 'hooks/useEventStream';
import {getChartConfig} from 'pages/chart/helper';
import {useEffect, useMemo, useState} from 'react';
import {useSeriesDataList, useSeriesDataUpdate} from 'services/hooks/useSeries';

const initUserConfig = {};

function EchartControl(props) {
  const {
    nodeData: dataList = [],
    timeRange,
    userConfig = initUserConfig,
    isStream = false,
    setEventState = () => {},
  } = props;
  const seriesDataArray = useSeriesDataList({series: dataList, range: timeRange});
  const {mutate: updateSeries} = useSeriesDataUpdate();
  const [localConfig, setLocalConfig] = useState(userConfig);

  const allFinished = seriesDataArray.every(query => query.isSuccess);
  const allLoading = seriesDataArray.some(query => query.isPending);

  const streamUrlArray = useMemo(() => {
    if (dataList?.length) {
      return dataList.map(node => ({
        url: new URL(
          `api/series-stream?` + new URLSearchParams({series: node.id, hub: globalThis.envault.hub}),
          globalThis.envault.origin,
        ).toString(),
        id: node.id,
      }));
    }
    return null;
  }, [dataList, globalThis.envault.hub]);

  const {data, readyState} = useEventListStream(streamUrlArray, isStream);

  const config = useMemo(() => {
    if (allFinished && timeRange) {
      const seriesDataById = seriesDataArray.map(s => s.data).reduce((a, v) => ({...a, ...v}), {});
      const finalData = dataList.map(s => ({...s, data: seriesDataById[s.id]}));
      return getChartConfig(finalData, localConfig);
    } else {
      return getChartConfig([], localConfig);
    }
  }, [allFinished, timeRange, seriesDataArray, dataList, localConfig]);

  const handleZoom = zoomData => {
    setLocalConfig({
      ...localConfig,
      dataZoom: {
        start: zoomData.start,
        end: zoomData.end,
      },
    });
  };

  useEffect(() => {
    setLocalConfig({...localConfig, ...userConfig});
  }, [userConfig]);

  useEffect(() => {
    if (data && Object.keys(data).length) {
      Object.keys(data).forEach(id => updateSeries({seriesId: id, range: timeRange, latestData: data[id]}));
    }
  }, [data, timeRange, updateSeries]);

  useEffect(() => {
    if (dataList.length === 0 || !!timeRange.to) return;
    const allClosed = Object.values(readyState).every(v => v === 2);
    const onceOpen = Object.values(readyState).includes(1);
    if (allClosed) {
      setEventState(EVENTSTATES.ENABLE);
    }
    if (onceOpen) {
      setEventState(EVENTSTATES.OPEN);
    }
  }, [readyState, timeRange, dataList]);

  return <Echarts option={config} loading={allLoading} onZoom={handleZoom} />;
}

export default EchartControl;
