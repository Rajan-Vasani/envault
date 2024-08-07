import {QuestionCircleOutlined} from '@ant-design/icons';
import {Button, Checkbox, Form, Input, Select, Tooltip, TreeSelect} from 'antd';
import {createStyles} from 'antd-style';
import Icon from 'app/components/atoms/Icon';
import {useNodeFilter} from 'app/services/hooks/useNode';
import {useMemo, useState} from 'react';
import {ControlMappingInput} from './ControlMappingInput';
import {NodeAddForm} from './NodeAddForm';

const useStyles = createStyles(({css}) => ({
  propsInput: css`
    position: relative;
  `,
  addNode: css`
    position: absolute;
    right: 8px;
    top: 0;
    bottom: 0;
  `,
}));

const ActionLabel = ({label, description}) => {
  return (
    <>
      {label}
      {description ? (
        <Tooltip placement="top" title={description}>
          <QuestionCircleOutlined style={{paddingLeft: '16px'}} />
        </Tooltip>
      ) : null}
    </>
  );
};

export const ActionInput = props => {
  const {name, field, data, required} = props;
  const {data: tree = []} = useNodeFilter({filters: [field]});
  const [isCreate, setIsCreate] = useState(false);
  const styles = useStyles();

  const actionConfig = useMemo(() => {
    const {type, enum: options, description, format} = data;
    if (options) {
      return <Select showSearch options={options.map(option => ({label: option, value: option}))} />;
    }
    if (format === 'uuid') {
      return (
        <TreeSelect
          placeholder={field}
          treeData={tree.map(item => ({...item, label: `${item.name}(${item.id})`}))}
          showSearch
          fieldNames={{value: 'id'}}
          treeIcon
          treeLine={true}
          listHeight={500}
          treeNodeFilterProp="name"
          dropdownStyle={{minWidth: '200px'}}
        />
      );
    }
    switch (type) {
      case 'array':
        return <Select mode="tags" placeholder="Add multiple item" />;
      case 'string':
        return <Input disabled={data?.const} placeholder={description} />;
      case 'boolean':
        return <Checkbox />;
      default:
        return <Input />;
    }
  }, [data, tree, field]);

  const handleAdd = () => {
    if (isCreate) {
      setIsCreate(null);
    } else {
      setIsCreate({
        type: field,
      });
    }
  };
  const handleCancel = () => {
    setIsCreate(false);
  };

  if (data?.type === 'object') {
    if (data?.properties) {
      return (
        <>
          {data?.properties &&
            Object.keys(data.properties).map(key => {
              if (key === 'type') return null;
              return (
                <ActionInput
                  key={key}
                  name={[...name, key]}
                  field={key}
                  data={data.properties[key]}
                  required={data.required.includes(key)}
                />
              );
            })}
        </>
      );
    } else {
      return (
        <Form.Item
          name={name}
          label={<ActionLabel label={field} description={data?.description} />}
          rules={[{required: required}]}
          labelCol={{style: {width: 100}}}
        >
          <ControlMappingInput {...props} />
        </Form.Item>
      );
    }
  }

  if (['timelapse'].includes(field)) {
    return (
      <div className={styles.propsInput}>
        <Form.Item name={name} label={field} labelCol={{style: {width: 100}}} rules={[{required: required}]}>
          {isCreate ? <NodeAddForm item={isCreate} onCancel={handleCancel} /> : actionConfig}
        </Form.Item>
        <Button
          type="outlined"
          onClick={handleAdd}
          icon={<Icon icon={'PlusCircleOutlined'} type={'ant'} />}
          className={styles.addNode}
        />
      </div>
    );
  }

  return (
    <Form.Item name={name} label={field} labelCol={{style: {width: 100}}} rules={[{required: required}]}>
      {actionConfig}
    </Form.Item>
  );
};
