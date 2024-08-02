import {useCallback} from 'react';
import {BarConfig} from './bar';
import {GaugeConfig} from './gauge';
import {LineConfig} from './line';
import {RadarConfig} from './radar';
import {ScatterConfig} from './scatter';

export const ChartTypeConfig = props => {
  const {type} = props;
  const getForm = useCallback(() => {
    switch (type) {
      case 'line':
        return <LineConfig {...props} />;
      case 'scatter':
        return <ScatterConfig {...props} />;
      case 'bar':
        return <BarConfig {...props} />;
      case 'radar':
        return <RadarConfig {...props} />;
      case 'gauge':
        return <GaugeConfig {...props} />;
      default:
        return null;
    }
  }, [type, props]);
  return <>{getForm()}</>;
};
