import {DatePicker} from 'antd';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import isToday from 'dayjs/plugin/isToday';
import localeData from 'dayjs/plugin/localeData';
import weekday from 'dayjs/plugin/weekday';
import {useCallback, useRef, useState} from 'react';
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(isToday);
dayjs.extend(duration);
const {RangePicker} = DatePicker;

const TimeRange = props => {
  const {id, value, lastTime, containerStyle, onChange} = props;
  const timeRangeRef = useRef(null);
  const [range, setRange] = useState([value?.from, value?.to]);

  const triggerChange = changedValue => {
    onChange?.({
      to: null,
      from: dayjs().startOf('d').subtract(24, 'h'),
      delta: [24, 'h'],
      ...value,
      ...changedValue,
    });
  };

  const rangePresets = [
    {
      label: 'Last 24 Hours',
      value: [dayjs().startOf('h').subtract(24, 'h'), null],
    },
    {
      label: 'Last 3 Days',
      value: [dayjs().startOf('d').subtract(3, 'd'), null],
    },
    {
      label: 'Last 7 Days',
      value: [dayjs().startOf('d').subtract(7, 'd'), null],
    },
    {
      label: 'Last 14 Days',
      value: [dayjs().startOf('d').subtract(14, 'd'), null],
    },
    {
      label: 'Last 30 Days',
      value: [dayjs().startOf('d').subtract(30, 'd'), null],
    },
    {
      label: 'Last 90 Days',
      value: [dayjs().startOf('d').subtract(90, 'd'), null],
    },
  ];

  const onRangeChange = dates => {
    const [from, to] = dates || [];
    const delta = (() => {
      const diff = dayjs(to || undefined).diff(from);
      if (diff >= 86400000) {
        return [Math.floor(diff / 86400000), 'd'];
      } else if (diff >= 3600000) {
        return [Math.floor(diff / 3600000), 'h'];
      } else {
        return [Math.floor(diff / 60000), 'm'];
      }
    })();
    setRange([from, to]);
    return triggerChange({to, from, delta});
  };

  const cellRender = useCallback((current, info) => {
    if (info.type !== 'date') {
      return info.originNode;
    }
    if (typeof current === 'number') {
      return <div className="ant-picker-cell-inner">{current}</div>;
    }
    return <div className="ant-picker-cell-inner">{current.date()}</div>;
  }, []);

  return (
    <div style={containerStyle} id={id}>
      <RangePicker
        placeholder={['', 'Now']}
        allowEmpty={[false, true]}
        onChange={onRangeChange}
        presets={rangePresets}
        cellRender={cellRender}
        value={range}
        disabledDate={current => current.isAfter(dayjs(lastTime))}
        ref={timeRangeRef}
      />
    </div>
  );
};

export default TimeRange;
