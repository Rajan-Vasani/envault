import {Layout} from 'antd';
import {createStyles} from 'antd-style';
import {NodeHeaderSkeleton, NodeSiderSkeleton} from 'components/molecules/Skeleton';
import {useNode} from 'hooks/useNode';
import {nodeNavItems} from 'layouts/node/config';
import {NodeProvider} from 'layouts/node/context';
import NoNode from 'pages/error/nonode';
import {Suspense, lazy, useMemo} from 'react';
import {Outlet, useMatch, useOutletContext} from 'react-router-dom';
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
  const {isPublic, ...context} = useOutletContext();
  const {params} = useMatch('hub/explore/node/:type?/:id?/:module?');
  const nodeAttrs = {id: +params.id, type: params.type};
  const {data: treeData} = useNode();
  const {data: [nodeData = {}] = [{}]} = useNode({
    type: nodeAttrs.type,
    id: nodeAttrs.id,
    enabled: !!(nodeAttrs.type && nodeAttrs.id !== -1),
  });
  const {styles} = useStyles();

  const currentNode = treeData?.find(({id}) => id === nodeAttrs.id);
  const node = useMemo(
    () => ({
      ...params,
      ...nodeData,
      ...currentNode,
    }),
    [params, nodeData, currentNode],
  );

  return (
    <NodeProvider node={node}>
      <Layout style={{height: '100%'}}>
        {!isPublic && (
          <Suspense fallback={<NodeHeaderSkeleton />}>
            <NodeHeader navItems={nodeNavItems[nodeAttrs.type] ?? []} />
          </Suspense>
        )}
        <Layout>
          <Content className={styles.content}>
            {nodeAttrs.id ? <Outlet context={{isPublic, ...context}} /> : <NoNode />}
          </Content>
          {!isPublic && (
            <Suspense fallback={<NodeSiderSkeleton />}>
              <NodeSider />
            </Suspense>
          )}
        </Layout>
      </Layout>
    </NodeProvider>
  );
};
Component.displayName = 'NodeLayout';
