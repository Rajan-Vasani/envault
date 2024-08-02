import {App, Avatar, Badge, Button, Col, Dropdown, Layout, Menu, Row, Segmented, Tooltip} from 'antd';
import {createStyles, useThemeMode} from 'antd-style';
import Icon from 'components/atoms/Icon';
import initialMenu, {menuItemsHandler} from 'config/menu';
import {routes} from 'constant/routes';
import {useUserUpdateMutation} from 'hooks/useUser';
import {useMemo, useState, useTransition} from 'react';
import {Link, useLocation, useNavigate, useOutletContext} from 'react-router-dom';
const {Header} = Layout;

const NotificationBell = props => {
  const {results, loading} = props;
  const totalUnread = results?.length;
  return loading ? (
    <Icon icon="LoadingOutlined" type={'ant'} size={'small'} />
  ) : (
    <Link to={'/event'}>
      <Badge count={totalUnread} style={totalUnread < 1 ? {backgroundColor: '#ccc'} : {}} size={'small'} showZero>
        <div style={{padding: 3}}>
          <Icon icon="BellOutlined" type={'ant'} />
        </div>
      </Badge>
    </Link>
  );
};

const getUserInitials = userName => {
  const name = userName ? userName : 'ME';
  const names = name.split(' ');
  let initials = names[0].substring(0, 1).toUpperCase();
  if (names.length > 1) {
    initials += [...names].pop().substring(0, 1).toUpperCase();
  }
  return initials;
};

const useStyles = createStyles(({token, css}) => ({
  themePicker: css`
    .ant-segmented-item-label {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `,
  brand: css`
    max-width: 100%;
    max-height: 42px;
    border-radius: ${token.borderRadius}px;
  `,
  header: css`
    box-shadow: ${token.boxShadowTertiary};
    background: ${token.colorBgContainer};
    border-bottom: 1px solid ${token.colorBorder};
  `,
  menu: css`
    border-bottom: none;
  `,
}));

const HeaderNav = props => {
  const {hub} = props;
  const {user} = useOutletContext();
  const {mutate: updateUser} = useUserUpdateMutation();
  const {pathname} = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const {message} = App.useApp();
  const {styles} = useStyles();
  const {isDarkMode, themeMode, setThemeMode} = useThemeMode();

  const navMenuItems = useMemo(() => {
    const slug = pathname.split('/')[1];
    switch (slug) {
      case 'user':
        return menuItemsHandler(initialMenu.adminMenuItems);
      case 'explore':
      default:
        return menuItemsHandler(initialMenu.mainMenuItems);
    }
  }, [pathname]);

  const hubLogo = useMemo(() => {
    if (isDarkMode) {
      return hub?.config?.logoInlineDark ? (
        <img src={hub.config.logoInlineDark} className={styles.brand} />
      ) : (
        <Icon icon={'EnvaultInlineDark'} type={'envault'} className={styles.brand} raw />
      );
    } else {
      return hub?.config?.logoInlineLight ? (
        <img src={hub.config.logoInlineLight} className={styles.brand} />
      ) : (
        <Icon icon={'EnvaultInline'} type={'envault'} className={styles.brand} raw />
      );
    }
  }, [isDarkMode, hub, styles]);

  const themeSwitch = [
    {
      key: 'theme',
      label: (
        <Segmented
          options={[
            {
              value: 'light',
              icon: <Icon icon="BulbOutlined" type={'ant'} />,
            },
            {
              value: 'dark',
              icon: <Icon icon="BulbFilled" type={'ant'} />,
            },
            {
              value: 'auto',
              icon: <Icon icon="SyncOutlined" type={'ant'} />,
            },
          ]}
          value={themeMode}
          onChange={value => {
            startTransition(() => {
              updateUser(
                {id: user.id, config: {...user.config, theme: value}},
                {
                  onSuccess: () => {
                    setThemeMode(value);
                    message.success(`Theme preference updated to ${value}`);
                  },
                  onError: () => {
                    message.error('Could not update theme preference');
                  },
                },
              );
            });
          }}
          className={styles.themePicker}
        />
      ),
    },
  ];

  const handleMenuClick = e => {
    switch (e.key) {
      case 'logout':
        navigate(routes.logout);
        break;
      case 'theme':
        break;
      default:
        setOpen(false);
    }
  };

  const handleOpenChange = flag => {
    setOpen(flag);
  };

  return (
    <Header className={styles.header}>
      <Row wrap={false} align={'middle'} justify={'space-between'} style={{height: '100%'}}>
        <Col flex={'auto'}>
          <Row wrap={false} align={'middle'} justify={'start'}>
            <Col style={{width: '200px', maxWidth: '40vw'}}>
              <Link to={routes.hub}>{hubLogo}</Link>
            </Col>
            <Col flex={'auto'} xs={0} sm={0} md={24}>
              <Menu
                mode="horizontal"
                items={navMenuItems}
                selectedKeys={navMenuItems.filter(item => pathname.includes(item.key))[0]?.key}
                className={styles.menu}
              />
            </Col>
          </Row>
        </Col>
        <Col>
          <Row wrap={false} align={'middle'} justify={'end'}>
            <Col style={{paddingRight: '5px'}}>
              <Link to={routes.settings}>
                <Tooltip title={'Settings'}>
                  <Button type="ghost" icon={<Icon icon="SettingOutlined" type={'ant'} />} />
                </Tooltip>
              </Link>
            </Col>
            <Col>
              <Link to={globalThis.envault.app}>
                <Tooltip title={'Home'}>
                  <Button type="ghost" icon={<Icon icon="HomeOutlined" type={'ant'} />} />
                </Tooltip>
              </Link>
            </Col>
            <Col>
              <Tooltip title={'Notifications'}>
                <Button type="ghost" icon={<NotificationBell {...props} />} />
              </Tooltip>
            </Col>
            <Col>
              <Dropdown
                menu={{
                  items: [...themeSwitch, ...menuItemsHandler(initialMenu.accountMenuItems)],
                  onClick: handleMenuClick,
                }}
                placement={'bottomRight'}
                arrow={{pointAtCenter: true}}
                trigger={['click']}
                onOpenChange={handleOpenChange}
                open={open}
              >
                <Avatar style={{textTransform: 'uppercase', cursor: 'pointer'}}>{getUserInitials(user?.name)}</Avatar>
              </Dropdown>
            </Col>
          </Row>
        </Col>
      </Row>
    </Header>
  );
};

export default HeaderNav;
