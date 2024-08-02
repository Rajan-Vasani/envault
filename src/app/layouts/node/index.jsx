import {useDndMonitor} from '@dnd-kit/core';
import {Layout} from 'antd';
import {createStyles} from 'antd-style';
import {DraggableOverlay} from 'components/draggable/overlay';
import {Droppable} from 'components/droppable';
import {nodeDetails} from 'config/menu';
import {NodeProvider} from 'layouts/node/context';
import {NoNode} from 'pages/error/nonode';
import {lazy, useState, useTransition} from 'react';
import {Outlet, useNavigate, useOutletContext, useParams} from 'react-router-dom';
const NodeSider = lazy(() => import('layouts/node/components/sider'));
const NodeHeader = lazy(() => import('layouts/node/components/header'));

const {Content} = Layout;

const useStyles = createStyles(({token, css}) => ({
  content: css`
    border-radius: ${token.borderRadius}px;
    background: ${token.colorBgContainer};
    margin: 10px;
  `,
}));

export const Component = props => {
  const navigate = useNavigate();
  const {hub, isPublic} = useOutletContext();
  const [, startTransition] = useTransition();
  const {nodeId} = useParams();
  const {styles} = useStyles();
  const [showPrivate, setShowPrivate] = useState(false);

  if (!isPublic && !showPrivate) {
    startTransition(() => setShowPrivate(true));
  }

  //dnd-kit
  useDndMonitor({
    onDragEnd({active, over}) {
      if (!over) {
        return;
      }
      const {type, id} = active.data.current;
      if (!nodeId) {
        return navigate(`${type}/${id}`);
      }
    },
  });

  const acceptNodeTypes = nodeDetails.map(item => item.value);

  return (
    <NodeProvider hub={hub}>
      <Layout style={{height: '100%'}}>
        {showPrivate && <NodeHeader />}
        <Layout>
          <Content className={styles.content}>
            {nodeId ? (
              <Outlet />
            ) : (
              <>
                <Droppable key={'node-droppable'} id={'node-droppable'} acceptedTypes={acceptNodeTypes}>
                  <NoNode />
                </Droppable>
                <DraggableOverlay />
              </>
            )}
          </Content>
          {showPrivate && <NodeSider />}
        </Layout>
      </Layout>
    </NodeProvider>
  );
};
Component.displayName = 'NodeLayout';
