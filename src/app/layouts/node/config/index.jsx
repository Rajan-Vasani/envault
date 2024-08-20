import Cookies from 'js-cookie';
import {v4} from 'uuid';

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
    type: 'base',
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
