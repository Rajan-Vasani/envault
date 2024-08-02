import {App, Form, Input, InputNumber, Select, TreeSelect} from 'antd';
import {useNodeFilter, useNodeSaveMutation} from 'hooks/useNode';
import {useNodeContext} from 'layouts/node/context';
import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {capitaliseString} from 'utils/string';

export const GroupInfo = props => {
  const {setForm, disabled} = props;
  const {node} = useNodeContext();
  const {data: dataSource = []} = useNodeFilter({filters: ['group']});
  const {mutate: saveNode, updateNode} = useNodeSaveMutation();
  const navigate = useNavigate();
  const {notification} = App.useApp();
  const [form] = Form.useForm();
  const geomType = Form.useWatch(['geom', 'type'], form);

  useEffect(() => setForm?.(form), [form, setForm]);
  useEffect(() => {
    if (!node) return;
    form.setFieldsValue(node);
  }, [node, form]);

  const onFinish = values => {
    if (['none', undefined, null].includes(values.geom.type)) {
      values.geom = null;
    }
    if (values.id === -1) {
      delete values.id;
    }
    notification.open({type: 'info', description: `Saving ${values.type}`});
    saveNode(
      {
        type: 'group',
        data: values,
      },
      {
        onSuccess: data => {
          notification.open({
            type: 'success',
            description: `${capitaliseString(values.type)} ${node?.id ? 'updated' : 'created'}`,
          });
          navigate(`${values.type}/${data[0].id}`);
        },
        onError: () => {
          notification.open({type: 'error', description: `Could not ${node?.id ? 'update' : 'create'} ${values.type}`});
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
      name="form-group"
      form={form}
      onFinish={onFinish}
      onValuesChange={onValuesChange}
      initialValues={{type: 'group'}}
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
          fieldNames={{value: 'id', label: 'name'}}
          showSearch
          treeLine={true}
          listHeight={500}
          treeNodeFilterProp="name"
          disabled={disabled}
        />
      </Form.Item>
      <Form.Item
        label={'Group Name'}
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
      <Form.Item label={'Geom Type'} name={['geom', 'type']} disabled={disabled}>
        <Select
          style={{width: '100%'}}
          disabled={disabled}
          options={[
            {label: 'None', value: 'none'},
            {label: 'Point', value: 'Point'},
            // {label: 'Polygon', value: 'Polygon'},
            // {label: 'Line String', value: 'LineString'},
          ]}
        />
      </Form.Item>
      {
        {
          Point: (
            <>
              <Form.Item label={'Lat'} name={['geom', 'coordinates', 0]}>
                <InputNumber style={{width: '100%'}} disabled={disabled} />
              </Form.Item>
              <Form.Item label={'Lon'} name={['geom', 'coordinates', 1]}>
                <InputNumber style={{width: '100%'}} disabled={disabled} />
              </Form.Item>
            </>
          ),
          Polygon: null,
          LineString: null,
        }[geomType]
      }
    </Form>
  );
};
