import {Empty, Flex} from 'antd';
import dayjs from 'dayjs';
import {useDeviceImage} from 'hooks/useDevice';
import {useNodeContext} from 'layouts/node/context';
import {useMemo} from 'react';

export const Component = props => {
  const {nodeAttrs} = useNodeContext();
  const {data} = useDeviceImage({device: nodeAttrs.id, from: dayjs().subtract(24, 'h').toISOString()});

  const targets = useMemo(() => {
    const targetMap = new Map();
    data?.forEach(record => {
      const {target, datetime} = record;
      if (!targetMap.has(target) || new Date(targetMap.get(target).datetime) < new Date(datetime)) {
        targetMap.set(target, record);
      }
    });
    return Array.from(targetMap.values());
  }, [data]);

  return (
    <Flex gap={'middle'} wrap justify={'center'} style={{padding: '10px'}}>
      {targets?.length ? (
        targets?.map(({target, url, datetime}) => {
          const chartData = data?.filter(d => d.target === target).map(d => ({value: [d.datetime, d.value]}));
          return <img key={target} src={url} />;
        })
      ) : (
        <Empty />
      )}
    </Flex>
  );
};
Component.displayName = 'Device-Image';
