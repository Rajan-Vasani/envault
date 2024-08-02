import {Form, Select} from 'antd';
import Icon from 'app/components/atoms/Icon';
import {useCallback, useContext, useEffect, useState} from 'react';
import {TreeContext} from 'snippets/stores/tree.store';
import './singleFilter.less';

const comparisonOptions = [
  {
    value: 'like',
    label: 'like',
  },
  {
    value: 'is',
    label: 'is',
  },
  {
    value: 'not',
    label: 'not',
  },
];

const relationOptions = [
  {
    value: 'and',
    label: 'AND',
  },
  {
    value: 'or',
    label: 'OR',
  },
];

const hiddenFields = ['hub', 'echart', 'meta', 'deleted', 'geom', 'id'];

const FilterKeyHandler = props => {
  const {name, assets, tree, onFieldChange, initFilter} = props;
  const [field, setField] = useState();
  const [fieldValue, setFieldValue] = useState([]);
  const [isFieldValueNested, setIsFieldValueNested] = useState(false);

  const typeOptions = Object.keys(assets)
    .map(field => {
      if (!hiddenFields.includes(field)) {
        return {
          value: field,
          label: field,
        };
      }
    })
    .filter(field => field);

  const valueOptions = fieldValue?.map(value => {
    switch (field) {
      case 'parent':
        return {
          value: value,
          label: tree.find(node => node.id === value)?.name,
        };
      default:
        return {
          value: value,
          label: value,
        };
    }
  });

  const handleNestedField = nestedField => {
    onFieldChange(`${field}.${nestedField}`);
  };

  const handleFieldChange = useCallback(
    field => {
      setField(field);
      setFieldValue(assets[field]);
      setIsFieldValueNested(assets[field].every(item => Array.isArray(item)));
      onFieldChange(field);
    },
    [assets, onFieldChange],
  );

  useEffect(() => {
    if (initFilter) {
      handleFieldChange('type');
    }
  }, [handleFieldChange, initFilter]);

  return (
    <>
      <Select
        options={typeOptions}
        placeholder="field"
        suffixIcon={null}
        allowClear={false}
        dropdownMatchSelectWidth={false}
        placement={'bottomLeft'}
        style={{
          borderRadius: 4,
          backgroundColor: '#C1D7E9',
          width: 'auto',
        }}
        popupClassName="envault-style-select-dropdown"
        className="envault-style-select"
        optionLabelProp="label"
        onChange={handleFieldChange}
        {...(initFilter ? {value: 'type'} : {value: field})}
      />
      {!isFieldValueNested && (
        <>
          <Form.Item name={[name, 'condition']}>
            <Select
              options={comparisonOptions}
              placeholder="operator"
              suffixIcon={null}
              allowClear={false}
              dropdownMatchSelectWidth={false}
              placement={'bottomLeft'}
              style={{
                borderRadius: 4,
                backgroundColor: '#CEEACE',
                width: 'auto',
              }}
              popupClassName="envault-style-select-dropdown"
              className="envault-style-select"
            />
          </Form.Item>
          <Form.Item name={[name, 'value']} style={{flex: 'auto'}}>
            <Select
              options={valueOptions}
              mode="tags"
              allowClear
              dropdownMatchSelectWidth={false}
              placement={'bottomLeft'}
              style={{
                minWidth: 200,
              }}
              placeholder="value"
              maxTagCount={'responsive'}
            ></Select>
          </Form.Item>
        </>
      )}
      {isFieldValueNested && <FilterKeyHandler assets={fieldValue} name={name} onFieldChange={handleNestedField} />}
    </>
  );
};

const SingleFilter = props => {
  const {name, remove, item, form} = props;
  const {
    treeState: {searchTree, filterOptions},
    treeDispatch,
  } = useContext(TreeContext);

  const removeItem = () => {
    remove(item.id);
  };

  const handleFieldName = fname => {
    const filterValue = form.getFieldValue('filter');
    const {filterItem} = filterValue;
    Object.assign(filterItem[name], {key: fname});
    form?.setFieldsValue({...filterValue, filterItem});
    treeDispatch({
      type: 'SET_FILTERS',
      payload: {...filterValue, filterItem},
    });
  };

  const firstFilterItem = form.getFieldValue('filter').filterItem[0];

  return (
    <div className="envault-input-filter">
      <div className="envault-input-filter-single">
        <Form.Item name={[name, 'relation']}>
          <Select
            options={relationOptions}
            placeholder="relation"
            suffixIcon={null}
            allowClear={false}
            style={{
              borderRadius: 4,
              backgroundColor: '#C1D7E9',
              width: 'auto',
            }}
            popupClassName="envault-style-select-dropdown"
            className="envault-style-select"
            optionLabelProp="label"
          />
        </Form.Item>
        <FilterKeyHandler
          assets={filterOptions}
          tree={searchTree}
          name={name}
          onFieldChange={handleFieldName}
          initFilter={firstFilterItem.key === 'initial'}
        />
      </div>
      <Icon
        icon="CloseCircleOutlined"
        type={'ant'}
        className="dynamic-delete-button"
        onClick={removeItem}
        style={{
          paddingLeft: '10px',
          display: 'block',
          textAlign: 'center',
          color: '#FF4D38',
        }}
      />
    </div>
  );
};

export default SingleFilter;
