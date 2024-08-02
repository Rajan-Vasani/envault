import {useQueryClient} from '@tanstack/react-query';
import {App, Form, Input, Select, TreeSelect} from 'antd';
import {API_QUERY} from 'app/constant/query';
import {useNodeFilter, useNodeSaveMutation} from 'app/services/hooks/useNode';
import {useEffect} from 'react';
import {useSearchParams} from 'react-router-dom';

export const SeriesInfo = props => {
  const {setForm, disabled, node} = props;
  const [searchParams] = useSearchParams();
  const _parent = searchParams.get('parent');
  const parent = _parent === 'null' ? null : _parent ? +_parent : null;
  const {data: variableData = []} = useNodeFilter({filters: ['variable']});
  const {data: dataSource = []} = useNodeFilter({filters: ['group']});
  const queryClient = useQueryClient();
  const {mutate: saveNode} = useNodeSaveMutation();
  const {message} = App.useApp();
  const [form] = Form.useForm();

  useEffect(() => {
    if (parent) {
      form.resetFields();
      form.setFieldsValue({parent});
    }
  }, [parent, form]);

  useEffect(() => {
    if (node) {
      const {variable, ...rest} = node;
      form.setFieldsValue({...rest, variable: variable?.id});
    }
  }, [node, form]);

  useEffect(() => {
    setForm(form);
  }, [form, setForm]);

  const onFinish = values => {
    message.info(`Saving your series`);
    saveNode(
      {
        type: 'series',
        data: values,
      },
      {
        onSuccess: () => {
          message.open({type: 'success', content: `Series ${node?.id ? 'updated' : 'created'}`});
          queryClient.invalidateQueries({queryKey: [API_QUERY.NODE_DATA]});
        },
        onError: () => {
          message.open({type: 'error', content: `Could not ${node?.id ? 'update' : 'create'} series`});
        },
      },
    );
  };

  return (
    <Form layout="vertical" name="form-series" form={form} onFinish={onFinish} initialValues={{type: 'series'}}>
      <Form.Item name="type" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="id" hidden>
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
        label="Name"
        name="name"
        rules={[
          {
            required: true,
            message: 'Please name the series',
          },
        ]}
      >
        <Input placeholder="Series Name" disabled={disabled} />
      </Form.Item>
      <Form.Item
        label="Variable"
        name="variable"
        rules={[
          {
            required: true,
            message: 'Variable is required!',
          },
        ]}
      >
        <Select
          options={variableData.map(variable => ({value: variable.id, label: variable.name}))}
          disabled={disabled}
        />
      </Form.Item>
    </Form>
  );
};
