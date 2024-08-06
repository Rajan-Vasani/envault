import {useDndMonitor} from '@dnd-kit/core';
import {Layout} from 'antd';
import {createStyles} from 'antd-style';
import {DraggableOverlay} from 'components/draggable/overlay';
import {Droppable} from 'components/droppable';
import {nodeDetails} from 'config/menu';
import {useNode} from 'hooks/useNode';
import {NodeProvider} from 'layouts/node/context';
import {NoNode} from 'pages/error/nonode';
import {lazy, useState, useTransition} from 'react';
import {Outlet, useMatch, useNavigate, useOutletContext, useParams} from 'react-router-dom';
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
  const {params} = useMatch('hub/explore/node/:type?/:id?');
  params.id = +params.id;
  const {data: treeData} = useNode();
  const {data: nodeData} = useNode({type: params.type, id: params.id, enabled: !!(params.type && params.id !== -1)});
  const [, startTransition] = useTransition();
  const {nodeId} = useParams();
  const {styles} = useStyles();
  const [showPrivate, setShowPrivate] = useState(false);

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

  if (!isPublic && !showPrivate) {
    startTransition(() => setShowPrivate(true));
  }

  const currentNode = treeData?.find(({id}) => id === params.id);
  const node = {
    ...params,
    ...nodeData?.[0],
    ...currentNode,
  };

  const acceptNodeTypes = nodeDetails.map(item => item.value);

  return (
    <NodeProvider node={node}>
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
