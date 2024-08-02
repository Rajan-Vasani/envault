import {App, Form, Input, Select, TreeSelect} from 'antd';
import {useNodeFilter, useNodeSaveMutation} from 'app/services/hooks/useNode';
import {useOwner} from 'app/services/hooks/useUser';
import {useNodeContext} from 'layouts/node/context';
import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';

export const ChartInfo = props => {
  const {setForm, disabled} = props;
  const {node} = useNodeContext();
  const {data: ownerData} = useOwner();
  const {data: dataSource = []} = useNodeFilter({filters: ['group']});
  const {mutate: saveNode, updateNode} = useNodeSaveMutation({type: node.type});
  const {notification} = App.useApp();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  useEffect(() => setForm?.(form), [form, setForm]);
  useEffect(() => {
    form.setFieldsValue(node);
  }, [node, form]);

  const onFinish = values => {
    notification.info({type: 'info', description: 'Saving your chart information'});
    if (values.id === -1) {
      delete values.id;
    }
    saveNode(
      {data: values},
      {
        onSuccess: (data, variables) => {
          if (!variables.data.id) {
            navigate(`../node/chart/${data[0].id}`); // can this just be ../chart/:id ?
          }
        },
      },
    );
  };

  const onValuesChange = (changedValues, allValues) => {
    updateNode(allValues);
  };

  return (
    <Form
      layout="vertical"
      name="chart-info"
      form={form}
      onFinish={onFinish}
      onValuesChange={onValuesChange}
      initialValues={{type: 'chart'}}
    >
      <Form.Item name="id" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="type" hidden>
        <Input />
      </Form.Item>
      <Form.Item label="Parent" name="parent">
        <TreeSelect
          placeholder="None"
          allowClear={true}
          treeData={dataSource}
          treeDataSimpleMode={{pId: 'parent', id: 'id', rootPId: null}}
          fieldNames={{label: 'name', value: 'id'}}
          showSearch
          treeLine={true}
          listHeight={500}
          treeNodeFilterProp="name"
          disabled={disabled}
        />
      </Form.Item>
      <Form.Item
        label={'Name'}
        name="name"
        rules={[
          {
            required: true,
            message: 'Name is required',
          },
        ]}
      >
        <Input disabled={disabled} />
      </Form.Item>
      <Form.Item label={'Owner'} name="owner" rules={[{required: true, message: 'Owner is required!'}]}>
        <Select placeholder="Owner" options={ownerData} fieldNames={{label: 'name', value: 'id'}} disabled={disabled} />
      </Form.Item>
    </Form>
  );
};
