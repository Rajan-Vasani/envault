import {Flex, Layout, Skeleton} from 'antd';
import {createStyles} from 'antd-style';
import Resizeable from 'components/resizeable';
const {Sider, Header} = Layout;

const useStyles = createStyles(({token, css}) => ({
  sider: css`
    height: 100%;
    background: ${token.colorBgContainer} !important;
  `,
  hubHeader: css`
    box-shadow: ${token.boxShadowTertiary};
    background: ${token.colorBgContainer};
    border-bottom: 1px solid ${token.colorBorder};
  `,
  nodeHeader: css`
    background: ${token.colorBgLayout};
    border-bottom: 1px solid ${token.colorBorder};
    height: 42px;
  `,
}));

export const TreeSiderItemsSkeleton = () => {
  return (
    <Flex vertical gap={'middle'} style={{padding: '10px'}}>
      <Skeleton.Button block active />
      <Flex vertical gap={'small'}>
        <Skeleton.Button size={'large'} block active />
        <Skeleton.Button size={'large'} block active />
        <Skeleton.Button size={'large'} block active />
      </Flex>
    </Flex>
  );
};

export const TreeSiderSkeleton = () => {
  const {styles} = useStyles();
  return (
    <Resizeable placement={'left'}>
      <Sider width={'auto'} className={styles.sider}>
        <TreeSiderItemsSkeleton />
      </Sider>
    </Resizeable>
  );
};

export const HubHeaderSkeleton = () => {
  const {styles} = useStyles();
  return (
    <Header className={styles.hubHeader}>
      <Flex gap={'small'} align={'center'} justify={'flex-start'} style={{height: '100%'}}>
        <Skeleton.Button active style={{width: '200px'}} />
        <Skeleton.Button active />
        <Skeleton.Button active />
      </Flex>
    </Header>
  );
};

export const NodeHeaderSkeleton = () => {
  const {styles} = useStyles();
  return (
    <Header className={styles.nodeHeader}>
      <Flex gap={'small'} align={'center'} justify={'flex-start'} style={{height: '100%'}}>
        <Skeleton.Button size={'small'} active /> / <Skeleton.Button size={'small'} active />
      </Flex>
    </Header>
  );
};

export const NodeSiderSkeleton = () => {
  const {styles} = useStyles();
  return (
    <Resizeable placement={'right'} collapsed={true}>
      <Sider width={'auto'} className={styles.sider}>
        <TreeSiderItemsSkeleton />
      </Sider>
    </Resizeable>
  );
};
