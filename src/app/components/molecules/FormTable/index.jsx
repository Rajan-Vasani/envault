import {Button, Descriptions, Flex, Form, Popconfirm, Skeleton, Table, Tag} from 'antd';
import {createStyles, useResponsive} from 'antd-style';
import Icon from 'app/components/atoms/Icon';
import {useState} from 'react';

const EditableCell = props => {
  const {
    editing,
    editable,
    dataIndex,
    formItem,
    formItemProps,
    record,
    index,
    children,
    isTable = true,
    ...restProps
  } = props;
  const CellTag = isTable ? 'td' : 'div';
  return (
    <CellTag {...restProps} key={index}>
      {formItem && editable && editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0,
          }}
          {...formItemProps}
        >
          {formItem}
        </Form.Item>
      ) : (
        children
      )}
    </CellTag>
  );
};

const isCallable = (value, props) => {
  if (typeof value === 'function') {
    return value(props);
  }
  return value;
};
const useStyles = createStyles(({css, token}) => ({
  table: css`
    .ant-table-cell {
      color: ${token.colorTextBase};
    }
  `,
}));
export const FormTable = props => {
  const {
    columns,
    headerElements,
    dataSource,
    rowKey,
    expandable,
    loading,
    disabled,
    onDisabled,
    pagination,
    paginationText = 'Items',
    onPagination,
    newText = 'Add',
    onNew,
    onEdit,
    onSave,
    onCancel,
    onRemove,
  } = props;
  const form = Form.useFormInstance();
  const [editingKey, setEditingKey] = useState('');
  const isEditing = (record, key) => record === key;
  const responsive = useResponsive();
  const {styles} = useStyles();

  const triggerPagination = () => {
    onPagination?.();
  };
  const triggerDisabled = () => {
    onDisabled?.(disabled => !disabled);
  };
  const triggerNew = () => {
    form?.resetFields();
    const newRow = onNew?.();
    setEditingKey(rowKey(newRow));
  };
  const triggerEdit = record => {
    onEdit?.(record);
    form?.setFieldsValue(record);
    setEditingKey(rowKey(record));
  };
  const triggerSave = record => {
    const values = form.getFieldsValue();
    const update = {...record, ...values};
    onSave?.(update);
    form?.submit();
    setEditingKey(null);
  };
  const triggerCancel = record => {
    onCancel?.(record);
    setEditingKey(null);
  };
  const triggerRemove = record => {
    onRemove?.({record, saved: true});
  };

  const builtColumns = Object.entries(columns || {}).flatMap(([type, column]) => {
    const onCell = (record, column) => ({
      record,
      editing: isEditing(rowKey(record), editingKey),
      editable: isCallable(column.editable, record),
      formItem: column.formItem || undefined,
      formItemProps: column.formItemProps || {},
      dataIndex: column.dataIndex || column.key,
      title: column.title,
      hidden: column.hidden || false,
    });

    switch (type) {
      case 'actions':
        return [
          {
            title: column.title,
            dataIndex: column.dataIndex,
            key: column.key,
            render: (_, record) => {
              const editing = isEditing(rowKey(record), editingKey);
              const saved = !editing;
              return (
                <Flex justify={'flex-start'} align={'center'} gap={'small'} wrap>
                  {isCallable(column.actionItems, record)}
                  {column.editable && (
                    <>
                      {editing ? (
                        <>
                          <Button
                            key={'save'}
                            type={'primary'}
                            icon={<Icon icon={'SaveOutlined'} type={'ant'} />}
                            onClick={() => triggerSave(record)}
                          >
                            Save
                          </Button>
                          <Button
                            key={'cancel'}
                            icon={<Icon icon={'CloseOutlined'} type={'ant'} />}
                            onClick={() => triggerCancel(record)}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          key={'edit'}
                          disabled={disabled}
                          icon={<Icon icon={'EditOutlined'} type={'ant'} />}
                          onClick={() => triggerEdit(record)}
                        >
                          Edit
                        </Button>
                      )}
                      <Popconfirm
                        key={'popDelete'}
                        title="Confirm Delete"
                        description="This action is permanent, are you sure?"
                        onConfirm={() => triggerRemove(record)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button
                          key={'delete'}
                          disabled={disabled}
                          danger
                          icon={<Icon icon={'DeleteOutlined'} type={'ant'} />}
                        >
                          Delete
                        </Button>
                      </Popconfirm>
                      {!saved && (
                        <Tag
                          key={'tagSaved'}
                          color={'warning'}
                          icon={<Icon icon="ExclamationCircleOutlined" type="ant" />}
                        >
                          Not saved
                        </Tag>
                      )}
                    </>
                  )}
                </Flex>
              );
            },
          },
        ];
      default:
        return column.map(col => ({
          ...col,
          ...(col.sorter && {
            sorter: {
              compare: (a, b) => a[column.sortValue || col.key].localeCompare(b[column.sortValue || col.key]),
              multiple: col.sorter,
            },
          }),
          ...(col.filter && {
            filters: dataSource.map(data => ({text: data[col.key], value: data[col.key]})),
            onFilter: (value, record) => record.key.includes(value) === 0,
          }),
          ...(col.editable && {
            onCell: record => onCell(record, col),
          }),
        }));
    }
  });

  const components = {
    body: {
      cell: EditableCell,
    },
  };

  return (
    <Flex vertical gap={'small'}>
      <Flex gap={'small'} justify={'flex-start'} align={'center'}>
        {headerElements}
        <Button
          key={'new'}
          type={'primary'}
          onClick={() => triggerNew()}
          icon={<Icon icon={'PlusOutlined'} type={'ant'} />}
          disabled={disabled}
        >
          {newText}
        </Button>
        <Button
          key={'disabled'}
          onClick={triggerDisabled}
          icon={<Icon icon={disabled ? 'LockOutlined' : 'UnlockOutlined'} type={'ant'} />}
        />
      </Flex>
      {responsive.lg ? (
        <Table
          className={styles.table}
          columns={builtColumns}
          dataSource={dataSource}
          components={components}
          bordered={true}
          sticky={true}
          expandable={expandable}
          rowKey={rowKey}
          loading={loading}
          pagination={{
            position: ['bottomRight'],
            rowKey: rowKey,
            showSizeChanger: true,
            showQuickJumper: true,
            defaultPageSize: 20,
            defaultCurrent: 1,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} ${paginationText}`,
            onChange: () => triggerPagination(),
            ...pagination,
          }}
        />
      ) : loading ? (
        <Skeleton active />
      ) : (
        dataSource.map((record, recordIndex) => {
          return (
            <Descriptions
              key={recordIndex}
              size={'small'}
              column={{xs: 1, sm: 1, md: 1}}
              bordered
              items={builtColumns.map((column, columnIndex) => {
                const {key, render, title, dataIndex, formItem, formItemProps} = column;
                const editable = isCallable(column.editable, record);
                const cellProps = {title, dataIndex, editable, formItem, formItemProps, record};
                return {
                  key: columnIndex,
                  label: title,
                  span: 1,
                  children: (
                    <EditableCell
                      {...cellProps}
                      key={columnIndex}
                      index={columnIndex}
                      isTable={false}
                      editing={isEditing(rowKey(record), editingKey)}
                    >
                      {render ? render(record[key], record) : record[key]}
                    </EditableCell>
                  ),
                };
              })}
            />
          );
        })
      )}
    </Flex>
  );
};

export default FormTable;
