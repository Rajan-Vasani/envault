import {Form, Input} from 'antd';
const {TextArea} = Input;

function TextControl(props) {
  const form = Form.useFormInstance();

  return (
    <Form.Item name={['widgetData', 'textContent']} className="ha-100" noStyle>
      <TextArea style={{height: '100%'}} placeholder="Widget text content" onBlur={() => form.validateFields()} />
    </Form.Item>
  );
}
export default TextControl;
