import {Col, Layout, Menu, Row} from 'antd';
import {createStyles} from 'antd-style';
import initialMenu, {menuItemsHandler} from 'config/menu';
import {useMemo} from 'react';
import {useLocation} from 'react-router-dom';
const {Footer} = Layout;

const useStyles = createStyles(({token, css}) => ({
  footer: css`
    background: ${token.colorBgContainer};
    border-top: 1px solid ${token.colorBorder};
    padding: 0;
  `,
  menu: css`
    display: flex;
    justify-content: center;
  `,
}));

const FooterNav = props => {
  const {pathname} = useLocation();
  const {styles} = useStyles();
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

  return (
    <Footer className={styles.footer}>
      <Row wrap={true} align={'middle'} justify={'center'}>
        <Col flex={'auto'} xs={24} sm={24} md={0}>
          <Menu
            mode="horizontal"
            items={navMenuItems}
            selectedKeys={navMenuItems.filter(item => pathname.includes(item.key))[0]?.key}
            className={styles.menu}
          />
        </Col>
      </Row>
    </Footer>
  );
};

export default FooterNav;
