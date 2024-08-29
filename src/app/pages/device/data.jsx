import {Empty, Flex} from 'antd';
import dayjs from 'dayjs';
import {useDeviceData} from 'hooks/useDevice';
import {useNodeContext} from 'layouts/node/context';
import Sparkline from 'pages/dashboard/widget/Sparkline';
import {useMemo} from 'react';

export const Component = props => {
  const {nodeAttrs} = useNodeContext();
  const {data} = useDeviceData({device: nodeAttrs.id, from: dayjs().subtract(24, 'h').toISOString()});

  const sensors = useMemo(() => {
    const sensorMap = new Map();
    data?.forEach(record => {
      const {sensor, datetime} = record;
      if (!sensorMap.has(sensor) || new Date(sensorMap.get(sensor).datetime) < new Date(datetime)) {
        sensorMap.set(sensor, record);
      }
    });
    return Array.from(sensorMap.values());
  }, [data]);

  return (
    <Flex gap={'middle'} wrap justify={'center'} style={{padding: '10px'}}>
      {sensors?.length ? (
        sensors?.map(({sensor, value, unit, datetime}) => {
          const chartData = data?.filter(d => d.sensor === sensor).map(d => ({value: [d.datetime, d.value]}));
          return <Sparkline key={sensor} data={chartData} meta={{title: sensor, value, unit, datetime}} />;
        })
      ) : (
        <Empty />
      )}
    </Flex>
  );
};
Component.displayName = 'Device-Data';
