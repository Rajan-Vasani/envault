import {EVENTSTATES} from 'hooks/useEventStream';
import {useNodeFilter} from 'hooks/useNode';
import {initUserConfig} from 'pages/chart/config';
import {createContext, useEffect, useMemo, useState} from 'react';
import {getLatestTime} from 'utils/time';

const initChartContextValue = {
  previousData: {},
  selectedNodes: [],
};
export const ChartContext = createContext(initChartContextValue);

const removeDuplicate = (array, key) => {
  const unique = [...new Map(array.map(item => [item[key], item])).values()];
  return unique;
};

export const ChartContextProvider = props => {
  const {
    children,
    values: {previousData, series},
  } = props;
  const {data: seriesData = []} = useNodeFilter({filters: ['series']});
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [timeRange, setTimeRange] = useState();
  const [userConfig, setUserConfig] = useState(initUserConfig);
  const [isEdit, setIsEdit] = useState(!previousData?.id);
  const [isStream, setIsStream] = useState(false);
  const [streamState, setStreamState] = useState();
  const [eventState, setEventState] = useState(EVENTSTATES.DISABLE);

  const handleStreamStateChange = tag => {
    if (selectedNodes.length === 0 || !!timeRange.to) return;
    if (tag.state !== 'enable') {
      setEventState(EVENTSTATES.ENABLE);
      setIsStream(false);
    }
    if (tag.state === 'enable') {
      setEventState(EVENTSTATES.CONNECTING);
      setIsStream(true);
    }
  };

  useEffect(() => {
    let allSelectedNode = [];
    if (series.length && seriesData.length) {
      const singleSeriesNode = series.map(id => seriesData.find(node => node.id === id)) ?? [];
      allSelectedNode = [...allSelectedNode, ...singleSeriesNode];
    }
    if (previousData?.id) {
      const previousSeletedNode = seriesData.filter(s =>
        Object.keys(previousData?.data || [])
          .map(Number)
          ?.includes(s.id),
      );
      allSelectedNode = [...allSelectedNode, ...previousSeletedNode];
      setUserConfig(previousData.config?.userConfig ?? initUserConfig);
      setSelectedNodes(
        removeDuplicate(
          allSelectedNode.filter(node => node),
          'id',
        ),
      );
    }
  }, [previousData, seriesData, series]);

  useEffect(() => {
    if (selectedNodes.length === 0 || !!timeRange?.to) {
      setEventState(EVENTSTATES.DISABLE);
      setIsStream(false);
    } else {
      setEventState(EVENTSTATES.ENABLE);
    }
  }, [selectedNodes, timeRange]);

  const seriesLatestTime = useMemo(() => {
    return getLatestTime(selectedNodes);
  }, [selectedNodes]);

  const contextValues = {
    previousData,
    timeRange,
    setTimeRange,
    seriesLatestTime,
    userConfig,
    setUserConfig,
    selectedNodes,
    setSelectedNodes,
    isEdit,
    setIsEdit,
    isStream,
    setIsStream,
    streamState,
    setStreamState,
    eventState,
    setEventState,
    handleStreamStateChange,
  };

  return <ChartContext.Provider value={contextValues}>{children}</ChartContext.Provider>;
};

export default ChartContext;
