import {useDndMonitor} from '@dnd-kit/core';
import {Alert, App, Button, Space} from 'antd';
import {useNodeFilter} from 'app/services/hooks/useNode';
import {EVENTSTATES} from 'hooks/useEventStream';
import {createContext, useEffect, useMemo, useState} from 'react';
import {getLatestTime, getRange} from 'utils/time';

export const GalleryContext = createContext({});

const removeDuplicate = (array, key) => {
  const unique = [...new Map(array.map(item => [item[key], item])).values()];
  return unique;
};

export const GalleryContextProvider = props => {
  const {children, values} = props;
  const {series, previousData} = values;
  const {message} = App.useApp();
  const {data: timelapseData = []} = useNodeFilter({filters: ['timelapse']});
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [timeRange, setTimeRange] = useState({...getRange(1), relative: {days: '-1'}});
  const [filterLabel, setFilterLabel] = useState('all');
  const [activeTimelapse, setActiveTimelapse] = useState();
  const [filterLabelOptions, setFilterLabelOptions] = useState([]);
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

  const findSeries = obj => {
    const results = [];
    const checkChildren = obj => {
      if (obj.type === 'timelapse') {
        results.push(obj);
      }
      if (Array.isArray(obj.children)) {
        for (const child of obj.children) {
          checkChildren(child);
        }
      }
    };
    checkChildren(obj);
    return results;
  };

  const addNode = node => {
    const isExist = selectedNodes.some(treeItem => treeItem.id === node.id);
    if (isExist) {
      return;
    } else {
      setSelectedNodes([...selectedNodes, node]);
    }
  };

  const latestTime = useMemo(() => {
    return getLatestTime(selectedNodes);
  }, [selectedNodes]);

  useEffect(() => {
    let allSelectedNode = [];
    if (series.length && timelapseData.length) {
      const singleSeriesNode = series.map(id => timelapseData.find(node => node.id === id)) ?? [];
      allSelectedNode = [...allSelectedNode, ...singleSeriesNode];
    }
    if (previousData?.id) {
      const {activeTimelapse, filterLabel} = previousData?.config ?? {};
      const {data = {}} = previousData;
      if (data && Object.keys(data).length) {
        const previousSeletedNode = timelapseData.filter(s => Object.keys(data)?.map(Number)?.includes(s.id));
        allSelectedNode = [...allSelectedNode, ...previousSeletedNode];
      }
      setFilterLabel(filterLabel);
      setActiveTimelapse(activeTimelapse);
      setSelectedNodes(
        removeDuplicate(
          allSelectedNode.filter(node => node),
          'id',
        ),
      );
    }
  }, [series, timelapseData, previousData]);

  useEffect(() => {
    if (!selectedNodes?.length) {
      setActiveTimelapse(null);
      setFilterLabelOptions([]);
    } else {
      if (!activeTimelapse) {
        setActiveTimelapse(selectedNodes[0].id);
      }
      if (!selectedNodes.find(item => item.id === activeTimelapse)) {
        setActiveTimelapse(selectedNodes[0].id);
      }
    }
  }, [selectedNodes, activeTimelapse]);

  useEffect(() => {
    if (selectedNodes.length === 0 || !!timeRange?.to) {
      setEventState(EVENTSTATES.DISABLE);
      setIsStream(false);
    } else {
      setEventState(EVENTSTATES.ENABLE);
    }
  }, [selectedNodes, timeRange]);

  const handleDragEnd = (active, over) => {
    const activeNode = active.data.current;
    if (!over) {
      return;
    }
    if (active.id !== over.id) {
      if (over.data.current.accepts.includes(activeNode.type)) {
        if (['group', 'location'].includes(activeNode.type)) {
          const seriesInGroup = findSeries(activeNode);
          if (seriesInGroup.length > 10) {
            message.info(
              <Alert
                message={
                  <div>
                    <p>You&apos;re about to add a lot of data, are you sure you want to proceed?</p>
                    <Space direction="horizontal">
                      <Button size="small" type="primary" onClick={() => confirmAddGroup(seriesInGroup)}>
                        Confirm
                      </Button>
                      <Button size="small" type="link" onClick={() => message.destroy()}>
                        Cancel
                      </Button>
                    </Space>
                  </div>
                }
                type="warning"
                style={{marginTop: '12px'}}
              />,
              0,
            );
          } else {
            setSelectedNodes([...selectedNodes, ...seriesInGroup]);
          }
        } else {
          addNode(activeNode);
        }
      } else {
        alert(`Please select node with type ${String(over.data.current.accepts)}`);
      }
    }
  };

  useDndMonitor({
    onDragEnd({active, over}) {
      handleDragEnd(active, over);
    },
  });

  const removeNode = () => {
    setSelectedNodes(undefined);
  };

  const contextValues = {
    series,
    previousData,
    timeRange,
    setTimeRange,
    latestTime,
    selectedNodes,
    setSelectedNodes,
    addNode,
    removeNode,
    filterLabel,
    setFilterLabel,
    filterLabelOptions,
    setFilterLabelOptions,
    activeTimelapse,
    setActiveTimelapse,
    isEdit,
    setIsEdit,
    isStream,
    setIsStream,
    streamState,
    setStreamState,
    eventState,
    handleStreamStateChange,
  };

  return <GalleryContext.Provider value={contextValues}>{children}</GalleryContext.Provider>;
};

export default GalleryContext;
