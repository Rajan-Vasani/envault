import {Card, Flex, List, Tooltip, Typography} from 'antd';
import {createStyles, useThemeMode} from 'antd-style';
import Icon from 'components/atoms/Icon';
import HubUser from 'pages/user/components/HubUser';
import {Link, useOutletContext} from 'react-router-dom';
const {Meta} = Card;
const {Text} = Typography;

const useStyles = createStyles(({token, css}) => {
  return {
    hubs: css`
      box-shadow: ${token.boxShadowTertiary};
      border: 1px solid ${token.colorBorder};
      height: 100%;
      display: flex;
      flex-direction: column;
    `,
    cardTitle: css`
      text-align: center;
    `,
    cardBody: css`
      flex: 1;
      overflow-y: scroll;
    `,
    avatar: css`
      text-align: center;
      width: 120px;
      height: 60px;
      img,
      svg {
        display: block;
        object-fit: contain;
        align-items: center;
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

  return (
    <Card title={'Hubs'} className={styles.hubs} classNames={{title: styles.cardTitle, body: styles.cardBody}}>
      <List
        dataSource={user.hubs}
        itemLayout={'vertical'}
        rowKey={hub => hub.name}
        renderItem={hub => (
          <List.Item key={hub.name}>
            <Link to={globalThis.envault.getOrigin(hub.name)} replace unstable_viewTransition style={{width: '100%'}}>
              <Card type={'inner'} hoverable className={styles.hub}>
                <Meta
                  avatar={
                    <div className={styles.avatar}>
                      {isDarkMode ? (
                        hub.config?.logoInlineDark ? (
                          <img src={hub.config.logoInlineDark} />
                        ) : (
                          <Icon icon={'EnvaultInlineDark'} type={'envault'} raw />
                        )
                      ) : hub.config?.logoInlineLight ? (
                        <img src={hub.config.logoInlineLight} />
                      ) : (
                        <Icon icon={'EnvaultInline'} type={'envault'} raw />
                      )}
                    </div>
                  }
                  description={
                    <Flex justify={'space-between'} align={'center'} style={{height: '100%'}}>
                      <Tooltip title={hub.full_name || hub.name}>
                        <Text>{hub.full_name || hub.name}</Text>
                      </Tooltip>
                      <HubUser id={hub.name} />
                    </Flex>
                  }
                />
              </Card>
            </Link>
          </List.Item>
        )}
      />
    </Card>
  );
};
Component.displayName = 'Hub';
