import {useQueryClient} from '@tanstack/react-query';
import {App, Form, Input, TreeSelect} from 'antd';
import {API_QUERY} from 'app/constant/query';
import {useNodeFilter, useNodeSaveMutation} from 'app/services/hooks/useNode';
import {useEffect} from 'react';
import {useSearchParams} from 'react-router-dom';

export const NotificationInfo = props => {
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
    message.info(`Saving your notification`);
    saveNode(
      {
        type: 'notification',
        data: values,
      },
      {
        onSuccess: () => {
          message.open({type: 'success', content: `Notification ${data?.id ? 'updated' : 'created'}`});
          queryClient.invalidateQueries({queryKey: [API_QUERY.NODE_DATA]});
        },
        onError: () => {
          message.open({type: 'error', content: `Could not ${data?.id ? 'update' : 'create'} notification`});
        },
      },
    );
  };

  return (
    <Form
      layout="vertical"
      name="form-notification"
      form={form}
      onFinish={onFinish}
      initialValues={{type: 'notification'}}
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
    </Form>
  );
};
