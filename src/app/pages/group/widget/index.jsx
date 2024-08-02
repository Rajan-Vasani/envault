import {Flex} from 'antd';
import {StreamIndicator} from 'components/atoms/StreamIndicator';
import TimeRange from 'components/molecules/TimeRange';
import {EVENTSTATES} from 'hooks/useEventStream';
import {useNode} from 'hooks/useNode';
import EchartControl from 'pages/chart/widget/loader';
import {useEffect, useMemo, useState} from 'react';
import {useOutletContext} from 'react-router-dom';
import {getRange} from 'utils/time';

const GroupControl = props => {
  const {nodeData} = props;
  const {hub} = useOutletContext();
  const {data: tree = []} = useNode();

  const data = useMemo(() => {
    return tree.filter(node => node.type === 'series' && node.parent == nodeData.id);
  }, [tree, nodeData.id]);

  const [timeRange, setTimeRange] = useState({...getRange(1), relative: {days: '-1'}});
  const [eventState, setEventState] = useState(EVENTSTATES.DISABLE);
  const [isStream, setIsStream] = useState(false);

  const handleChange = tag => {
    if (data.length === 0 || !!timeRange.to) return;
    if (tag.state !== 'enable') {
      setEventState(EVENTSTATES.ENABLE);
      setIsStream(false);
    }
    if (tag.state === 'enable') {
      setEventState(EVENTSTATES.CONNECTING);
      setIsStream(true);
    }
  };
  const handleTimeRangeChange = range => {
    if (JSON.stringify(range) === JSON.stringify(timeRange)) return;
    setTimeRange(range);
  };

  useEffect(() => {
    if (data.length === 0 || !!timeRange.to) {
      setEventState(EVENTSTATES.DISABLE);
      setIsStream(false);
    } else {
      setEventState(EVENTSTATES.ENABLE);
    }
  }, [data, timeRange]);

  const initTimeRange = useMemo(() => {
    return {...getRange(1), relative: {days: '-1'}};
  }, []);

  return (
    <Flex style={{height: '100%'}} gap="small" vertical>
      <Flex wrap="wrap" justify="flex-end" gap="small">
        <StreamIndicator eventState={eventState} onChange={handleChange} />
        <TimeRange value={initTimeRange} onChange={handleTimeRangeChange} />
      </Flex>
      {nodeData && data && (
        <EchartControl
          hub={hub}
          isStream={isStream}
          setEventState={setEventState}
          nodeData={data}
          timeRange={timeRange}
        />
      )}
    </Flex>
  );
};

export default GroupControl;
