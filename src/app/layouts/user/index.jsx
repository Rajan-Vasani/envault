import {FloatButton, Layout, Menu} from 'antd';
import {createStyles} from 'antd-style';
import Icon from 'components/atoms/Icon';
import ErrorBoundary from 'components/error/boundary';
import {useEffect} from 'react';
import {Link, Outlet, useLocation, useNavigate, useOutletContext, useParams} from 'react-router-dom';
const {Header} = Layout;
const {Content} = Layout;

const useStyles = createStyles(({token, css}) => ({
  header: css`
    box-shadow: ${token.boxShadowTertiary};
    background: ${token.colorBgContainer};
    border-bottom: 1px solid ${token.colorBorder};
  `,
  menu: css`
    border-bottom: none;
    justify-content: center;
  `,
}));

export const Component = props => {
  const {user, hub} = useOutletContext();
  const {pathname} = useLocation();
  const navigate = useNavigate();
  const {styles} = useStyles();
  const {userId: _userId} = useParams();
  const userId = +_userId;

  useEffect(() => {
    if (!userId && user) {
      navigate(`/user/${user.id}`);
    }
  }, [userId, user]);

  const context = {hub, user};
  const navMenuItems = [
    {
      key: 'home',
      label: <Link to={`/user/${userId}/home`}>Home</Link>,
      icon: <Icon icon={'HomeOutlined'} type={'ant'} />,
    },
  ];

  return (
    <Layout style={{height: '100svh'}}>
      <Header className={styles.header}>
        <Menu
          className={styles.menu}
          selectedKeys={navMenuItems.filter(item => pathname.includes(item.key))[0]?.key}
          mode={'horizontal'}
          items={navMenuItems}
        />
      </Header>
      <ErrorBoundary {...props}>
        <Content style={{padding: 32}}>
          <Outlet context={context} />
        </Content>
      </ErrorBoundary>
      {user.app_admin && (
        <FloatButton.Group trigger={'click'} icon={<Icon icon={'SettingOutlined'} type={'ant'} />}>
          <FloatButton icon={<Icon icon={'DatabaseOutlined'} type={'ant'} />} onClick={() => navigate(`admin/hubs`)} />
          <FloatButton icon={<Icon icon={'TeamOutlined'} type={'ant'} />} onClick={() => navigate(`admin/users`)} />
        </FloatButton.Group>
      )}
    </Layout>
  );
};
Component.displayName = 'HubLayout';
