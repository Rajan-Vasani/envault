import {App, Form} from 'antd';
import {useNodeSaveMutation} from 'hooks/useNode';
import {useNodeContext} from 'layouts/node/context';

export const SeriesConfig = props => {
  const {setForm, disabled} = props;
  const {eventState, handleStreamStateChange} = {eventstate: '', handleStreamStateChange: () => {}}; // temporary
  const {nodeAttrs, nodeParams, updateNodeParams} = useNodeContext();
  const [form] = Form.useForm();
  const {mutate: saveNode} = useNodeSaveMutation({type: nodeAttrs.type});
  const {notification} = App.useApp();
  return;
};
