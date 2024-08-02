import {Form} from 'antd';
import ChartControl from 'pages/chart/widget';
import GalleryControl from 'pages/gallery/widget';
import MapControl from 'pages/map/widget';
import TextControl from './text';

function WidgetControl() {
  const form = Form.useFormInstance();
  const type = Form.useWatch('type', {form, preserve: true});
  const widgetData = form.getFieldsValue();
  switch (type) {
    case 'chart':
      return <ChartControl widget={widgetData} />;
    case 'gallery':
      return <GalleryControl widget={widgetData} />;
    case 'map':
      return <MapControl widget={widgetData} />;
    case 'text':
      return <TextControl widget={widgetData} />;
    default:
      return 'Widget for this node is missing!';
  }
}

export default WidgetControl;
