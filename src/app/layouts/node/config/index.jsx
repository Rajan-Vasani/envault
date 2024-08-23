import Cookies from 'js-cookie';
import {v4} from 'uuid';

export const nodeNavItems = {
  device: [
    {value: 'data', label: 'Data', default: true},
    {value: 'image', label: 'Image'},
    {value: 'state', label: 'State'},
  ],
  chart: [
    {value: 'chart', label: 'Chart', default: true},
    {value: 'table', label: 'Table'},
  ],
};

const commonNodeAttrs = {
  name: `temp_${v4()}`,
  parent: null,
};

export const baseNodeAttrs = {
  group: {
    ...commonNodeAttrs,
  },
  series: {
    ...commonNodeAttrs,
  },
  chart: {
    ...commonNodeAttrs,
  },
  timelapse: {
    ...commonNodeAttrs,
  },
  gallery: {
    ...commonNodeAttrs,
  },
  dashboard: {
    ...commonNodeAttrs,
  },
  device: {
    ...commonNodeAttrs,
    driver: {
      type: 'base',
    },
  },
  variable: {
    ...commonNodeAttrs,
  },
  task: {
    ...commonNodeAttrs,
    owner: Cookies.get('uid'),
  },
  notification: {
    ...commonNodeAttrs,
  },
};
