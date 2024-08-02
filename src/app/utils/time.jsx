import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isToday from 'dayjs/plugin/isToday';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import minMax from 'dayjs/plugin/minMax';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
dayjs.extend(localizedFormat);
dayjs.extend(isToday);
dayjs.extend(minMax);
dayjs.extend(customParseFormat);

export const getRange = (period, latest) => {
  const latestTime = latest ? new Date(latest) : dayjs();
  return {
    from: dayjs(latestTime).subtract(period ?? 1, 'day'),
    to: '',
  };
};

export const parseTimeFrom = (props = {}) => {
  const {from, to} = props;
  switch (typeof from) {
    case 'object': {
      return from instanceof dayjs ? from : null;
    }
    case 'string': {
      // Check if input is a range (e.g., "2d")
      const rangePattern = /^(\d+)([dhm])$/;
      const match = from.match(rangePattern);
      if (match) {
        const [, val, unit] = match;
        switch (unit) {
          case 'd':
            return dayjs(to || undefined)
              .startOf('d')
              .subtract(val, 'day');
          case 'h':
            return dayjs(to || undefined)
              .startOf('h')
              .subtract(val, 'hour');
          case 'm':
            return dayjs(to || undefined)
              .startOf('m')
              .subtract(val, 'minute');
          default:
            return dayjs(to || undefined); // Default to current time if unit is unrecognized
        }
      }
    }
    // falls through
    case 'number':
    // falls through
    default:
      return dayjs(from).isValid() ? dayjs(from) : null;
  }
};

export const getDayjsRange = range => {
  if (range && range.from && range.to) {
    return {
      from: dayjs(range.from),
      to: dayjs(range.to),
    };
  } else {
    return null;
  }
};

export const getLatestTime = array => {
  if (!array || !array.length) return null;
  const latestTimeOfNode = dayjs.max(
    array.filter(node => node?.latest?.datetime)?.map(item => dayjs(item?.latest?.datetime)),
  );
  return latestTimeOfNode ? new Date(latestTimeOfNode) : null;
};

export const getStartDate = obj => {
  return dayjs.min(obj?.map(item => dayjs(item.datetime))).subtract(1, 'day');
};

export const getEndDate = obj => {
  return dayjs.max(obj?.map(item => dayjs(item.datetime))).add(1, 'day');
};

export const checkToday = date => {
  if (!date) return false;
  return dayjs(date).isToday();
};

export const checkBefore = (firstDate, secondDate = new Date()) => {
  if (!firstDate) return false;
  return dayjs(firstDate).isBefore(dayjs(secondDate), 'day');
};

export const ISOToDate = (timestamp, format) => {
  const dayjsLocal = dayjs(timestamp);
  return dayjsLocal.format(format ?? 'YYYY-MM-DD HH:mm:ss');
};
