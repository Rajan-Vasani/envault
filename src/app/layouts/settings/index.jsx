import {Flex, Layout, Menu, Tag, Typography} from 'antd';
import {createStyles, useThemeMode} from 'antd-style';
import Icon from 'components/atoms/Icon';
import ErrorBoundary from 'components/error/boundary';
import Resizeable from 'components/resizeable';
import {routes} from 'constant/routes';
import {Link, Outlet, useLocation, useOutletContext} from 'react-router-dom';
import {searchNested} from 'utils/tree';
const {Content, Sider} = Layout;
const useStyles = createStyles(({token, css}) => ({
  sider: css`
    background: ${token.colorBgContainer} !important;
    height: 100%;
  `,
  menu: css`
    background: ${token.colorBgContainer};
    height: 100%;
    border-right: none !important;
  `,
  poweredBy: css`
    position: sticky;
    bottom: 3px;
    align-self: center;
    height: 1.5rem;
    padding: 3px;
  `,
  layout: css`
    padding: 10;
  `,
  content: css`
    padding: 20;
    margin: 0;
    overflow-y: auto;
  `,
  title: css`
    padding: 0px;
    height: 15px;
    margin-top: 10;
  `,
}));
const {Title} = Typography;

export const Component = props => {
  const {isDarkMode} = useThemeMode();
  const {user, hub} = useOutletContext();
  const {styles} = useStyles();
  const {pathname} = useLocation();

  const isAdmin = hub.is_admin || user.app_admin;

  const settingsItems = [
    {
      type: 'group',
      key: 'general',
      label: (
        <Title className={styles.title} level={5}>
          General
        </Title>
      ),
      children: [
        {
          key: 'config',
          label: (
            <Link to={routes.config}>
             Hub
            </Link>
          ),
          icon: <Icon icon={'SettingOutlined'} type={'ant'} />,
        },
      ],
    },
    {
      type: 'group',
      key: 'access',
      label: (
        <Title className={styles.title} level={5}>
          Access
        </Title>
      ),

      children: [
        {
          key: 'users',
          label: (
            <Link to={routes.users}>
              Users
            </Link>
          ),
          icon: <Icon icon={'UserOutlined'} type={'ant'} />,
          disabled: !isAdmin,
        },
        {
          key: 'roles',
          label: (
            <Link to={routes.roles}>
              Roles
            </Link>
          ),

          icon: <Icon icon={'TeamOutlined'} type={'ant'} />,
          disabled: !isAdmin,
        },
      ],
    },
    {
      type: 'group',
      key: 'processing',
      label: (
        <Title className={styles.title} level={5}>
          Processing
        </Title>
      ),
      children: [
        {
          key: 'tasks',
          label: (
            <Link to={routes.tasks}>
             Tasks
            </Link>
          ),
          icon: <Icon icon={'ScheduleOutlined'} type={'ant'} />,
          disabled: !isAdmin,
        },
      ],
    },
    {
      type: 'group',
      key: 'admin',
      label: (
        <Title className={styles.title} level={5}>
          Administration
        </Title>
      ),

      children: [
        {
          key: 'billing',
          label: (
            <Link to={routes.billing}>
              Billing
              <Tag icon={<Icon icon={'ExperimentOutlined'} type={'ant'} style={{padding: '2px'}} />} color="green" />
            </Link>
          ),

          icon: <Icon icon={'DollarOutlined'} type={'ant'} />,
          disabled: !isAdmin,
        },
      ],
    },
  ];

  return (
    <Layout>
      <Resizeable placement={'left'} initWidth={280}>
        <Sider className={styles.sider} width={'auto'}>
          <Flex vertical justify={'space-between'} style={{padding: '10px', minHeight: '100%', width: 250}}>
            <Menu
              mode={'vertical'}
              items={settingsItems}
              className={styles.menu}
              selectedKeys={searchNested(settingsItems, item => pathname.includes(item.key))?.key}
            />
            <Icon
              icon={isDarkMode ? 'EnvaultPoweredByDark' : 'EnvaultPoweredBy'}
              type={'envault'}
              raw
              className={styles.poweredBy}
            />
          </Flex>
        </Sider>
      </Resizeable>
      <Layout className={styles.layout}>
        <Content className={styles.content}>
          <ErrorBoundary {...props}>
            <Outlet context={{user, hub}} />
          </ErrorBoundary>
        </Content>
      </Layout>
    </Layout>
  );
};
Component.displayName = 'Settings';
