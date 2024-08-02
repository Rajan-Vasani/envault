import {useQueryClient} from '@tanstack/react-query';
import {App, Form, Input, Select, TreeSelect} from 'antd';
import {API_QUERY} from 'app/constant/query';
import {useNodeFilter, useNodeSaveMutation} from 'app/services/hooks/useNode';
import {useOwner} from 'app/services/hooks/useUser';
import {useEffect} from 'react';
import {useSearchParams} from 'react-router-dom';

export const DashboardInfo = props => {
  const {node, setForm, disabled} = props;
  const [searchParams] = useSearchParams();
  const _parent = searchParams.get('parent');
  const parent = _parent === 'null' ? null : _parent ? +_parent : null;
  const {data: ownerData} = useOwner();
  const queryClient = useQueryClient();
  const {data: dataSource = []} = useNodeFilter({filters: ['group']});
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
      form.setFieldsValue(node);
    }
  }, [node, form]);

  useEffect(() => {
    setForm(form);
  }, [form, setForm]);

  const onFinish = values => {
    message.info(`Saving your dashboard`);
    saveNode(
      {
        type: 'dashboard',
        data: values,
      },
      {
        onSuccess: () => {
          message.open({type: 'success', content: `Dashboard ${node?.id ? 'updated' : 'created'}`});
          queryClient.invalidateQueries({queryKey: [API_QUERY.NODE_DATA]});
        },
        onError: () => {
          message.open({type: 'error', content: `Could not ${node?.id ? 'update' : 'create'} dashboard`});
        },
      },
    );
  };

  return (
    <Form layout="vertical" name="form-dashboard" form={form} onFinish={onFinish} initialValues={{type: 'dashboard'}}>
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
