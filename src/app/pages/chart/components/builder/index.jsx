import {Divider, Form, Input, Radio, Select, Space} from 'antd';

const coordinateSystemOption = [
  {
    value: 'polar',
    label: 'polar',
  },
  {
    value: 'cartesian2d',
    label: 'cartesian2d',
  },
  {
    value: '',
    label: 'Default',
  },
];
export const ChartBuilder = props => {
  const {index, isGlobal, config} = props;
  const form = Form.useFormInstance();
  const coordinateSystem = Form.useWatch('coordinateSystem', {form, preserve: true});
  // const handleColorChange = color => {
  //   setUserConfig({...config, [series.id]: {...config[series.id], color: color}});
  //   form.setFieldsValue({color: color});
  // };

  return (
    <Space direction={'vertical'} size={2} style={{display: 'flex', justifyContent: 'start'}}>
      {config?.option.series[index]?.type === 'gauge' || config?.type === 'gauge' ? (
        <>
          <Divider orientation={'left'} type={'horizontal'} plain>
            Gauge Settings
          </Divider>
          <Form.Item label={'Max value'} name={['gauge', 'max']}>
            <Input type="number" />
          </Form.Item>
          <Form.Item label={'Min value'} name={['gauge', 'min']}>
            <Input type="number" />
          </Form.Item>
        </>
      ) : (
        <>
          <Divider orientation={'left'} type={'horizontal'} plain>
            y-axis
          </Divider>
          <Space align={'baseline'} style={{display: 'flex', justifyContent: 'space-between'}}>
            <span>Position</span>
            <Form.Item name={[index, 'yposition']}>
              <Radio.Group buttonStyle="solid" name="yposition" size={'middle'}>
                <Radio.Button value="left" style={{width: 60}}>
                  Left
                </Radio.Button>
                <Radio.Button value="right" style={{width: 60}}>
                  Right
                </Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Space>
          <Space align={'baseline'} style={{display: 'flex', justifyContent: 'space-between'}}>
            <span>Unit</span>
            <Form.Item name={[index, 'unit']}>
              <Radio.Group buttonStyle="solid" name="unit" size={'middle'}>
                <Radio.Button value={false} style={{width: 60}}>
                  No
                </Radio.Button>
                <Radio.Button value={true} style={{width: 60}}>
                  Yes
                </Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Space>
          <Space align={'baseline'} style={{display: 'flex', justifyContent: 'space-between'}}>
            <span>Invert</span>
            <Form.Item name={[index, 'invert']}>
              <Radio.Group buttonStyle="solid" name="invert" size={'middle'}>
                <Radio.Button value={false} style={{width: 60}}>
                  No
                </Radio.Button>
                <Radio.Button value={true} style={{width: 60}}>
                  Yes
                </Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Space>
        </>
      )}
      {isGlobal && !['gauge', 'radar'].includes(config?.type) ? (
        <>
          <Divider orientation={'left'} type={'horizontal'} plain>
            coordinateSystem
          </Divider>
          <Form.Item name="coordinateSystem">
            <Select placeholder="coordinateSystem" options={coordinateSystemOption} />
          </Form.Item>
          {coordinateSystem === 'polar' && (
            <>
              <Divider orientation={'center'} type={'horizontal'} plain>
                radiusAxis
              </Divider>
              <Form.Item name={['radiusAxis', 'min']} label="min">
                <Input placeholder="min" />
              </Form.Item>
              <Form.Item name={['radiusAxis', 'max']} label="max">
                <Input placeholder="max" />
              </Form.Item>
              <Divider orientation={'center'} type={'horizontal'} plain>
                angleAxis
              </Divider>
              <Form.Item name={['angleAxis', 'min']} label="min">
                <Input placeholder="min" />
              </Form.Item>
              <Form.Item name={['angleAxis', 'max']} label="max">
                <Input placeholder="max" />
              </Form.Item>
              <Form.Item name={['angleAxis', 'startAngle']} label="startAngle">
                <Input placeholder="startAngle" />
              </Form.Item>
            </>
          )}
          {coordinateSystem === 'cartesian2d' && (
            <>
              <Divider orientation={'center'} type={'horizontal'} plain>
                xAxis
              </Divider>
              <Form.Item name={['xAxis', 'min']} label="min">
                <Input placeholder="min" />
              </Form.Item>
              <Form.Item name={['xAxis', 'max']} label="max">
                <Input placeholder="max" />
              </Form.Item>
              <Divider orientation={'center'} type={'horizontal'} plain>
                yAxis
              </Divider>
              <Form.Item name={['yAxis', 'min']} label="min">
                <Input placeholder="min" />
              </Form.Item>
              <Form.Item name={['yAxis', 'max']} label="max">
                <Input placeholder="max" />
              </Form.Item>
            </>
          )}
        </>
      ) : null}
      {/* <ColorPicker
          name={'color'}
          label={'Color'}
          onColorChange={handleColorChange}
          circlePickerWidth={'initial'}
          initValue={config[series.id]?.color}
        /> */}
    </Space>
    // </Form>
  );
};
export default ChartBuilder;
