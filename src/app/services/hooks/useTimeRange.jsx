import dayjs from 'dayjs';
import {useMemo} from 'react';
import {getRange} from 'utils/time';

export const useTimeRange = previousData => {
  return useMemo(() => {
    if (!previousData?.id || !previousData?.config?.timeRange) {
      return {...getRange(1), relative: {days: '-1'}};
    } else {
      const {timeRange} = previousData?.config;
      return timeRange?.relative
        ? {
            relative: timeRange?.relative,
            from: dayjs(new Date()).add(dayjs.duration(timeRange?.relative)),
            to: '',
          }
        : {
            from: dayjs(timeRange?.from),
            to: timeRange?.to ? dayjs(timeRange?.to) : '',
          };
    }
  }, [previousData]);
};
