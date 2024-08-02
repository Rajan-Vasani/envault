import {Form, Input} from 'antd';
import WidgetControl from 'pages/dashboard/widget';
import WidgetHeader from 'pages/dashboard/widget/header';
import {memo} from 'react';

const GridItem = memo(function GridItem({item, removeWidget}) {
  const [form] = Form.useForm();
  const type = Form.useWatch('type', {form, preserve: true});
  const {gridstack, ...rest} = item ?? {};

  return (
    <Form
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
      form={form}
      name={`formWidget-${item.id}`}
      initialValues={rest}
    >
      <Form.Item name="id" hidden>
        <Input type="text" />
      </Form.Item>
      <Form.Item name="widgetData" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="type" hidden>
        <Input />
      </Form.Item>
      {type && (
        <>
          <WidgetHeader removeWidget={() => removeWidget(item.id)} />
          <WidgetControl />
        </>
      )}
    </Form>
  );
});

export default GridItem;
