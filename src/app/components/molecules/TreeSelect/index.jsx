import {TreeSelect} from 'antd';
export const Component = props => {
  return (
    <TreeSelect
      treeDataSimpleMode={{
        id: 'id',
        pId: 'parent',
        rootPId: null,
      }}
      showSearch
      maxTagCount="{3}"
      fieldNames={{
        label: 'name',
        value: 'id',
      }}
      treeIcon
      treeLine={true}
      listHeight={500}
      treeNodeFilterProp={'name'}
      labelInValue={true}
      style={{width: '100%', marginBottom: '10px'}}
      {...props}
    />
  );
};
export default Component;
