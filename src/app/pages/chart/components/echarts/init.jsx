import {createStyles, useTheme} from 'antd-style';
import {useSize} from 'components/resizeable';
import {getInstanceByDom, init} from 'echarts';
import {BarChart, LineChart, PieChart, ScatterChart} from 'echarts/charts';
import {
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
} from 'echarts/components';
import {use} from 'echarts/core';
import {CanvasRenderer} from 'echarts/renderers';
import {useEffect, useRef, useState} from 'react';

// Register the required components
use([
  LegendComponent,
  ScatterChart,
  LineChart,
  BarChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  ToolboxComponent, // A group of utility tools, which includes export, data view, dynamic type switching, data area zooming, and reset.
  DataZoomComponent, // Used in Line Graph Charts
  CanvasRenderer, // If you only need to use the canvas rendering mode, the bundle will not include the SVGRenderer module, which is not needed.
]);

const useStyles = createStyles(({token, css}) => ({
  chart: css`
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: ${token.colorBgContainer};
    border-radius: ${token.borderRadius}px;
  `,
}));

export const Echarts = ({option, style, settings, loading, theme, onZoom}) => {
  const chartRef = useRef(null);
  const chartSize = useSize(chartRef);
  const [chart, setChart] = useState(null);
  const token = useTheme();
  const {styles} = useStyles();

  useEffect(() => {
    if (!chartRef.current) {
      return;
    }
    const currentChart = getInstanceByDom(chartRef.current);
    if (!currentChart) {
      return setChart(init(chartRef.current, theme));
    }
    currentChart.setOption(option, settings ?? true);
    currentChart.resize({opts: {animation: {easing: `${token.motionEaseOut} 0s`}}});

    return () => {
      if (chart) {
        chart.dispose();
      }
    };
  }, [chartRef, theme]);

  // resize effect
  useEffect(() => {
    if (chart) {
      chart.resize({opts: {animation: {easing: `${token.motionEaseOut} 0s`}}});
    }
  }, [chart, chartSize]);

  // event handling
  useEffect(() => {
    if (chart) {
      chart.on('dataZoom', evt => onZoom?.(evt));
    }
    return () => {
      if (chart) {
        chart.off('dataZoom');
      }
    };
  }, []);

  // options and dataloading effects
  useEffect(() => {
    if (!chart) {
      return;
    }
    // Update chart
    chart.setOption(option, settings || {replaceMerge: ['xAxis', 'yAxis', 'series']});
    // Handle loading state
    if (loading) {
      chart.showLoading();
    } else {
      chart.hideLoading();
    }
  }, [chart, option, settings, loading]);

  return <div ref={chartRef} className={styles.chart} style={{...style}} />;
};
export default Echarts;
