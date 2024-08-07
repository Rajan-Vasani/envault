import {App, Button, Input, Select, Space} from 'antd';
import {createStyles} from 'antd-style';
import Icon from 'app/components/atoms/Icon';
import {useNodeFilter} from 'app/services/hooks/useNode';
import {useEffect, useState} from 'react';
import {v4 as uuidv4} from 'uuid';
import {NodeAddForm} from './NodeAddForm';

const useStyles = createStyles(({css}) => ({
  keyInput: css`
    flex: 0 0 35%;
    width: 35%;
  `,
  valueInput: css`
    flex: 0 0 60%;
    width: 60%;
    max-width: 60%;
  `,
  addNode: css`
    flex: 1 1 5%;
    justify-content: center;
  `,
  wrapper: css`
    margin-bottom: 8px;
    position: relative;
    align-items: start;
    text-align: center;
  `,
  removeButton: css`
    position: absolute;
    left: 100%;
    top: 0;
    bottom: 0;
  `,
}));

const SingleMappingInput = ({initValue = {}, onChange, id, valueType}) => {
  const {message} = App.useApp();
  const {data = []} = useNodeFilter({filters: [valueType]});
  const [key, setKey] = useState(Object.keys(initValue)[0]);
  const [value, setValue] = useState(initValue[Object.keys(initValue)[0]]);
  const [isCreate, setIsCreate] = useState(null);
  const {styles} = useStyles();

  const triggerChange = changedValue => {
    onChange?.({changedValue, id});
  };

  const onKeyChange = e => {
    const newKey = String(e.target.value);
    setKey(newKey);
    triggerChange({[newKey]: value});
  };
  const onValueChange = newValue => {
    setValue(newValue);
    triggerChange({[key]: newValue});
  };

  const handleCreateNewNode = value => {
    setValue(value);
    triggerChange({[key]: value});
  };

  const handleAddNode = () => {
    if (!valueType) {
      message.error('Please select the valueType!');
    } else {
      setIsCreate({type: valueType});
    }
  };

  useEffect(() => {
    if (isCreate) {
      setIsCreate({...isCreate, type: valueType});
    }
  }, [valueType]);

  return (
    <>
      <Input type="text" value={key} onChange={onKeyChange} className={styles.keyInput} />
      {isCreate ? (
        <NodeAddForm item={isCreate} onCancel={() => setIsCreate(null)} onChange={handleCreateNewNode} />
      ) : (
        <>
          {data.length ? (
            <Select
              allowClear
              options={data.map(item => ({...item, label: `${item.name}(${item.id})`}))}
              fieldNames={{value: 'id'}}
              size="default"
              onChange={onValueChange}
              className={styles.valueInput}
              value={value}
            />
          ) : (
            <Input
              type="text"
              value={value}
              onChange={e => onValueChange(String(e.target.value))}
              className={styles.valueInput}
            />
          )}
          <Button
            type="outlined"
            icon={<Icon icon={'PlusOutlined'} type={'ant'} color="white" />}
            className={styles.addNode}
            onClick={handleAddNode}
          />
        </>
      )}
    </>
  );
};

export const ControlMappingInput = props => {
  const {value = {}, onChange, valueType} = props;
  const {styles} = useStyles();
  const [mapping, setMapping] = useState(
    Object.keys(value).length ? Object.keys(value).map(key => ({[key]: value[key], id: uuidv4()})) : [],
  );
  const getMapping = array => {
    return array.reduce((acc, cur) => {
      const {id, ...rest} = cur;
      return {...acc, ...rest};
    }, {});
  };
  const handleSingleChange = updateValue => {
    const {changedValue, id} = updateValue;
    const newMap = mapping.map(item => {
      if (item.id === id) {
        return {...changedValue, id: item.id};
      } else {
        return item;
      }
    });
    setMapping(newMap);
    onChange?.(getMapping(newMap));
  };

  const removeMapping = id => {
    const updateMapping = mapping.filter(item => item.id !== id);
    setMapping(updateMapping);
    onChange?.(getMapping(updateMapping));
  };

  return (
    <>
      {mapping.map(({id, ...rest}, index) => (
        <Space.Compact align="baseline" block key={id} className={styles.wrapper}>
          <SingleMappingInput key={id} initValue={rest} id={id} onChange={handleSingleChange} valueType={valueType} />
          <Button
            type="outlined"
            icon={<Icon icon={'CloseOutlined'} type={'ant'} />}
            className={styles.removeButton}
            onClick={() => removeMapping(id)}
          />
        </Space.Compact>
      ))}
      <Button type="dashed" onClick={() => setMapping([...mapping, {id: uuidv4()}])} block>
        + Add Mapping
      </Button>
    </>
  );
};
