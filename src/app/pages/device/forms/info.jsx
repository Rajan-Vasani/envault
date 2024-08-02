import {useQueryClient} from '@tanstack/react-query';
import {App, Form, Input, TreeSelect} from 'antd';
import {API_QUERY} from 'constant/query';
import {useNodeFilter, useNodeSaveMutation} from 'hooks/useNode';
import {useEffect} from 'react';
import {useSearchParams} from 'react-router-dom';

export const DeviceInfo = props => {
  const {form, disabled, data} = props;
  const [searchParams] = useSearchParams();
  const _parent = searchParams.get('parent');
  const parent = _parent === 'null' ? null : _parent ? +_parent : null;
  const queryClient = useQueryClient();
  const {data: dataSource = []} = useNodeFilter({filters: ['group']});
  const {mutate: saveNode} = useNodeSaveMutation();
  const {message} = App.useApp();

  useEffect(() => {
    if (parent) {
      form.resetFields();
      form.setFieldsValue({parent});
    }
  }, [parent, form]);

  useEffect(() => {
    if (data) {
      form.setFieldsValue(data);
    }
  }, [data, form]);

  const onFinish = values => {
    message.info(`Saving your device`);
    saveNode(
      {
        type: 'device',
        data: values,
      },
      {
        onSuccess: () => {
          message.open({type: 'success', content: `Device ${data?.id ? 'updated' : 'created'}`});
          queryClient.invalidateQueries({queryKey: [API_QUERY.NODE_DATA]});
        },
        onError: () => {
          message.open({type: 'error', content: `Could not ${data?.id ? 'update' : 'create'} device`});
        },
      },
    );
  };

  return (
    <Form layout="vertical" name="form-device" form={form} onFinish={onFinish} initialValues={{type: 'device'}}>
      <Form.Item name="id" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="type" hidden>
        <Input />
      </Form.Item>
      <Form.Item label="Parent" name="parent" initialValue={null}>
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
    </Form>
  );
};
