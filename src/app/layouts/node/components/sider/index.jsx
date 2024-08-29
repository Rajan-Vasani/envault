import {App, Button, Flex, Layout, Tabs, Tooltip} from 'antd';
import {createStyles} from 'antd-style';
import Icon from 'components/atoms/Icon';
import ErrorBoundary from 'components/error/boundary';
import Resizeable from 'components/resizeable';
import {useNodeContext} from 'layouts/node/context';
import {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {useNodeDeleteMutation} from 'services/hooks/useNode';
import NodeConfig from './config';
import NodeInfo from './info';
const {Sider} = Layout;

const useStyles = createStyles(({css, token}) => ({
  sider: css`
    background: ${token.colorBgContainer} !important;
    display: flex;
    flex: 1;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    direction: rtl;
  `,
  tabs: css`
    padding: 0 10px;
    direction: ltr;
    .ant-tabs-nav {
      position: sticky;
      background: ${token.colorBgContainer};
      top: 0;
      z-index: 2;
    }
  `,
  action: css`
    position: sticky;
    bottom: 0;
    padding: 10px;
    width: 100%;
    background: ${token.colorBgContainer};
  `,
}));

export const NodeSider = props => {
  const {nodeAttrs} = useNodeContext();
  const {notification} = App.useApp();
  const {mutate: deleteNode} = useNodeDeleteMutation();
  const [disabled, setDisabled] = useState(true);
  const {styles} = useStyles();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const hasTab = searchParams.has('tab');
  const [collapsed, setCollapsed] = useState(!hasTab);

  useEffect(() => {
    if (nodeAttrs.id === -1) {
      setDisabled(false);
    }
  }, [nodeAttrs.id]); // new node mode
  useEffect(() => {
    setCollapsed(!hasTab);
  }, [hasTab]); // tab change

  const handleTabChange = e => {
    setSearchParams({...searchParams, tab: e});
  };

  const submitForm = () => {
    if (form) {
      form.submit();
    } else {
      console.warn('No form to submit');
    }
  };

  const handleDelete = node => {
    if (node?.id) {
      notification.info({description: `Deleting ${node?.type}`});
      deleteNode(
        {id: nodeAttrs?.id},
        {
          onSuccess: () => {
            navigate(`/hub/explore`);
          },
        },
      );
    }
  };
  const handleCollapse = value => {
    setSearchParams(value ? {} : {tab: 'info'});
    setCollapsed(value);
  };

  const items = [
    {
      key: 'config',
      label: 'Config',
      children: <NodeConfig node={nodeAttrs} setForm={setForm} disabled={disabled} />,
    },
    {
      key: 'info',
      label: 'Info',
      children: <NodeInfo node={nodeAttrs} setForm={setForm} disabled={disabled} />,
    },
  ];

  return (
    <Resizeable placement={'right'} collapsed={collapsed} onCollapse={handleCollapse}>
      <Sider className={styles.sider} width={'auto'}>
        <Flex vertical justify={'space-between'} style={{height: '100%'}}>
          <ErrorBoundary>
            <Tabs
              className={styles.tabs}
              activeKey={searchParams.get('tab')}
              defaultActiveKey={'info'}
              items={items}
              onChange={handleTabChange}
              destroyInactiveTabPane={true}
              tabBarExtraContent={
                <Flex justify={'flex-end'} gap={'small'}>
                  <Tooltip title={disabled ? 'Unlock' : 'Lock'}>
                    <Button
                      onClick={() => setDisabled(disabled => !disabled)}
                      icon={<Icon icon={disabled ? 'LockOutlined' : 'UnlockOutlined'} type={'ant'} />}
                    />
                  </Tooltip>
                  <Tooltip title={'Export'}>
                    <Button icon={<Icon icon={'ExportOutlined'} type={'ant'} />} />
                  </Tooltip>
                  <Tooltip title={'Share'}>
                    <Button icon={<Icon icon={'ShareAltOutlined'} type={'ant'} />} />
                  </Tooltip>
                  <Tooltip title={'Delete'}>
                    <Button
                      danger
                      onClick={() => handleDelete(nodeAttrs)}
                      icon={<Icon icon={'DeleteOutlined'} type={'ant'} />}
                    />
                  </Tooltip>
                </Flex>
              }
            />
            <div className={styles.action}>
              <Button type="primary" onClick={submitForm} disabled={disabled} block>
                {'Save'}
              </Button>
            </div>
          </ErrorBoundary>
        </Flex>
      </Sider>
    </Resizeable>
  );
};
export default NodeSider;
