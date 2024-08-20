import {Button, Flex, Form, Input, Select, TimePicker, Typography} from 'antd';
import {createStyles} from 'antd-style';
import dayjs from 'dayjs';
import {useEffect, useState} from 'react';
const {Text} = Typography;

const typeOptions = [
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

export const Schedule = props => {
  const {value: schedule = {}, onChange} = props;
  const {type, value, at, tz, dow, day} = schedule;
  const description = (() => {
    switch (type) {
      case '@interval':
        return `Every ${value ?? '?'} minutes`;
      case '@daily':
        return `Daily at ${dayjs(at).format('HH:mm') ?? '?'} UTC ${tz ?? '?'}`;
      case '@weekly':
        return `Weekly on ${dow?.map(d => dateOptions.find(o => o.value === d).label).join(', ') ?? '?'} at ${dayjs(at).format('HH:mm')} UTC ${tz ?? '?'}`;
      case '@monthly':
        return `Monthly on ${day?.map(d => ordinalNumberOptions.find(o => o.value === d).label).join(', ') ?? '?'} at ${dayjs(at).format('HH:mm')} UTC ${tz ?? '?'}`;
      default:
        return 'Invalid schedule';
    }
  })();
  const {styles} = useStyles();

  const triggerChange = changedValue => {
    onChange?.({
      ...schedule,
      ...changedValue,
    });
  };

  return (
    <Flex vertical gap={'small'}>
      <Form onValuesChange={triggerChange}>
        <Flex gap={'small'} align={'flex-start'}>
          <Form.Item name={['type']}>
            <Select placeholder={'interval'} options={typeOptions} />
          </Form.Item>
          {
            {
              '@interval': (
                <Form.Item
                  name={['value']}
                  rules={[
                    {
                      type: 'number',
                      min: 5,
                      message: 'Interval should be number and not less than 5',
                    },
                  ]}
                  normalize={value => parseInt(value, 10)}
                >
                  <Input addonAfter="minutes" type="number" />
                </Form.Item>
              ),
              '@daily': (
                <>
                  <Form.Item name={['at']}>
                    <TimePicker format={'HH:mm'} />
                  </Form.Item>
                  <Form.Item name={['tz']}>
                    <OffsetPicker />
                  </Form.Item>
                </>
              ),
              '@weekly': (
                <>
                  <Form.Item name={['dow']}>
                    <Select showSearch mode="multiple" options={dateOptions} placeholder="Dates" />
                  </Form.Item>
                  <Form.Item name={['at']}>
                    <TimePicker format={'HH:mm'} />
                  </Form.Item>
                  <Form.Item name={['tz']}>
                    <OffsetPicker />
                  </Form.Item>
                </>
              ),
              '@monthly': (
                <>
                  <Form.Item name={['day']}>
                    <Select showSearch mode="multiple" options={ordinalNumberOptions} placeholder="Ordinal Dates" />
                  </Form.Item>
                  <Form.Item name={['at']}>
                    <TimePicker format={'HH:mm'} />
                  </Form.Item>
                  <Form.Item name={['tz']}>
                    <OffsetPicker />
                  </Form.Item>
                </>
              ),
            }[type]
          }
        </Flex>
      </Form>
      <Text type="secondary">{description}</Text>
    </Flex>
  );
};

// {
//   type === '@interval' && (
//     <Form.Item
//       label="every"
//       name={['schedule', 'value']}
//       rules={[
//         {
//           type: 'number',
//           min: 5,
//           message: 'Interval should be number and not less than 5',
//         },
//       ]}
//       normalize={value => parseInt(value, 10)}
//     ></Form.Item>
//   );
// }
// {
//   type === '@daily' && (
//     <>
//       <Form.Item label="at" name={['schedule', 'at']}>
//         <TimePicker className={styles.scheduleInput} format={'HH:mm'} />
//       </Form.Item>
//       {/* <Form.Item label="in" name={['schedule', 'tz', 'tz_name']}>
//             <Select className={styles.scheduleInput} showSearch options={timezones} placeholder="Timezone" />
//           </Form.Item> */}
//       <Form.Item label="tz" name={['schedule', 'tz']}>
//         <OffsetPicker />
//       </Form.Item>
//     </>
//   );
// }
// {
//   type === '@weekly' && (
//     <>
//       <Form.Item label="on" name={['schedule', 'dow']}>
//         <Select className={styles.scheduleInput} showSearch mode="multiple" options={dateOptions} placeholder="Dates" />
//       </Form.Item>
//       <Form.Item label="at" name={['schedule', 'at']}>
//         <TimePicker className={styles.scheduleInput} format={'HH:mm'} />
//       </Form.Item>
//       {/* <Form.Item label="in" name={['schedule', 'tz', 'tz_name']}>
//             <Select className={styles.scheduleInput} showSearch options={timezones} placeholder="Timezone" />
//           </Form.Item> */}
//       <Form.Item label="tz" name={['schedule', 'tz']}>
//         <OffsetPicker />
//       </Form.Item>
//     </>
//   );
// }
// {
//   type === '@monthly' && (
//     <>
//       <Form.Item label="on" name={['schedule', 'day']}>
//         <Select
//           className={styles.scheduleInput}
//           showSearch
//           mode="multiple"
//           options={ordinalNumberOptions}
//           placeholder="Ordinal Dates"
//         />
//       </Form.Item>
//       <Form.Item label="days at" name={['schedule', 'at']}>
//         <TimePicker className={styles.scheduleInput} format={'HH:mm'} />
//       </Form.Item>
//       {/* <Form.Item label="in" name={['schedule', 'tz', 'tz_name']}>
//             <Select className={styles.scheduleInput} showSearch options={timezones} placeholder="Timezone" />
//           </Form.Item> */}
//       <Form.Item label="tz" name={['schedule', 'tz']}>
//         <OffsetPicker />
//       </Form.Item>
//     </>
//   );
// }
