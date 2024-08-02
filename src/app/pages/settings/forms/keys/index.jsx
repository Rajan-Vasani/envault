import {useQueryClient} from '@tanstack/react-query';
import {App, Button, Descriptions, Drawer, Popconfirm, Space, Typography} from 'antd';
import {createStyles} from 'antd-style';
import ErrorBoundary from 'components/error/boundary';
import {API_QUERY} from 'constant/query';
import {useHubKey, useRoleKeyDeleteMutation} from 'hooks/useKeys';
import {useRoleHub} from 'hooks/useRole';
import {useEffect, useState} from 'react';
import FormTable from '../formTable';
import KeyUpdate from './keyUpdate';
const {Text} = Typography;

const useStyles = createStyles(({css, token}) => ({
  drawer: css`
    .ant-drawer-header-title {
      justify-content: end;
      flex-direction: row-reverse;
    }
  `,
}));

export const Component = props => {
  const [disabled, setDisabled] = useState(true);
  const {data: keyData, isFetched: isKeysFetched, isPending} = useHubKey({hub: globalThis.envault.hub});
  const [dataSource, setDataSource] = useState([]);
  const {data: roleData, isFetched: isRoleFetched} = useRoleHub({hub: globalThis.envault.hub});
  const isFetched = isKeysFetched && isRoleFetched;
  const {mutate: deleteKey} = useRoleKeyDeleteMutation();
  const {message} = App.useApp();
  const queryClient = useQueryClient();
  const [key, setKey] = useState(false);
  const {styles} = useStyles();

  useEffect(() => {
    function importKeyData(keyData) {
      const role = roleData.find(role => role.id === keyData.role);
      return {...keyData, role: role.name, id: role.id};
    }

    if (isFetched && keyData && roleData) {
      setDataSource(keyData.map(importKeyData));
    }
  }, [isFetched, keyData, roleData]);

  function addRow() {
    setKey({hub: globalThis.envault.hub, description: null, id: null, role: null, key: null});
  }

  function createFilterFromData(data, textName, valueName) {
    return {
      text: data[textName],
      value: data[valueName],
    };
  }

  function deleteButton(key, role) {
    message.open({type: 'infor', content: 'Deleting key...'});
    const delKey = {
      hub: globalThis.envault.hub,
      role: role,
      key: key,
    };
    deleteKey(
      {...delKey},
      {
        onSuccess: () => {
          message.open({type: 'success', content: 'Key deleted'});
          queryClient.invalidateQueries({queryKey: [API_QUERY.GET_HUB_API_KEY, globalThis.envault.hub]});
          queryClient.invalidateQueries({queryKey: [API_QUERY.GET_ROLE_HUB, globalThis.envault.hub]});
        },
        onError: () => {
          message.open({type: 'error', content: 'Could not delete key'});
        },
        onSettled: () => {
          setKey(false);
        },
      },
    );
  }

  function onSearch(value) {
    setDataSource(keyData.filter(key => key.description.includes(value)));
  }

  const roleFilter = isFetched ? roleData?.map(data => createFilterFromData(data, 'name', 'name')) : [];

  const columnsMinimised = {
    minimisedColumn: {
      title: 'Description, Role, API Key',
      sortValue: 'description',
      render: record => (
        <Descriptions
          column={1}
          size={'small'}
          layout={'vertical'}
          items={[
            {
              label: 'Role',
              children: record.role,
            },
            {
              label: 'Description',
              children: record.description,
            },
            {
              label: 'Actor',
              children: <Text copyable>{record.id}</Text>,
            },
            {
              label: 'Key',
              children: <Text copyable>{record.key}</Text>,
            },
          ]}
        />
      ),
    },
    baseColumns: [
      {
        title: 'Role',
        key: 'role',
        defaultSortOrder: 'ascend',
        dataIndex: 'role',
        render: role => <Text>{role}</Text>,
        sorter: 1,
        width: '15%',
      },
      {
        title: 'Description',
        key: 'description',
        defaultSortOrder: 'ascend',
        render: record => <Text>{record.description}</Text>,
        sorter: 2,
        width: '25%',
      },
      {
        title: 'Credentials',
        key: 'key',
        width: '45%',
        render: record => (
          <Descriptions
            column={1}
            size={'small'}
            items={[
              {
                label: 'Actor',
                children: <Text copyable>{record.id}</Text>,
              },
              {
                label: 'Key',
                children: <Text copyable>{record.key}</Text>,
              },
            ]}
          />
        ),
      },
    ],
    actionColumn: {
      title: 'Actions',
      key: 'action',
      dataIndex: 'action',
      render: (_, record) => (
        <Space style={{flexWrap: 'wrap'}}>
          <Popconfirm
            title="Are you sure?"
            description="This action is not reversable"
            onConfirm={() => deleteButton(record.key, record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button disabled={disabled} danger>
              Delete
            </Button>
          </Popconfirm>
          <Button disabled={disabled} onClick={() => setKey(record)}>
            Edit
          </Button>
        </Space>
      ),
    },
  };

  return (
    <ErrorBoundary>
      <FormTable
        columns={columnsMinimised}
        dataSource={dataSource}
        rowKey="key"
        paginationText="Keys"
        disabled={disabled}
        setDisabled={setDisabled}
        onClick={() => addRow()}
        onSearch={onSearch}
        loading={isPending}
      />
      <Drawer
        className={styles.drawer}
        getContainer={false}
        placement={'bottom'}
        open={key}
        key={'bottom'}
        onClose={() => setKey(false)}
        size={'large'}
        styles={{header: {textAlign: 'center'}, body: {width: '100%'}}}
        height={'100%'}
        destroyOnClose={true}
        title={key?.id ? 'Edit Key' : 'Add Key'}
      >
        <KeyUpdate
          hubId={globalThis.envault.hub}
          keyDetails={key}
          setKey={setKey}
          roleData={roleData}
          isEdit={!disabled}
        />
      </Drawer>
    </ErrorBoundary>
  );
};
Component.displayName = 'KeyManagement';
