import {useQueryClient} from '@tanstack/react-query';
import {App, Button, Dropdown, Form, Input, Space, Tree} from 'antd';
import {createStyles} from 'antd-style';
import Icon from 'components/atoms/Icon';
import ErrorBoundary from 'components/error/boundary';
import FormTable from 'components/molecules/FormTable';
import {nodeDetails} from 'config/menu';
import {API_QUERY} from 'constant/query';
import {useNode, useNodeACLDeleteMutation, useNodeACLPutMutation, useRoleACLList} from 'hooks/useNode';
import {useRoleDeleteMutation, useRolePutMutation} from 'hooks/useRole';
import {NodeItem} from 'layouts/explore/components/sider';
import {isEqual, isMatch} from 'lodash';
import {useEffect, useMemo, useState} from 'react';
import {arrayToTree, findAncestors} from 'utils/tree';

const getKeyByValue = (object, value) => {
  return Object.keys(object).find(key => object[key] === value);
};

const TreeItem = props => {
  const {node, acl, expanded, onActionClick, onIconClick, disabled} = props;
  const nodeInfo = nodeDetails.find(x => x.value === node.type);
  const icon = expanded ? nodeInfo.iconAlt : nodeInfo.icon;

  const triggerActionClick = e => {
    onActionClick?.(e);
  };

  const triggerIconClick = e => {
    e.stopPropagation();
    onIconClick?.(node.id);
  };

  const items = [
    {
      key: 'allow',
      label: 'Allow',
      icon: <Icon icon="CheckCircleOutlined" type={'ant'} />,
    },
    {
      key: 'deny',
      label: 'Deny',
      icon: <Icon icon="CloseCircleOutlined" type={'ant'} />,
    },
    {
      key: 'inherit',
      label: 'Inherit',
      icon: <Icon icon="DownCircleOutlined" type={'ant'} />,
    },
  ];
  const permissions = {
    allow: true,
    deny: false,
    inherit: null,
  };
  return (
    <NodeItem
      key={node.id}
      name={node.name}
      icon={<Icon {...icon} />}
      onIconClick={triggerIconClick}
      actions={[
        <Space.Compact key={1} style={{width: '100%', justifyContent: 'flex-end'}}>
          <Dropdown
            menu={{
              items,
              onClick: e => triggerActionClick({node: node.id, create: permissions[e.key]}),
              selectedKeys: getKeyByValue(permissions, acl.create),
            }}
            trigger={['click']}
            disabled={disabled}
          >
            <Button danger={acl.create === false} type={acl.create == null ? 'default' : 'primary'}>
              Create
            </Button>
          </Dropdown>
          <Dropdown
            menu={{
              items,
              onClick: e => triggerActionClick({node: node.id, read: permissions[e.key]}),
              selectedKeys: getKeyByValue(permissions, acl.read),
            }}
            trigger={['click']}
            disabled={disabled}
          >
            <Button danger={acl.read === false} type={acl.read == null ? 'default' : 'primary'}>
              Read
            </Button>
          </Dropdown>
          <Dropdown
            menu={{
              items,
              onClick: e => triggerActionClick({node: node.id, update: permissions[e.key]}),
              selectedKeys: getKeyByValue(permissions, acl.update),
            }}
            trigger={['click']}
            disabled={disabled}
          >
            <Button danger={acl.update === false} type={acl.update == null ? 'default' : 'primary'}>
              Update
            </Button>
          </Dropdown>
          <Dropdown
            menu={{
              items,
              onClick: e => triggerActionClick({node: node.id, delete: permissions[e.key]}),
              selectedKeys: getKeyByValue(permissions, acl.delete),
            }}
            trigger={['click']}
            disabled={disabled}
          >
            <Button danger={acl.delete === false} type={acl.delete == null ? 'default' : 'primary'}>
              Delete
            </Button>
          </Dropdown>
        </Space.Compact>,
      ]}
    />
  );
};

const FormTree = props => {
  const {value, onChange, expandedKeys, updateExpandedKeys, record, treeData, tree, className, editing} = props;

  const handleActionClick = acl => {
    const current = value ?? [];
    const updated = current.map(item => (item.node === acl.node ? {...item, actor: record.id, ...acl} : item));
    if (!updated.some(item => item.node === acl.node)) {
      updated.push(acl);
    }
    onChange?.(updated);
  };

  const handleIconClick = id => {
    updateExpandedKeys(record.id, currentKeys =>
      currentKeys?.includes(id) ? currentKeys.filter(item => item !== id) : [...currentKeys, id],
    );
  };

  return (
    <Tree
      className={className}
      treeData={treeData}
      titleRender={node => (
        <TreeItem
          node={node}
          acl={value?.find(item => item.node === node.id) ?? {}}
          expanded={expandedKeys.includes(node.id)}
          disabled={record.id !== editing}
          onActionClick={handleActionClick}
          onIconClick={handleIconClick}
        />
      )}
      fieldNames={{key: 'id'}}
      checkStrictly={true}
      blockNode={true}
      disabled={record.id !== editing}
      multiple={true}
      expandedKeys={expandedKeys}
      selectedKeys={value?.map(item => item.node)}
    />
  );
};

const useStyles = createStyles(({css}) => ({
  tree: css`
    .ant-tree-switcher {
      display: none;
    }
  `,
}));

export const Component = props => {
  const {data: tree = [], isFetched: isNodeFetched} = useNode();
  const {data: roleData, isLoading} = useRoleACLList();
  const {mutate: deleteRole} = useRoleDeleteMutation();
  const {mutate: upsertRole} = useRolePutMutation();
  const {mutate: upsertNodeAcl} = useNodeACLPutMutation();
  const {mutate: removeNodeAcl} = useNodeACLDeleteMutation();
  const queryClient = useQueryClient();
  const [dataSource, setDataSource] = useState([]);
  const [disabled, setDisabled] = useState(true);
  const [editing, setEditing] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [form] = Form.useForm();
  const {notification} = App.useApp();
  const treeData = useMemo(() => arrayToTree(tree), [tree]);
  const {styles} = useStyles();

  useEffect(() => {
    setDataSource(roleData);
    const keys = roleData.reduce(
      (acc, {id, acl}) => ({
        ...acc,
        [id]: acl?.flatMap(({node}) => findAncestors(tree, node).map(({id}) => id)),
      }),
      {},
    );
    setExpandedKeys(keys);
  }, [roleData, tree]);

  const updateExpandedKeys = (index, updateFn) => {
    setExpandedKeys(expandedKeys => {
      const updated = {...expandedKeys};
      updated[index] = updateFn(updated[index] ?? []);
      return updated;
    });
  };

  const handleDeleteRole = values => {
    notification.open({type: 'info', description: 'Deleting role...'});
    const body = {
      hub: globalThis.envault.hub,
      id: values.id,
    };
    deleteRole(
      {...body},
      {
        onSuccess: () => {
          notification.open({type: 'success', description: 'Role deleted'});
          queryClient.invalidateQueries({queryKey: [API_QUERY.GET_ROLE_HUB, globalThis.envault.hub]});
        },
        onError: () => {
          notification.open({type: 'error', description: 'Could not delete role'});
        },
      },
    );
  };

  const handleSave = props => {
    const {acl, ...role} = props;
    const initValues = dataSource.find(item => item.id === role.id);
    const isUpdateRequired = !isEqual(initValues, props);
    if (isUpdateRequired) {
      if (typeof role.id !== 'number') {
        delete role.id;
      }
      notification.open({type: 'info', description: 'Updating role...'});
      upsertRole(role, {
        onSuccess: () => {
          const aclBase = {actor: role.id, create: null, read: null, update: null, delete: null};
          const acls = acl.map(item => ({...aclBase, ...item}));
          for (const [index, acl] of acls.entries()) {
            if (isMatch(acl, aclBase)) {
              removeNodeAcl({node: acl.node, actor: acl.actor});
              continue;
            }
            if (!isMatch(initValues.acl[index], acl)) {
              const {name, type, id, ...updatedAcl} = {...initValues.acl[index], ...acl};
              upsertNodeAcl(updatedAcl);
            }
          }
          notification.open({type: 'success', description: 'Role updated'});
        },
      });
    }
    setEditing(false);
  };

  const handleEdit = record => {
    setEditing(record.id);
  };

  const handleCancel = record => {
    if (typeof record.id !== 'number') {
      setDataSource(dataSource => dataSource.filter(item => item.id !== record.id));
    }
    setEditing(false);
  };

  const handleNew = () => {
    const newData = {
      id: `new-${dataSource.length + 1}`,
      name: '',
      description: '',
      acl: [],
    };
    setDataSource(dataSource => [newData, ...dataSource]);
    return newData;
  };

  const columns = {
    data: [
      {
        title: 'Role',
        key: 'name',
        dataIndex: 'name',
        editable: true,
        formItem: <Input />,
        formItemProps: {
          rules: [{required: true}, {type: 'string'}],
        },
        defaultSortOrder: 'ascend',
        sorter: 1,
        filter: true,
        filterSearch: true,
      },
      {
        title: 'Description',
        key: 'description',
        dataIndex: 'description',
        editable: true,
        formItem: <Input />,
        sorter: 2,
      },
    ],
    actions: {
      title: 'Actions',
      key: 'action',
      dataIndex: 'action',
      editable: true,
      actionItems: [],
    },
  };

  return (
    <ErrorBoundary>
      <Form form={form} component={false}>
        <FormTable
          columns={columns}
          dataSource={dataSource}
          rowKey={record => record?.id}
          loading={isLoading}
          newText={'Add Role'}
          paginationText={'Roles'}
          onPagination={handleCancel}
          onNew={handleNew}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          onRemove={handleDeleteRole}
          onDisabled={setDisabled}
          disabled={disabled}
          expandable={{
            expandedRowRender: record => (
              <Form.Item name={'acl'}>
                <FormTree
                  className={styles.tree}
                  record={record}
                  treeData={treeData}
                  tree={tree}
                  editing={editing}
                  expandedKeys={expandedKeys[record.id] ?? []}
                  updateExpandedKeys={updateExpandedKeys}
                />
              </Form.Item>
            ),
            rowExpandable: record => record?.id,
            columnTitle: 'ACL',
            columnWidth: '70px',
          }}
        />
      </Form>
    </ErrorBoundary>
  );
};

Component.displayName = 'RolesManagement';
