import BarSvg from './bar.svg?react';
import GaugeSvg from './gauge.svg?react';
import LineSvg from './line.svg?react';
import MapSvg from './map.svg?react';
import PieSvg from './pie.svg?react';
import RadarSvg from './radar.svg?react';
import ScatterSvg from './scatter.svg?react';

export const Bar = props => <BarSvg viewBox={'0 0 600 600'} {...props} />;
export const Gauge = props => <GaugeSvg viewBox={'0 0 600 600'} {...props} />;
export const Line = props => <LineSvg viewBox={'0 0 600 600'} {...props} />;
export const Map = props => <MapSvg viewBox={'0 0 600 600'} {...props} />;
export const Pie = props => <PieSvg viewBox={'0 0 600 600'} {...props} />;
export const Radar = props => <RadarSvg viewBox={'0 0 600 600'} {...props} />;
export const Scatter = props => <ScatterSvg viewBox={'0 0 600 600'} {...props} />;
