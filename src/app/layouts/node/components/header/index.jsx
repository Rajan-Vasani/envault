import {Layout} from 'antd';
import {createStyles} from 'antd-style';
import NodeBreadcrumb from 'components/atoms/Breadcrumb';
import {useNodeContext} from 'layouts/node/context';
const {Header} = Layout;

const useStyles = createStyles(({token, css}) => ({
  header: css`
    background: ${token.colorBgLayout};
    border-bottom: 1px solid ${token.colorBorder};
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    height: auto !important;
  `,
}));

export const NodeHeader = props => {
  const {node} = useNodeContext();
  const {styles} = useStyles();

  return (
    <Header className={styles.header}>
      <NodeBreadcrumb node={node} />
    </Header>
  );
};
export default NodeHeader;
