import {Card, Flex, Tooltip, Typography} from 'antd';
import {createStyles, useThemeMode} from 'antd-style';
import Icon from 'components/atoms/Icon';
import NoHub from 'pages/error/nohub';
import HubUser from 'pages/user/components/HubUser';
import {Link, useOutletContext} from 'react-router-dom';
const {Meta} = Card;
const {Text} = Typography;

const useStyles = createStyles(({token, css}) => {
  const cardHeight = 220;
  const cardWidth = 200;

  return {
    item: css`
      box-shadow: ${token.boxShadowTertiary};
      border: 1px solid ${token.colorBorder};
      text-align: center;
      height: ${cardHeight}px;
      width: ${cardWidth}px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      > .ant-card-cover {
        flex: 0 0 40%;
        max-height: 40%;
        svg,
        img {
          max-height: 100%;
          display: block;
          margin: auto;
        }
      }
      > .ant-card-body {
        flex: 0 0 40%;
        max-height: 40%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `,
    itemLogo: css`
      text-align: center;
      width: 100%;
      height: 110px;
      padding: 16px;
      img {
        display: block;
        margin: auto auto 4 auto;
        object-fit: contain;
        height: 100%;
        max-width: 100%;
        border-radius: ${token.borderRadius}px;
      }
    `,
  };
});

export const Component = props => {
  const {isDarkMode} = useThemeMode();
  const {user} = useOutletContext();
  const {styles} = useStyles();

  return user.hubs.length ? (
    <Flex wrap align={'center'} justify={'center'} gap={'large'}>
      {user?.hubs.map((hub, index) => (
        <Link key={index} to={globalThis.envault.getOrigin(hub.name)} replace>
          <Card
            className={styles.item}
            hoverable
            styles={{body: {padding: '8px 0'}}}
            cover={
              <div className={styles.itemLogo}>
                {isDarkMode ? (
                  hub?.config?.logoStackedDark ? (
                    <img src={hub.config.logoStackedDark} />
                  ) : (
                    <Icon icon={'EnvaultStackedDark'} type={'envault'} raw />
                  )
                ) : hub?.config?.logoStackedLight ? (
                  <img src={hub.config.logoStackedLight} />
                ) : (
                  <Icon icon={'EnvaultStacked'} type={'envault'} raw />
                )}
              </div>
            }
          >
            <Meta
              title={
                <Tooltip title={hub.full_name || hub.name}>
                  <Text>{hub.full_name || hub.name}</Text>
                </Tooltip>
              }
              description={<HubUser id={hub.name} />}
              className="format"
            />
          </Card>
        </Link>
      ))}
    </Flex>
  ) : (
    <NoHub />
  );
};
Component.displayName = 'Hub';
