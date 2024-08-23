import {App, Flex, Form, Input, Select, TreeSelect} from 'antd';
import {useNodeFilter, useNodeSaveMutation} from 'app/services/hooks/useNode';
import {useOwner} from 'app/services/hooks/useUser';
import Icon from 'components/atoms/Icon';
import {nodeDetails} from 'config/menu';
import {baseNodeAttrs} from 'layouts/node/config';
import {useNodeContext} from 'layouts/node/context';
import {useEffect} from 'react';
import {createSearchParams, generatePath, useNavigate} from 'react-router-dom';

const nodeTypeOptions = nodeDetails.map(node => ({
  value: node.value,
  label: (
    <Flex align={'center'} gap={'middle'}>
      <Icon {...node.icon} />
      {node.title}
    </Flex>
  ),
}));

export const NodeInfo = props => {
  const {setForm, disabled} = props;
  const {nodeAttrs} = useNodeContext();
  const {data: ownerData} = useOwner();
  const {data: dataSource = []} = useNodeFilter({filters: ['group']});
  const {mutate: saveNode, updateNode} = useNodeSaveMutation();
  const {notification} = App.useApp();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  useEffect(() => setForm?.(form), [form, setForm]);
  useEffect(() => {
    form.setFieldsValue(nodeAttrs);
  }, [nodeAttrs, form]);

  const onFinish = values => {
    notification.info({type: 'info', description: `Saving ${values.type}`});
    let {type, ...data} = values;
    if (data.id === -1) {
      delete data.id;
      data = {...baseNodeAttrs[type], ...data};
    }
    saveNode(
      {data, type},
      {
        onSuccess: (data, variables) => {
          if (!variables.data.id) {
            navigate({
              pathname: generatePath(':type/:id', {type, id: data[0].id}),
              search: createSearchParams({tab: 'config'}).toString(),
            });
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
      layout={'vertical'}
      name={'node-info'}
      form={form}
      onFinish={onFinish}
      onValuesChange={onValuesChange}
      disabled={disabled}
    >
      <Form.Item name={'id'} hidden>
        <Input />
      </Form.Item>
      <Form.Item
        label={'Type'}
        name={'type'}
        hidden={nodeAttrs.id !== -1}
        rules={[
          {required: true, message: 'Type is required'},
          {
            validator: async (rule, value) => {
              if (value && !nodeTypeOptions.some(option => option.value === value)) {
                throw new Error('Invalid type');
              }
            },
          },
        ]}
      >
        <Select options={nodeTypeOptions} />
      </Form.Item>
      <Form.Item label={'Parent'} name={'parent'}>
        <TreeSelect
          placeholder={'None'}
          allowClear={true}
          treeData={dataSource}
          treeDataSimpleMode={{pId: 'parent', id: 'id', rootPId: null}}
          fieldNames={{label: 'name', value: 'id'}}
          showSearch
          treeLine={true}
          listHeight={500}
          treeNodeFilterProp={'name'}
        />
      </Form.Item>
      <Form.Item
        label={'Name'}
        name={'name'}
        rules={[
          {
            required: true,
            message: 'Name is required',
          },
        ]}
      >
        <Input disabled={disabled} />
      </Form.Item>
      {nodeAttrs.type === 'task' && (
        <Form.Item label={'Owner'} name={'owner'} rules={[{required: true, message: 'Owner is required!'}]}>
          <Select placeholder={'Owner'} options={ownerData} fieldNames={{label: 'name', value: 'id'}} />
        </Form.Item>
      )}
    </Form>
  );
};
export default NodeInfo;
