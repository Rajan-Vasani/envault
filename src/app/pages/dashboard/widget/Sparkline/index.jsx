import {generate} from '@ant-design/colors';
import {Card, Flex, Typography} from 'antd';
import {useLayoutEffect, useRef} from 'react';
const {Text, Title} = Typography;

import {useTheme} from 'antd-style';
import {graphic, init} from 'echarts';
import {LineChart} from 'echarts/charts';
import {use as echartUse} from 'echarts/core';
import {UniversalTransition} from 'echarts/features';
import {SVGRenderer} from 'echarts/renderers';
echartUse([LineChart, UniversalTransition, SVGRenderer]);

export const Sparkline = ({data, meta}) => {
  const chartRef = useRef(null);
  const theme = useTheme();
  const colors = generate(theme.colorPrimary, {
    theme: theme.appearance,
    backgroundColor: theme.colorBgBase,
  });
  useLayoutEffect(() => {
    const chart = init(chartRef.current, null, {renderer: 'svg'});
    const option = {
      xAxis: {type: 'time', show: false},
      yAxis: {type: 'value', show: false},
      grid: {
        x: 0,
        y: 0,
        x2: 0,
        y2: 0,
      },
      series: [
        {
          type: 'line',
          data: data,
          smooth: true,
          sampling: 'lttb',
          showSymbol: false,
          lineStyle: {width: 1, color: colors[5]},
          areaStyle: {
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              {offset: 0, color: colors[5]},
              {offset: 1, color: theme.colorBgBase},
            ]),
          },
        },
      ],
    };
    chart.setOption(option);

    return () => {
      chart.dispose();
    };
  }, [data, colors, theme]);

  return (
    <Card style={{width: 300}}>
      <Flex vertical gap={'small'}>
        <Flex vertical>
          <Text type={'secondary'}>{meta.title}</Text>
          <Title style={{margin: 0}}>{`${meta.value.toFixed(3)} ${meta.unit || ''}`}</Title>
        </Flex>
        <div ref={chartRef} style={{height: '60px', width: '100%', display: 'inline-block'}} />
      </Flex>
    </Card>
  );
};
export default Sparkline;
