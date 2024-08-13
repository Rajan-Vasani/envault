import {App, Button, Col, Dropdown, Form, Row, Skeleton, Space, Tree} from 'antd';
import Icon from 'components/atoms/Icon';
import {
  useActorNodeACLList,
  useNestedNode,
  useNode,
  useNodeACLDeleteMutation,
  useNodeACLPutMutation,
} from 'hooks/useNode';
import {cloneDeep, isEqual} from 'lodash';
import {useEffect, useRef, useState} from 'react';

const RoleUpdate = props => {
  const {
    record: {id, name, description},
    disabled,
  } = props;
  const [form] = Form.useForm();
  const formRef = useRef(null);
  const [loading, setLoading] = useState();
  const {data: nodeData, isFetched: isNodeFetched} = useNode();
  const {data: nestedNodeData, isFetched: isNestedNodeFetched} = useNestedNode();
  const {data: nodeACLData, isFetched: isNodeACLFetched} = useActorNodeACLList({
    actor: id,
  });
  const [nodeACLArray, setNodeACLArray] = useState([]);
  const {mutate: setNodeAcl} = useNodeACLPutMutation();
  const {mutate: removeNodeAcl} = useNodeACLDeleteMutation();
  const {message} = App.useApp();
  const [isFilled, setFilled] = useState(false);
  const [checkedKeys, setCheckedKeys] = useState({checked: [], halfChecked: []});
  const labelWidth = 6;
  const wrapperWidth = 18;

  const isFetched = isNodeFetched && isNestedNodeFetched && (isNodeACLFetched || id === null);
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
  }, [isFetched, isFilled, isNodeACLFetched, nodeACLData, nodeData, id, name, description]);

  const halfCheckParents = (checkedIDs, flattenedObjects) => {
    const mapped = initialObjects => {
      const filtered = flattenedObjects
        ?.filter(object => object.parent && initialObjects?.includes(object.id))
        ?.map(object => object.parent);
      return filtered?.length ? filtered?.concat(mapped(filtered)) : filtered;
    };
    return {checked: checkedIDs, halfChecked: mapped(checkedIDs)};
  };

  const PermissionsComponent = props => {
    const item = props;
    const ACLData = nodeACLArray?.find(node => node.node === item.id);
    const selected = (ACLData ? true : false) && !disabled;
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

  const onCheck = (checkedObject, checkedNode) => {
    setCheckedKeys(halfCheckParents(checkedObject.checked, nodeData));
    if (checkedNode.checked === true) {
      const newNodeACL = {
        node: checkedNode.node.id,
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
            {node, actor},
            {
              onSuccess: data => {
                message.open({type: 'success', content: 'ACL updated'});
              },
            },
          );
        }
      });
    }
    setLoading(false);
  };
  return (
    <Form
      form={form}
      ref={formRef}
      onFinish={onFinish}
      labelCol={{span: labelWidth}}
      wrapperCol={{span: wrapperWidth}}
      disabled={disabled}
    >
      {isFilled ? (
        <>
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
              disabled={disabled}
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
  );
};

export default RoleUpdate;
