import {Flex, Form, Input, Select, Space, TimePicker, Typography} from 'antd';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import timezones from 'utils/timezone.json';
dayjs.extend(utc);
dayjs.extend(timezone);
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

export const FormSchedule = props => {
  const {prefix} = props;
  const form = Form.useFormInstance();
  const schedule = Form.useWatch([...prefix], {form}) ?? {};
  const {type, value, at, tz, dow, day} = schedule;
  const description = (() => {
    switch (type) {
      case '@interval':
        return `Every ${value ?? '?'} minutes`;
      case '@daily':
        return `Daily at ${at ?? '?'} ${tz ?? 'UTC'}`;
      case '@weekly':
        return `Weekly on ${dow?.map(d => dateOptions.find(o => o.value === d).label).join(', ') ?? '?'} at ${at ?? '?'} ${tz ?? 'UTC'}`;
      case '@monthly':
        return `Monthly on ${day?.map(d => ordinalNumberOptions.find(o => o.value === d).label).join(', ') ?? '?'} at ${at ?? '?'} ${tz ?? 'UTC'}`;
      default:
        return 'Invalid schedule';
    }
  })();

  const normalizeTime = value => dayjs(value).format('HH:mm');
  const getTimeValueProps = value => dayjs(value, 'HH:mm');

  return (
    <Flex vertical style={{width: '100%'}}>
      <Text type="secondary">{description}</Text>
      <Space.Compact block>
        <Form.Item name={[...prefix, 'type']}>
          <Select
            placeholder={'interval'}
            options={typeOptions}
            popupMatchSelectWidth={100}
            style={{width: 'max-content', minWidth: 100}}
          />
        </Form.Item>
        {
          {
            '@interval': (
              <Form.Item
                name={[...prefix, 'value']}
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
                <Form.Item name={[...prefix, 'at']} normalize={normalizeTime} getValueProps={getTimeValueProps}>
                  <TimePicker format={'HH:mm'} />
                </Form.Item>
                <Form.Item name={[...prefix, 'tz']} initialValue={dayjs.tz.guess()}>
                  <Select
                    showSearch
                    options={timezones}
                    fieldNames={{label: 'abbrev', value: 'name'}}
                    optionRender={item => `${item.value} (${item.label})`}
                    labelRender={item => item.label}
                    placeholder="Timezone"
                    popupMatchSelectWidth={260}
                    style={{width: 'max-content', minWidth: 50}}
                  />
                </Form.Item>
              </>
            ),
            '@weekly': (
              <>
                <Form.Item name={[...prefix, 'dow']}>
                  <Select
                    showSearch
                    mode={'multiple'}
                    options={dateOptions}
                    placeholder={'Dates'}
                    style={{width: 'max-content', minWidth: 100}}
                    popupMatchSelectWidth={120}
                    maxTagCount={'responsive'}
                  />
                </Form.Item>
                <Form.Item name={[...prefix, 'at']} normalize={normalizeTime} getValueProps={getTimeValueProps}>
                  <TimePicker format={'HH:mm'} style={{minWidth: 80}} />
                </Form.Item>
                <Form.Item name={[...prefix, 'tz']} initialValue={dayjs.tz.guess()}>
                  <Select
                    showSearch
                    options={timezones}
                    fieldNames={{label: 'abbrev', value: 'name'}}
                    optionRender={item => `${item.value} (${item.label})`}
                    labelRender={item => item.label}
                    placeholder={'Timezone'}
                    popupMatchSelectWidth={260}
                    style={{width: 'max-content', minWidth: 50}}
                  />
                </Form.Item>
              </>
            ),
            '@monthly': (
              <>
                <Form.Item name={[...prefix, 'day']}>
                  <Select
                    showSearch
                    mode={'multiple'}
                    options={ordinalNumberOptions}
                    placeholder={'Dates'}
                    maxTagCount={'responsive'}
                    style={{width: 'max-content', minWidth: 100}}
                  />
                </Form.Item>
                <Form.Item name={[...prefix, 'at']} normalize={normalizeTime} getValueProps={getTimeValueProps}>
                  <TimePicker format={'HH:mm'} style={{minWidth: 80}} />
                </Form.Item>
                <Form.Item name={[...prefix, 'tz']} initialValue={dayjs.tz.guess()}>
                  <Select
                    showSearch
                    options={timezones}
                    fieldNames={{label: 'abbrev', value: 'name'}}
                    optionRender={item => `${item.value} (${item.label})`}
                    labelRender={item => item.label}
                    placeholder={'Timezone'}
                    popupMatchSelectWidth={260}
                    style={{width: 'max-content', minWidth: 50}}
                  />
                </Form.Item>
              </>
            ),
          }[type]
        }
      </Space.Compact>
    </Flex>
  );
};
