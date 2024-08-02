import dayjs from 'dayjs';
import {gaugeConfig, initBuilderOption} from 'pages/chart/config';
import {ISOToDate} from 'utils/time';

const getGaugeData = seriesData => {
  return seriesData.map((s, idx) => ({
    value: s?.data[0]?.value.toFixed(3),
    name: s.name,
    title: {offsetCenter: ['50', `${(idx + 1) * 30}`]},
    detail: {offsetCenter: ['-100', `${(idx + 1) * 30}`], formatter: `{value} ${s?.variable?.unit}`},
  }));
};

const getYConfig = (seriesData, userConfig) =>
  seriesData
    .map((u, idx) => {
      const {yposition, invert, unit = true} = userConfig[u.id] || {};
      return {
        type: 'value',
        name: u?.variable?.unit,
        position: yposition || (idx === 0 ? 'left' : 'right'),
        axisLine: {show: true},
        axisLabel: {formatter: unit ? `{value} ${u?.variable?.unit}` : null},
        offset: idx === 0 ? 0 : (idx - 1) * 80,
        inverse: invert,
      };
    })
    .filter((v, i, a) => a.findIndex(v2 => v2.name === v.name) === i);

const getSeriesList = (seriesData, userConfig, yAxisConfig) =>
  seriesData.map(s => {
    const {type, color} = userConfig[s.id] || {};
    return {
      name: s.name,
      type: type || userConfig.type,
      yAxisIndex: yAxisConfig.findIndex(c => c?.name === s?.variable?.unit),
      itemStyle: {color: color || null},
      data: s.data?.map(singleData => [singleData.datetime, singleData.value]),
    };
  });

const getRadarConfig = radarSeries => {
  if (!radarSeries?.length) return {};
  const directionSeries = radarSeries.find(s => s?.variable?.unit === '°');
  const angleData = directionSeries
    ? directionSeries.data.map(singleData => singleData.value.toFixed(2))
    : radarSeries[0].data?.map(singleData => dayjs(singleData.datetime).format('YYYY-MM-DD HH:mm:ss'));
  const radarConfig = {
    tooltip: {
      trigger: 'item',
    },
    radiusAxis: {},
    polar: {},
    angleAxis: {
      type: 'category',
      data: angleData,
      min: 300,
      max: 360,
    },
  };
  return radarConfig;
};

export const getChartConfig = (seriesData = [], userConfig = {}) => {
  const {type, coordinateSystem, radiusAxis, angleAxis} = userConfig;
  const windDirectionSeries = seriesData.find(s => s?.variable?.unit === '°');
  const windSpeedSeries = seriesData.find(s => s?.variable?.unit !== '°');
  if (windDirectionSeries && coordinateSystem === 'polar' && ['line', 'bar', 'scatter'].includes(type)) {
    const windRoseData = windSpeedSeries?.data?.map((speed, idx) => [speed.value, windDirectionSeries.data[idx].value]);
    return {
      title: {
        text: windSpeedSeries?.name,
        left: 'center',
      },
      polar: {},
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
        formatter: function (params) {
          return `${ISOToDate(
            windSpeedSeries?.data[params[0]?.dataIndex]?.datetime,
          )} <br/> ${params[0].data[0]} ${windSpeedSeries?.variable?.unit} <br/> ${params[0].data[1]} ${windDirectionSeries?.variable?.unit}`;
        },
      },
      angleAxis: {
        type: 'value',
        startAngle: !!angleAxis?.startAngle ? +angleAxis?.startAngle : 0,
        max: !!angleAxis?.max ? +angleAxis?.max : 360,
        min: !!angleAxis?.min ? +angleAxis?.min : null,
      },
      radiusAxis: {
        max: !!radiusAxis?.max ? +radiusAxis?.max : null,
        min: !!radiusAxis?.min ? +radiusAxis?.min : null,
      },
      series: [
        {
          coordinateSystem: userConfig?.coordinateSystem ?? null,
          name: windDirectionSeries?.name,
          type: type,
          data: windRoseData,
        },
      ],
    };
  }
  const gaugeSeries =
    type === 'gauge'
      ? seriesData.filter(s => !(userConfig[s.id] && userConfig[s.id]?.type !== 'gauge'))
      : seriesData.filter(s => userConfig[s.id]?.type === 'gauge');
  const radarSeries =
    type === 'radar'
      ? seriesData.filter(s => !(userConfig[s.id] && userConfig[s.id]?.type !== 'radar'))
      : seriesData.filter(s => userConfig[s.id]?.type === 'radar');

  const otherSeries = seriesData.filter(item => ![...gaugeSeries, ...radarSeries].includes(item));
  const legendList = otherSeries.map(s => s.name) || [];
  const yAxisConfig = getYConfig(otherSeries, userConfig);

  const gaugeListData = getGaugeData(gaugeSeries);
  const gaugeList = gaugeListData?.length
    ? [
        {
          ...gaugeConfig,
          max: userConfig?.gauge?.max ? userConfig?.gauge?.max : Math.max(...gaugeListData.map(g => g.value)) + 0.5,
          min: userConfig?.gauge?.min ? userConfig?.gauge?.min : 0,
          z: 1,
          zlevel: 1,
          data: gaugeListData,
        },
      ]
    : [];

  const radarList = radarSeries?.length
    ? radarSeries.map(r => ({
        type: 'bar',
        data: r.data?.map(singleData => singleData.value.toFixed(3)),
        coordinateSystem: 'polar',
        name: r.name,
        stack: 'a',
        emphasis: {
          focus: 'series',
        },
      }))
    : [];

  const otherList = getSeriesList(otherSeries, userConfig, yAxisConfig);
  const radarConfig = getRadarConfig(radarSeries);

  return {
    ...initBuilderOption,
    ...radarConfig,
    legend: otherSeries.length ? {data: legendList} : {},
    yAxis: yAxisConfig.length > 0 ? yAxisConfig : {},
    series: [...otherList, ...gaugeList, ...radarList],
    dataZoom: userConfig?.dataZoom ?? initBuilderOption?.dataZoom,
  };
};
