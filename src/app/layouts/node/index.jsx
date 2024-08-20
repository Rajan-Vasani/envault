import {Layout} from 'antd';
import {createStyles} from 'antd-style';
import {useNode} from 'hooks/useNode';
import {NodeProvider} from 'layouts/node/context';
import NoNode from 'pages/error/nonode';
import {lazy, useState, useTransition} from 'react';
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
  const context = useOutletContext();
  const {params} = useMatch('hub/explore/node/:type?/:id?');
  const nodeAttrs = {id: +params.id, type: params.type};
  const {data: treeData} = useNode();
  const {data: nodeData} = useNode({
    type: nodeAttrs.type,
    id: nodeAttrs.id,
    enabled: !!(nodeAttrs.type && nodeAttrs.id !== -1),
  });
  const [, startTransition] = useTransition();
  const {styles} = useStyles();
  const [showPrivate, setShowPrivate] = useState(false);

  if (!context.isPublic && !showPrivate) {
    startTransition(() => setShowPrivate(true));
  }

  const currentNode = treeData?.find(({id}) => id === nodeAttrs.id);
  const node = {
    ...params,
    ...nodeData?.[0],
    ...currentNode,
  };

  return (
    <NodeProvider node={node}>
      <Layout style={{height: '100%'}}>
        {showPrivate && <NodeHeader />}
        <Layout>
          <Content className={styles.content}>{nodeAttrs.id ? <Outlet context={context} /> : <NoNode />}</Content>
          {showPrivate && <NodeSider />}
        </Layout>
      </Layout>
    </NodeProvider>
  );
};
Component.displayName = 'NodeLayout';
