import {Button, Input, Row, Space, Table} from 'antd';
import Icon from 'app/components/atoms/Icon';
const {Search} = Input;

const FormTable = props => {
  // Data
  const {columns, dataSource, rowKey, expandable, disabled, setDisabled, pagination, loading} = props;

  function columnBuilder(columnData) {
    const builtColumns = [];
    if (columnData?.minimisedColumn) {
      builtColumns.push({
        title: columnData.minimisedColumn.title,
        responsive: ['xs'],
        sorter: {
          compare: (a, b) =>
            a[columnData.minimisedColumn.sortValue].localeCompare(b[columnData.minimisedColumn.sortValue]),
          multiple: 1,
        },
        render: columnData.minimisedColumn.render,
      });
    }
    columnData?.baseColumns?.forEach(column => {
      builtColumns.push({
        ...column,
        responsive: ['sm'],
        ...(column.sorter && {
          sorter: {
            compare: (a, b) => a[column.key].localeCompare(b[column.key]),
            multiple: column.sorter,
          },
        }),
        ...(column.filters && {
          onFilter: (value, record) => record.role.indexOf(value) === 0,
        }),
      });
    });
    if (columnData?.actionColumn) {
      const column = columnData.actionColumn;
      builtColumns.push({
        ...column,
      });
    }
    return builtColumns;
  }

  const builtColumns = columnBuilder(columns);

  const {additionalButtons} = props;

  // Functions
  const {onClick, onSearch} = props;
  // Text
  const searchText = props.searchText ?? 'Input search text';
  const buttonText = props.buttonText ?? 'Add';
  const paginationText = props.paginationText ?? 'Items';

  const handleDisabled = () => {
    setDisabled(disabled => !disabled);
  };

  return (
    <>
      <Row>
        <Space>
          <Search placeholder={searchText} onSearch={onSearch} enterButton allowClear />
          {onClick && (
            <Button
              disabled={disabled}
              type="primary"
              onClick={onClick}
              icon={<Icon icon={'PlusOutlined'} type={'ant'} />}
            >
              {buttonText}
            </Button>
          )}
          <Button
            onClick={handleDisabled}
            icon={<Icon icon={disabled ? 'LockOutlined' : 'UnlockOutlined'} type={'ant'} />}
          />
          {additionalButtons}
        </Space>
      </Row>
      <Table
        columns={builtColumns}
        dataSource={dataSource}
        bordered={true}
        sticky={true}
        expandable={expandable}
        rowKey={rowKey}
        loading={loading}
        pagination={{
          position: ['topRight', 'bottomRight'],
          rowKey: 'id',
          showSizeChanger: true,
          showQuickJumper: true,
          defaultPageSize: 20,
          defaultCurrent: 1,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} ${paginationText}`,
          ...pagination,
        }}
      />
    </>
  );
};

export default FormTable;
