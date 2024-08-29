import {useQueryClient} from '@tanstack/react-query';
import {App, Button, Input, Space, TreeSelect} from 'antd';
import {API_QUERY} from 'app/constant/query';
import {useHub} from 'app/services/hooks/useHub';
import {useNode, useNodeSaveMutation} from 'app/services/hooks/useNode';
import {useState} from 'react';
import {capitaliseString} from 'utils/string';

export const NodeAddForm = props => {
  const {item, onCancel = () => {}, onChange} = props;
  const {message} = App.useApp();
  const {data: tree} = useNode();
  const {data: hub} = useHub();
  const {mutate: saveNode} = useNodeSaveMutation();
  const queryClient = useQueryClient();

  const [data, setData] = useState({});

  const handleNodeSave = () => {
    if (!data?.parent || !data?.name) {
      message.error(`Parent or name is missing`);
      return;
    }
    message.info(`Saving new ${item?.type}`);
    const dataNode = {
      hub: hub[0]?.id,
      type: item?.type,
      ...data,
    };
    saveNode(
      {type: item?.type, data: dataNode},
      {
        onSuccess: data => {
          onChange(data[0].id);
          message.success(`${capitaliseString(item?.type)} create success!`);
          queryClient.invalidateQueries({queryKey: API_QUERY.NODE});
          setTimeout(() => {
            onCancel();
          }, 800);
        },
      },
    );
  };
  const handleInputChange = e => {
    setData({...data, [e.target.name]: e.target.value});
  };

  return (
    <>
      <Space.Compact style={{width: '100%', marginBottom: '8px'}}>
        <TreeSelect
          name="parent"
          placeholder="Parent"
          treeData={tree}
          treeDataSimpleMode={{
            id: 'id',
            pId: 'parent',
            rootPId: null,
          }}
          showSearch
          fieldNames={{value: 'id', label: 'name'}}
          treeIcon
          treeLine={true}
          listHeight={500}
          treeNodeFilterProp="name"
          style={{textAlign: 'left', width: '50%'}}
          dropdownStyle={{minWidth: '200px'}}
          onChange={value => setData({...data, parent: value})}
        />
        <Input name="name" placeholder="Name" style={{width: '50%'}} onChange={handleInputChange} />
      </Space.Compact>
      <div style={{textAlign: 'center'}}>
        <Space>
          <Button type="primary" onClick={handleNodeSave}>
            Save
          </Button>
          <Button type="button" onClick={() => onCancel()}>
            Cancel
          </Button>
        </Space>
      </div>
    </>
  );
};
