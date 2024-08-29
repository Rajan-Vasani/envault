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
import {use as echartUse} from 'echarts/core';
import {CanvasRenderer} from 'echarts/renderers';
import {isObject, mergeWith, pick} from 'lodash';
import {useEffect, useLayoutEffect, useRef} from 'react';

// Register the required components
echartUse([
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
  const chartSize = useSize(chartRef ?? null);
  const token = useTheme();
  const {styles} = useStyles();

  // initialize the chart
  useLayoutEffect(() => {
    let chart = getInstanceByDom(chartRef.current);
    if (!chart) {
      chart = init(chartRef.current, theme, {renderer: 'canvas'});
    }
    return () => {
      chart.dispose();
    };
  }, [theme]);

  // event handling
  useLayoutEffect(() => {
    let chart = getInstanceByDom(chartRef.current);
    if (!chart) return;
    chart.on('dataZoom', evt => {
      const previousZoom = option.dataZoom;
      const currentZoom = chart.getOption().dataZoom;
      const updateZoom = mergeWith(previousZoom, currentZoom, (objValue, srcValue) => {
        if (isObject(objValue)) {
          return pick(srcValue, Object.keys(objValue));
        }
        return srcValue;
      });

      onZoom?.(updateZoom);
    });
    return () => {
      if (chart) {
        chart.off('dataZoom');
      }
    };
  }, [onZoom]);

  // update the chart
  useEffect(() => {
    let chart = getInstanceByDom(chartRef.current);
    if (!chart) return;
    chart.setOption(option, settings ?? {replaceMerge: ['series', 'xAxis', 'yAxis', 'dataZoom']}, theme);
    chart.resize({opts: {animation: {easing: `${token.motionEaseOut} 0s`}}});
    if (loading) {
      chart.showLoading();
    } else {
      chart.hideLoading();
    }
  }, [option, settings, loading, theme, chartSize, token.motionEaseOut]);

  return <div ref={chartRef} className={styles.chart} style={{...style}} />;
};
export default Echarts;
