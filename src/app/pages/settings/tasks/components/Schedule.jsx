import {Button, Flex, Form, Input, Popover, Select, TimePicker} from 'antd';
import {createStyles} from 'antd-style';
import dayjs from 'dayjs';
import {useEffect, useState} from 'react';

const intervalOptions = [
  {
    value: '@interval',
    label: 'interval',
  },
  {
    value: '@daily',
    label: 'daily',
  },
  {
    value: '@weekly',
    label: 'weekly',
  },
  {
    value: '@monthly',
    label: 'monthly',
  },
];
const dateOptions = [
  {
    value: 1,
    label: 'Monday',
  },
  {
    value: 2,
    label: 'Tuesday',
  },
  {
    value: 3,
    label: 'Wednesday',
  },
  {
    value: 4,
    label: 'Thursday',
  },
  {
    value: 5,
    label: 'Friday',
  },
  {
    value: 6,
    label: 'Saturday',
  },
  {
    value: 0,
    label: 'Sunday',
  },
];

const useStyles = createStyles(({css, token}) => ({
  scheduleInput: css`
    width: 100%;
    padding-left: 60px;
    max-width: 200px;
    min-width: 100px;
    text-align: center;
    input {
      text-align: center;
    }
  `,
  operator: css`
    display: flex;
    align-items: center;
    position: absolute;
    font-weight: bold;
    z-index: 2;
    left: 8px;
    top: 50%;
    transform: translateY(-50%);
  `,
  scheduleBuilder: css`
    padding: 8px;
    @media (max-width: 992px) {
      flex-wrap: wrap;
    }
  `,
  input: css`
    text-align: center;
    input::placeholder {
      text-align: center;
    }
  `,
}));

const timezones = Intl.supportedValuesOf('timeZone').map(tz => ({label: tz, value: tz}));
const generateOrdinalNumbers = () => {
  const ordinalNumbers = [];
  for (let i = 1; i <= 31; i++) {
    let suffix = 'th';
    if (i % 10 === 1 && i !== 11) {
      suffix = 'st';
    } else if (i % 10 === 2 && i !== 12) {
      suffix = 'nd';
    } else if (i % 10 === 3 && i !== 13) {
      suffix = 'rd';
    }
    ordinalNumbers.push({label: i + suffix, value: i});
  }
  return ordinalNumbers;
};
const ordinalNumberOptions = generateOrdinalNumbers();

const OffsetPicker = ({value, onChange}) => {
  const [operator, setOperator] = useState('-');
  const [timeOffset, setTimeOffset] = useState();
  const {styles} = useStyles();

  useEffect(() => {
    if (operator && timeOffset) {
      onChange?.(`${operator}${dayjs(timeOffset).format('HH:mm')}`);
    }
  }, [operator, timeOffset, onChange]);

  useEffect(() => {
    if (!timeOffset && typeof value === 'string') {
      setOperator(value.substring(0, 1));
      setTimeOffset(dayjs(value.substring(1), 'HH:mm'));
    }
  }, [value]);

  return (
    <div style={{position: 'relative'}}>
      <div className={styles.operator}>
        UTC
        <Button type="outlined" size="small" onClick={() => setOperator(operator === '-' ? '+' : '-')}>
          {operator}
        </Button>
      </div>
      <TimePicker className={styles.scheduleInput} format={'HH:mm'} value={timeOffset} onChange={setTimeOffset} />
    </div>
  );
};

const ScheduleBuilder = () => {
  const form = Form.useFormInstance();
  const type = Form.useWatch(['schedule', 'type'], {form, preserve: true});
  const styles = useStyles();

  return (
    <Flex className={styles.scheduleBuilder} gap="middle" align="center">
      <Form.Item label="run" name={['schedule', 'type']}>
        <Select className={styles.scheduleInput} placeholder="interval" options={intervalOptions} />
      </Form.Item>
      {type === '@interval' && (
        <Form.Item
          label="every"
          name={['schedule', 'value']}
          rules={[
            {
              type: 'number',
              min: 5,
              message: 'Interval should be number and not less than 5',
            },
          ]}
          normalize={value => parseInt(value, 10)}
        >
          <Input className={styles.scheduleInput} addonAfter="minutes" type="number" />
        </Form.Item>
      )}
      {type === '@daily' && (
        <>
          <Form.Item label="at" name={['schedule', 'at']}>
            <TimePicker className={styles.scheduleInput} format={'HH:mm'} />
          </Form.Item>
          {/* <Form.Item label="in" name={['schedule', 'tz', 'tz_name']}>
            <Select className={styles.scheduleInput} showSearch options={timezones} placeholder="Timezone" />
          </Form.Item> */}
          <Form.Item label="tz" name={['schedule', 'tz']}>
            <OffsetPicker />
          </Form.Item>
        </>
      )}
      {type === '@weekly' && (
        <>
          <Form.Item label="on" name={['schedule', 'dow']}>
            <Select
              className={styles.scheduleInput}
              showSearch
              mode="multiple"
              options={dateOptions}
              placeholder="Dates"
            />
          </Form.Item>
          <Form.Item label="at" name={['schedule', 'at']}>
            <TimePicker className={styles.scheduleInput} format={'HH:mm'} />
          </Form.Item>
          {/* <Form.Item label="in" name={['schedule', 'tz', 'tz_name']}>
            <Select className={styles.scheduleInput} showSearch options={timezones} placeholder="Timezone" />
          </Form.Item> */}
          <Form.Item label="tz" name={['schedule', 'tz']}>
            <OffsetPicker />
          </Form.Item>
        </>
      )}
      {type === '@monthly' && (
        <>
          <Form.Item label="on" name={['schedule', 'day']}>
            <Select
              className={styles.scheduleInput}
              showSearch
              mode="multiple"
              options={ordinalNumberOptions}
              placeholder="Ordinal Dates"
            />
          </Form.Item>
          <Form.Item label="days at" name={['schedule', 'at']}>
            <TimePicker className={styles.scheduleInput} format={'HH:mm'} />
          </Form.Item>
          {/* <Form.Item label="in" name={['schedule', 'tz', 'tz_name']}>
            <Select className={styles.scheduleInput} showSearch options={timezones} placeholder="Timezone" />
          </Form.Item> */}
          <Form.Item label="tz" name={['schedule', 'tz']}>
            <OffsetPicker />
          </Form.Item>
        </>
      )}
    </Flex>
  );
};

export const Schedule = () => {
  const form = Form.useFormInstance();
  const schedule = Form.useWatch(['schedule'], {form, preserve: true});
  const [value, setValue] = useState();
  const {styles} = useStyles();

  useEffect(() => {
    if (schedule) {
      const {type, value, at, tz, dow, day} = schedule;
      let expressing;
      switch (type) {
        case '@interval':
          expressing = `run every ${value ?? '?'} minutes`;
          break;
        case '@daily':
          expressing = `run daily at ${dayjs(at).format('HH:mm') ?? '?'} UTC ${tz ?? '?'}`;
          break;
        case '@weekly':
          expressing = `run weekly on ${dow?.map(d => dateOptions.find(o => o.value === d).label).join(', ') ?? '?'} at ${dayjs(at).format('HH:mm')} UTC ${tz ?? '?'}`;
          break;
        case '@monthly':
          expressing = `run monthly on ${day?.map(d => ordinalNumberOptions.find(o => o.value === d).label).join(', ') ?? '?'} at ${dayjs(at).format('HH:mm')} UTC ${tz ?? '?'}`;
          break;

        default:
          break;
      }

      setValue(expressing);
    }
  }, [schedule]);

  return (
    <div id="scheduleInput" style={{position: 'relative'}}>
      <Popover content={<ScheduleBuilder />} trigger="click">
        <Input className={styles.input} placeholder="Schedule" value={value} />
      </Popover>
    </div>
  );
};
