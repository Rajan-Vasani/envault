import {Segmented} from 'antd';
import {useEffect, useState} from 'react';
import GalleryView from './GalleryView';

const GalleryViewControl = props => {
  const {timeRange, selectedNodes = [], filterLabel = 'all', activeTimelapse} = props;
  const [timelapse, setTimelapse] = useState(activeTimelapse);

  useEffect(() => {
    setTimelapse(activeTimelapse);
  }, [activeTimelapse]);

  if (!selectedNodes.length) return null;
  
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowY: 'auto',
      }}
    >
      <Segmented
        value={timelapse}
        options={selectedNodes.map(node => ({value: node?.id, label: node?.name}))}
        onChange={setTimelapse}
        style={{fontSize: '12px', marginBottom: '8px'}}
      />
      <GalleryView
        timelapse={timelapse}
        timeRange={timeRange}
        filterLabel={timelapse !== activeTimelapse ? 'all' : filterLabel}
      />
    </div>
  );
};

export default GalleryViewControl;
