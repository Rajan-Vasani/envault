import {Flex, Layout, Radio} from 'antd';
import {createStyles} from 'antd-style';
import NodeBreadcrumb from 'components/atoms/Breadcrumb';
import {useNodeContext} from 'layouts/node/context';
import {useLocation, useNavigate} from 'react-router-dom';
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
  const {navItems} = props;
  const {pathname} = useLocation();
  const navigate = useNavigate();
  const {nodeAttrs} = useNodeContext();
  const {styles} = useStyles();

  const handleNavChange = e => {
    const value = e.target.value;
    navigate(
      {
        pathname: new URL('.', window.origin + pathname).pathname + value,
      },
      {unstable_viewTransition: true},
    );
  };

  return (
    <Header className={styles.header}>
      <Flex align={'center'} wrap justify={'space-between'} style={{width: '100%'}}>
        <NodeBreadcrumb node={nodeAttrs} />
        <Radio.Group
          buttonStyle={'solid'}
          value={navItems?.find(item => pathname.includes(item.value))?.value}
          onChange={handleNavChange}
        >
          {navItems?.map(({value, label}) => (
            <Radio.Button key={value} value={value}>
              {label}
            </Radio.Button>
          ))}
        </Radio.Group>
      </Flex>
    </Header>
  );
};
export default NodeHeader;
