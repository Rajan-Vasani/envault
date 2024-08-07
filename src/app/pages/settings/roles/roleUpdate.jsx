import {useQueryClient} from '@tanstack/react-query';
import {App, Button, Col, Dropdown, Form, Input, Row, Skeleton, Space, Tree} from 'antd';
import {API_QUERY} from 'app/constant/query';
import Icon from 'components/atoms/Icon';
import {useActorNodeACL, useNestedNode, useNode, useNodeACLDeleteMutation, useNodeACLPutMutation} from 'hooks/useNode';
import {useRolePutMutation} from 'hooks/useRole';
import {cloneDeep, isEqual} from 'lodash';
import {useEffect, useRef, useState} from 'react';

const RoleUpdate = props => {
  const {
    roleDetails: {id, name, description},
    isEdit,
    setRole,
    hub,
  } = props;
  const [form] = Form.useForm();
  const formRef = useRef(null);
  const [loading, setLoading] = useState();
  const {data: nodeData, isFetched: isNodeFetched} = useNode({hub});
  const {data: nestedNodeData, isFetched: isNestedNodeFetched} = useNestedNode({hub});
  const {data: nodeACLData, isFetched: isNodeACLFetched} = useActorNodeACL({
    hub,
    actor: id,
  });
  const [nodeACLArray, setNodeACLArray] = useState([]);
  const {mutate: updateRole} = useRolePutMutation();
  const {mutate: setNodeAcl} = useNodeACLPutMutation();
  const {mutate: removeNodeAcl} = useNodeACLDeleteMutation();
  const {message} = App.useApp();
  const queryClient = useQueryClient();
  const [isFilled, setFilled] = useState(false);
  const [checkedKeys, setCheckedKeys] = useState({checked: [], halfChecked: []});
  const labelWidth = 6;
  const wrapperWidth = 18;

  const isFetched = isNodeFetched && isNestedNodeFetched && (isNodeACLFetched || id === null);

  function halfCheckParents(checkedIDs, flattenedObjects) {
    const mapped = initialObjects => {
      const filtered = flattenedObjects
        ?.filter(object => object.parent && initialObjects?.includes(object.id))
        ?.map(object => object.parent);
      return filtered?.length ? filtered?.concat(mapped(filtered)) : filtered;
    };
    return {checked: checkedIDs, halfChecked: mapped(checkedIDs)};
  }

  const PermissionsComponent = props => {
    const item = props;
    const ACLData = nodeACLArray?.find(node => node.node === item.id);
    const selected = (ACLData ? true : false) && isEdit;
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
    const perms = {
      allow: true,
      deny: false,
      inherit: null,
    };

    const onClick = ({key}, id, type) => {
      const nodeACL = nodeACLArray.map(nodeAcl => {
        if (nodeAcl.node === id) {
          return {
            ...nodeAcl,
            [type]: perms[key],
          };
        }
        return nodeAcl;
      });
      setNodeACLArray(nodeACL);
    };

    const getKeyByValue = (object, value) => {
      return Object.keys(object).find(key => object[key] === value);
    };

    return (
      <Row>
        <Col>{item.name}</Col>
        <Col flex="auto">
          <Space.Compact style={{width: '100%', justifyContent: 'flex-end'}}>
            <Dropdown
              menu={{
                items,
                onClick: e => onClick(e, item.id, 'create'),
                selectedKeys: getKeyByValue(perms, ACLData?.create),
              }}
              trigger={['click']}
              disabled={!selected}
            >
              <Button danger={ACLData?.create === false} type={ACLData?.create === null ? 'default' : 'primary'}>
                Create
              </Button>
            </Dropdown>
            <Dropdown
              menu={{
                items,
                onClick: e => onClick(e, item.id, 'read'),
                selectedKeys: getKeyByValue(perms, ACLData?.read),
              }}
              trigger={['click']}
              disabled={!selected}
            >
              <Button danger={ACLData?.read === false} type={ACLData?.read === null ? 'default' : 'primary'}>
                Read
              </Button>
            </Dropdown>
            <Dropdown
              menu={{
                items,
                onClick: e => onClick(e, item.id, 'update'),
                selectedKeys: getKeyByValue(perms, ACLData?.update),
              }}
              trigger={['click']}
              disabled={!selected}
            >
              <Button danger={ACLData?.update === false} type={ACLData?.update === null ? 'default' : 'primary'}>
                Update
              </Button>
            </Dropdown>
            <Dropdown
              menu={{
                items,
                onClick: e => onClick(e, item.id, 'delete'),
                selectedKeys: getKeyByValue(perms, ACLData?.delete),
              }}
              trigger={['click']}
              disabled={!selected}
            >
              <Button danger={ACLData?.delete === false} type={ACLData?.delete === null ? 'default' : 'primary'}>
                Delete
              </Button>
            </Dropdown>
          </Space.Compact>
        </Col>
      </Row>
    );
  };

  useEffect(() => {
    if (isFetched && !isFilled && (isNodeACLFetched || id === null)) {
      formRef.current?.setFieldsValue({
        name,
        description,
      });
      const mappedData = nodeACLData?.map(nodeACL => nodeACL.node);
      setCheckedKeys(halfCheckParents(mappedData, nodeData));
      setNodeACLArray(cloneDeep(nodeACLData ?? []));
      setFilled(true);
    }
  }, [isFetched, isFilled, isNodeACLFetched, nodeACLData, nodeData, id]);

  const onCheck = (checkedObject, checkedNode) => {
    setCheckedKeys(halfCheckParents(checkedObject.checked, nodeData));
    if (checkedNode.checked === true) {
      const newNodeACL = {
        node: checkedNode.node.id,
        hub,
        actor: id,
        create: null,
        read: null,
        update: null,
        delete: null,
      };
      setNodeACLArray(nodeACLArray?.concat(newNodeACL));
    } else {
      setNodeACLArray(nodeACLArray?.filter(nodeACL => nodeACL.node !== checkedNode.node.id));
    }
  };
  const onFinish = values => {
    setLoading(true);
    message.open({type: 'infor', content: `${!id ? 'Creating' : 'Updating'} role...`});
    if (id) {
      // update role values
      if (!(name === values.name && description === values.description && id)) {
        const roleBody = {
          hub,
          id,
          name: values.name,
          description: values.description,
        };
        updateRole(
          {...roleBody},
          {
            onSuccess: data => {
              message.open({type: 'success', content: 'Role updated'});
              queryClient.invalidateQueries({queryKey: [API_QUERY.GET_ROLE_HUB, hub]});
              setTimeout(() => setRole(false), 500);
            },
            onError: data => {
              message.open({type: 'error', content: 'Could not update role'});
            },
          },
        );
      }
      // update node-acl array
      // update / add new node-acl values
      nodeACLArray.forEach(nodeACL => {
        const originalNode = nodeACLData?.find(data => data.node === nodeACL.node);
        if (!isEqual(originalNode, nodeACL)) {
          // Send put command for each different node
          setNodeAcl(
            {...nodeACL},
            {
              onSuccess: data => {
                message.open({type: 'success', content: 'ACL updated'});
                queryClient.invalidateQueries({queryKey: [API_QUERY.GET_NODE_ACL_ROLE, hub, id]});
              },
              onError: data => {
                message.open({type: 'error', content: 'Could not update permissions'});
              },
            },
          );
        }
      });
      // delete removed node-acl values
      nodeACLData?.forEach(nodeACL => {
        const {node, actor} = nodeACL;
        if (!nodeACLArray.find(data => data.node === nodeACL.node)) {
          removeNodeAcl(
            {hub, node, actor},
            {
              onSuccess: data => {
                message.open({type: 'success', content: 'ACL updated'});
                queryClient.invalidateQueries({queryKey: [API_QUERY.GET_NODE_ACL_ROLE, hub, actor]});
              },
            },
          );
        }
      });
    } else {
      // create role values
      const roleBody = {
        hub,
        name: values.name,
        description: values.description,
      };
      updateRole(
        {...roleBody},
        {
          onSuccess: data => {
            message.open({type: 'success', content: 'Role created'});
            queryClient.invalidateQueries({queryKey: [API_QUERY.GET_ROLE_HUB, hub]});
            // create node-acl values
            nodeACLArray.forEach(nodeACL => {
              setNodeAcl(
                {...nodeACL, actor: data[0].id},
                {
                  onSuccess: () => {
                    message.open({type: 'success', content: 'ACL updated'});
                    queryClient.invalidateQueries({queryKey: [API_QUERY.GET_NODE_ACL_ROLE, hub, data[0].id]});
                  },
                  onError: data => {
                    message.open({type: 'error', content: 'Could not update permissions'});
                  },
                },
              );
            });
            setTimeout(() => setRole(false), 500);
          },
          onError: data => {
            message.open({type: 'error', content: 'Could not update role'});
          },
        },
      );
    }
    setLoading(false);
  };
  return (
    <>
      <Form
        form={form}
        ref={formRef}
        onFinish={onFinish}
        labelCol={{span: labelWidth}}
        wrapperCol={{span: wrapperWidth}}
        disabled={!isEdit}
      >
        {isFilled ? (
          <>
            <Form.Item
              label="Role Name"
              name="name"
              rules={[
                {
                  required: true,
                  message: 'Please name the role',
                },
              ]}
            >
              <Input placeholder="Role Name" />
            </Form.Item>
            <Form.Item label="Role Description" name="description">
              <Input placeholder="Role Description" />
            </Form.Item>
            <Form.Item label="Permissions">
              <Tree
                treeData={nestedNodeData}
                titleRender={PermissionsComponent}
                fieldNames={{key: 'id'}}
                checkable={true}
                checkStrictly={true}
                checkedKeys={checkedKeys}
                onCheck={onCheck}
                showLine={true}
                blockNode={true}
                disabled={!isEdit}
              />
            </Form.Item>
            <Form.Item wrapperCol={{offset: labelWidth, span: wrapperWidth}}>
              <Button type="primary" htmlType="submit" loading={loading}>
                {!id ? 'Create Role' : 'Update Permissions'}
              </Button>
            </Form.Item>
          </>
        ) : (
          <Skeleton active></Skeleton>
        )}
      </Form>
    </>
  );
};

export default RoleUpdate;
