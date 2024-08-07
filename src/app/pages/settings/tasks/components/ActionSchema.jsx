import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {Collapse, Flex, Form, Select} from 'antd';
import {useSchema} from 'app/services/hooks/useSchema';
import Icon from 'components/atoms/Icon';
import {useEffect, useState} from 'react';
import {ActionInput} from './ActionInput';
import {DeviceInput} from './DeviceInput';
import TaskStepControl from './TaskStepControl';

export const ActionSchema = props => {
  const {formName, index, value, lable, onChange, remove} = props;
  const {data: schemaList = []} = useSchema();
  const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id: value.id});
  const [schema, setSchema] = useState(value?.type);
  const [schemaProperties, setSchemaProperties] = useState({});
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    if (schemaList.length > 0) {
      const schemaObject = schemaList.find(item => item.properties.type.const === schema);
      const {properties = {}, required = []} = schemaObject || {};
      const matchInitValue = {
        string: '',
        array: [],
        object: {},
      };
      const initSchemaValue = {};
      if (Object.keys(properties).length) {
        Object.keys(properties).map(key => {
          if (key === 'type') {
            initSchemaValue.type = properties?.type?.const;
          } else {
            initSchemaValue[key] = properties[key]?.default
              ? properties[key]?.default
              : matchInitValue[properties[key]?.type];
          }
        });
      }
      const {type, id, ...rest} = properties;

      setSchemaProperties({initValue: initSchemaValue, properties: rest, required});
    }
  }, [schemaList, schema]);

  const handleActionChange = value => {
    setSchema(value);
    onChange?.({type: value});
  };

  useEffect(() => {
    setSchema(value?.type);
  }, [value]);

  return (
    <Collapse
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      items={[
        {
          key: '1',
          label: lable || `Step ${index + 1} : ${value?.type}`,
          extra: (
            <Flex gap={'small'}>
              <Icon
                icon={'CloseOutlined'}
                type={'ant'}
                onClick={e => {
                  e.stopPropagation();
                  remove(index);
                }}
                style={{height: '22px'}}
              />
              <Icon icon={'HolderOutlined'} type={'ant'} style={{height: '22px'}} {...attributes} {...listeners} />
            </Flex>
          ),
          children: (
            <>
              <Form.Item label="Type" labelCol={{style: {width: 100}}} name={[index, 'type']}>
                <Select
                  placeholder="Please select an action"
                  style={{width: '100%'}}
                  onChange={handleActionChange}
                  options={schemaList.map(action => ({
                    value: action.properties.type.const,
                    label: action.properties.type.const,
                  }))}
                />
              </Form.Item>
              {schemaProperties?.properties &&
                Object.keys(schemaProperties.properties).map(key => {
                  if (key === 'type') return null;
                  if (key === 'actions')
                    return (
                      <Form.Item
                        label="actions"
                        labelCol={{style: {width: 100}}}
                        name={[index, 'actions']}
                        required={schemaProperties.required.includes(key)}
                        key={key}
                      >
                        <TaskStepControl name={['actions', index, 'actions']} />
                      </Form.Item>
                    );
                  if (key === 'device')
                    return (
                      <DeviceInput
                        key={key}
                        formName={formName}
                        name={[index, key]}
                        field={key}
                        data={schemaProperties.properties[key]}
                        required={schemaProperties.required.includes(key)}
                        valueType={schema === 'value-mapping' ? value?.valueType : null}
                      />
                    );
                  return (
                    <ActionInput
                      key={key}
                      name={[index, key]}
                      field={key}
                      data={schemaProperties.properties[key]}
                      required={schemaProperties.required.includes(key)}
                      valueType={schema === 'value-mapping' ? value?.valueType : null}
                    />
                  );
                })}
            </>
          ),
        },
      ]}
    />
  );
};
