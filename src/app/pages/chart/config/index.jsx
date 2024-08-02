import {Flex, Typography} from 'antd';
import Icon from 'app/components/atoms/Icon';
import dayjs from 'dayjs';
const {Text} = Typography;

export const baseOption = {
  animation: true,
  textStyle: {
    fontFamily: '"Century Gothic", "Helvetica Neue"',
  },
  toolbox: {
    show: true,
    feature: {
      saveAsImage: {
        show: true,
      },
      restore: {
        show: false,
      },
      dataView: {
        show: false,
      },
    },
  },
  dataZoom: [
    {
      type: 'inside',
      disabled: true,
    },
  ],
  legend: {},
  grid: [],
  xAxis: [],
  yAxis: [],
  series: [],
  tooltip: {},
};

export const baseGlobal = {
  timeRange: {
    from: dayjs().subtract(24, 'h').valueOf(),
    to: null,
  },
  type: 'line',
  stream: false,
};

export const baseTimeSeries = {
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
    },
  },
  toolbox: {
    feature: {
      saveAsImage: {
        show: true,
      },
      restore: {
        show: false,
      },
      dataView: {
        show: false,
      },
    },
  },
  xAxis: [{type: 'time'}],
  yAxis: [{type: 'value'}],
  dataZoom: [
    {
      type: 'slider',
      show: true,
      realtime: true,
      start: 0,
      end: 100,
    },
    {
      type: 'inside',
      disabled: false,
      zoomOnMouseWheel: true,
      moveOnMouseMove: true,
      moveOnMouseWheel: false,
    },
  ],
  legend: {
    show: true,
    type: 'plain',
    orient: 'horizontal',
  },
};

export const initSeries = {
  line: {
    type: 'line',
    sampling: 'lttb',
    coordinateSystem: 'cartesian2d',
  },
  bar: {
    type: 'bar',
    sampling: 'lttb',
    coordinateSystem: 'cartesian2d',
  },
  scatter: {
    type: 'scatter',
    coordinateSystem: 'cartesian2d',
  },
  gauge: {
    type: 'gauge',
  },
  radar: {
    type: 'radar',
  },
};

export const initBuilderOption = {
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
    },
  },
  toolbox: {
    feature: {
      saveAsImage: {show: true},
    },
  },
  xAxis: [{type: 'time'}],
  yAxis: [{type: 'value'}],
  series: [],
  dataZoom: {
    show: true,
    realtime: true,
    start: 0,
    end: 100,
    zoomOnMouseWheel: true,
    moveOnMouseMove: true,
  },
};

export const gaugeConfig = {
  type: 'gauge',
  anchor: {
    show: true,
    showAbove: true,
    size: 18,
    itemStyle: {
      color: '#FAC858',
    },
  },
  pointer: {
    icon: 'path://M2.9,0.7L2.9,0.7c1.4,0,2.6,1.2,2.6,2.6v115c0,1.4-1.2,2.6-2.6,2.6l0,0c-1.4,0-2.6-1.2-2.6-2.6V3.3C0.3,1.9,1.4,0.7,2.9,0.7z',
    width: 8,
    length: '80%',
    offsetCenter: [0, '8%'],
  },
  progress: {
    show: true,
    overlap: true,
    roundCap: true,
  },
  axisLine: {
    roundCap: true,
    lineStyle: {
      opacity: 0.7,
    },
  },
  title: {
    fontSize: 14,
    width: '200',
    overflow: 'truncate',
  },
  detail: {
    width: 60,
    height: 14,
    fontSize: 14,
    color: '#fff',
    backgroundColor: 'inherit',
    borderRadius: 3,
  },
};

export const initUserConfig = {
  type: 'line',
};

export const mapTypeOptions = [
  {
    value: 'line',
    label: (
      <Flex align={'center'} gap={'small'}>
        <Icon icon={'Line'} alt={'Line'} type={'echarts'} style={{fontSize: '16px'}} />
        Line
      </Flex>
    ),
  },
  {
    value: 'scatter',
    label: (
      <Flex align={'center'} gap={'small'}>
        <Icon icon={'Scatter'} alt={'Scatter'} type={'echarts'} style={{fontSize: '16px'}} />
        Scatter
      </Flex>
    ),
  },
  {
    value: 'bar',
    label: (
      <Flex align={'center'} gap={'small'}>
        <Icon icon={'Bar'} alt={'Bar'} type={'echarts'} style={{fontSize: '16px'}} />
        Bar
      </Flex>
    ),
  },
  {
    value: 'gauge',
    label: (
      <Flex align={'center'} gap={'small'}>
        <Icon icon={'Gauge'} alt={'Gauge'} type={'echarts'} style={{fontSize: '16px'}} />
        Gauge
      </Flex>
    ),
  },
  {
    value: 'radar',
    label: (
      <Flex align={'center'} gap={'small'}>
        <Icon icon={'Radar'} alt={'Radar'} type={'echarts'} style={{fontSize: '16px'}} />
        Radar
      </Flex>
    ),
  },
];
