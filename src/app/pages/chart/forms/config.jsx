import {App, Divider, Flex, Form, Input, Select, Switch} from 'antd';
import {StreamIndicator} from 'components/atoms/StreamIndicator';
import TimeRange from 'components/molecules/TimeRange';
import dayjs from 'dayjs';
import {useNodeSaveMutation} from 'hooks/useNode';
import {useNodeContext} from 'layouts/node/context';
import {isArray, isNil, mergeWith, omitBy} from 'lodash';
import {baseGlobal, baseOption, mapTypeOptions} from 'pages/chart/config';
import AxisFormList from 'pages/chart/forms/axis';
import SeriesFormList from 'pages/chart/forms/series';
import DataZoomFormList from 'pages/chart/forms/zoom';
import {useEffect} from 'react';
import {parseTimeFrom} from 'utils/time';

export const ChartConfig = props => {
  const {setForm, disabled} = props;
  const {eventState, handleStreamStateChange} = {eventstate: '', handleStreamStateChange: () => {}}; // temporary
  const {node, config, setConfig} = useNodeContext();
  const [form] = Form.useForm();
  const {mutate: saveNode} = useNodeSaveMutation({type: node.type});
  const {notification} = App.useApp();
  const initialValues = {
    global: baseGlobal,
    option: baseOption,
  };
  const show = Form.useWatch(
    values => ({
      legend: values?.option?.legend?.show,
      tooltip: values?.option?.tooltip?.show,
      toolbox: values?.option?.toolbox?.show,
    }),
    form,
  );

  useEffect(() => setForm?.(form), [form, setForm]);
  useEffect(() => {
    if (config?.option && config?.global) {
      form.setFieldsValue(config);
    } else {
      form.setFieldsValue(initialValues);
    }
  }, [config, form]);

  const onFinish = values => {
    notification.info({description: 'Saving chart configuration'});
    const timeRange = values.global.timeRange;
    const dataChart = {
      id: node?.id,
      type: 'chart',
      data: values.option.series.reduce(
        (a, v, index) => ({
          ...a,
          [`${index}-${v.id}`]: {
            pathname: `/series-data`,
            query: new URLSearchParams(
              omitBy(
                {
                  hub: globalThis.envault.hub,
                  series: v.id,
                  from: timeRange?.from,
                  to: timeRange?.to,
                },
                isNil,
              ),
            ).toString(),
          },
        }),
        {},
      ),
      config,
    };
    saveNode({data: dataChart});
  };

  const onValuesChange = (changedValues, allValues) => {
    // merge objects, replace arrays
    setConfig?.(config => structuredClone(mergeWith(config, allValues, (a, b) => (isArray(b) ? b : undefined))));
    console.log(JSON.stringify(changedValues, null, 2), JSON.stringify(allValues, null, 2));
  };
  // Normalize input and output of form components to suit chart options
  // input: Global TimeRange
  const getTimeRangeValueProps = value => {
    if (value) {
      value.from = parseTimeFrom(value);
      value.to = value.to ? dayjs(value.to) : null;
      return {value};
    }
  };
  // output: Global TimeRange
  const normalizeTimeRange = value => {
    if (value) {
      let {from, to, delta} = value;
      if (!to && delta) {
        from = delta.join('');
      } else {
        from = from.valueOf();
        to = to.valueOf();
      }
      return {from, to};
    }
  };
  return (
    <Flex vertical justify="space-between">
      <Form
        form={form}
        layout="horizontal"
        labelAlign="left"
        name={`chart-config-${node?.id}`}
        requiredMark={false}
        onFinish={onFinish}
        initialValues={initialValues}
        onValuesChange={onValuesChange}
        disabled={disabled}
      >
        <Form.Item label={'Stream'}>
          <Flex justify={'flex-start'} gap={'small'}>
            <Form.Item name={['global', 'eventStream']} noStyle valuePropName={'checked'}>
              <Switch />
            </Form.Item>
            <StreamIndicator eventState={eventState} onChange={handleStreamStateChange} />
          </Flex>
        </Form.Item>
        <Form.Item
          label={'Time'}
          name={['global', 'timeRange']}
          getValueProps={getTimeRangeValueProps}
          normalize={normalizeTimeRange}
        >
          <TimeRange />
        </Form.Item>
        <Form.Item label={'Type'} name={['global', 'type']}>
          <Select options={mapTypeOptions} />
        </Form.Item>

        <Divider orientation={'left'} type={'horizontal'} plain>
          Series
        </Divider>
        <SeriesFormList name={['option', 'series']} />

        <Divider orientation={'left'} type={'horizontal'} plain>
          Y Axis
        </Divider>
        <AxisFormList name={['option', 'yAxis']} />

        <Divider orientation={'left'} type={'horizontal'} plain>
          X Axis
        </Divider>
        <AxisFormList name={['option', 'xAxis']} />

        <Divider orientation={'left'} type={'horizontal'} plain>
          Data Zoom
        </Divider>
        <DataZoomFormList name={['option', 'dataZoom']} />

        <Divider orientation={'left'} type={'horizontal'} plain>
          Legend
        </Divider>
        <Form.Item label={'Show'} name={['option', 'legend', 'show']} valuePropName={'checked'}>
          <Switch />
        </Form.Item>
        {show?.legend && (
          <>
            <Form.Item label={'Type'} name={['option', 'legend', 'type']}>
              <Select
                options={[
                  {label: 'Plain', value: 'plain'},
                  {label: 'Scroll', value: 'scroll'},
                ]}
              />
            </Form.Item>
            <Form.Item label={'Orientation'} name={['option', 'legend', 'orient']}>
              <Select
                options={[
                  {label: 'Horizontal', value: 'horizontal'},
                  {label: 'Vertical', value: 'vertical'},
                ]}
              />
            </Form.Item>
          </>
        )}

        <Divider orientation={'left'} type={'horizontal'} plain>
          Tooltip
        </Divider>
        <Form.Item label={'Show'} name={['option', 'tooltip', 'show']} valuePropName={'checked'}>
          <Switch />
        </Form.Item>
        {show?.tooltip && (
          <>
            <Form.Item label={'Snap'} name={['option', 'tooltip', 'snap']} valuePropName={'checked'}>
              <Switch />
            </Form.Item>
            <Form.Item label={'Trigger'} name={['option', 'tooltip', 'trigger']}>
              <Select
                options={[
                  {label: 'Item', value: 'item'},
                  {label: 'Axis', value: 'axis'},
                  {label: 'None', value: 'none'},
                ]}
              />
            </Form.Item>
            <Form.Item label={'Pointer Type'} name={['option', 'tooltip', 'axisPointer', 'type']}>
              <Select
                options={[
                  {label: 'Cross', value: 'cross'},
                  {label: 'Line', value: 'line'},
                  {label: 'Shadow', value: 'shadow'},
                  {label: 'None', value: 'none'},
                ]}
              />
            </Form.Item>
          </>
        )}

        <Divider orientation={'left'} type={'horizontal'} plain>
          Toolbox
        </Divider>
        <Form.Item label={'Show'} name={['option', 'toolbox', 'show']} valuePropName={'checked'}>
          <Switch />
        </Form.Item>
        {show?.toolbox && (
          <>
            <Form.Item
              label={'Save Image'}
              name={['option', 'toolbox', 'feature', 'saveAsImage', 'show']}
              valuePropName={'checked'}
            >
              <Switch />
            </Form.Item>
            <Form.Item
              label={'Restore'}
              name={['option', 'toolbox', 'feature', 'restore', 'show']}
              valuePropName={'checked'}
            >
              <Switch />
            </Form.Item>
            <Form.Item
              label={'Data View'}
              name={['option', 'toolbox', 'feature', 'dataView', 'show']}
              valuePropName={'checked'}
            >
              <Switch />
            </Form.Item>
            <Form.Item label={'Orientation'} name={['option', 'toolbox', 'orient']}>
              <Select
                options={[
                  {label: 'Horizontal', value: 'horizontal'},
                  {label: 'Vertical', value: 'vertical'},
                ]}
              />
            </Form.Item>
          </>
        )}

        {/* Hidden fields */}
        <Form.Item hidden label={'Text Style'} name={['option', 'textStyle']}>
          <Input type={'hidden'} />
        </Form.Item>
        <Form.Item hidden label={'Animation'} name={['option', 'animation']}>
          <Input type={'hidden'} />
        </Form.Item>
      </Form>
    </Flex>
  );
};
