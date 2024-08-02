import {Card, Collapse, Flex, Skeleton, Typography} from 'antd';
import {createStyles} from 'antd-style';
import Icon from 'app/components/atoms/Icon';
import DefaultEnvaultLogo from 'assets/icons/envault/envault-stacked.svg?url';
import DefaultBackgroundImage from 'assets/public/envault-blue.png?url';
import {useHub} from 'hooks/useHub';
import {useEffect, useState} from 'react';
import {Outlet} from 'react-router-dom';
const {Text, Link} = Typography;

const useStyles = createStyles(({css}) => ({
  layout: css`
    background-image: url(${DefaultBackgroundImage});
    background-color: rgba(0, 27, 84, 1);
    background-position: center center;
    background-size: auto 100%;
    background-attachment: fixed;
    height: 100svh;
  `,
  brand: css`
    max-width: 100%;
    max-height: 150px;
    height: auto;
    padding: 20;
  `,
  card: css`
    max-width: 80%;
    background-color: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(5px);
    body: {
      padding: 0;
      overflow: auto;
    }
  `,
  poweredBy: css`
    height: 15;
  `,
  infoText: css`
    font-size: 12;
    height: 15;
  `,
}));

export const Component = props => {
  const {data: hub, isSuccess, isFetching} = useHub();
  const [icon, setIcon] = useState();
  const {styles} = useStyles();

  useEffect(() => {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    document.title = `${hub?.[0]?.full_name || globalThis.envault.hub} | envault.io`;
    if (hub?.[0]?.config?.favicon) {
      link.href = hub[0].config.favicon;
    }
  }, [hub]);

  useEffect(() => {
    if (!isFetching) {
      if (isSuccess) {
        setIcon(hub?.[0]?.config?.logoStackedLight || DefaultEnvaultLogo);
      } else {
        setIcon(DefaultEnvaultLogo);
      }
    }
  }, [isSuccess, isFetching, hub]);

  /*global __BUILD_VERSION__*/
  const buildVersion = __BUILD_VERSION__;
  /*global __BUILD_DATE__*/
  const buildYear = new Date(__BUILD_DATE__).getFullYear(); // need to slide into copyright note somewhere

  return (
    <Flex vertical gap={'small'} justify={'center'} align={'center'} className={styles.layout}>
      <Card
        className={styles.card}
        actions={[
          <Collapse
            key={'auth-footer-collapse'}
            size={'small'}
            ghost
            items={[
              {
                key: 'powered-by',
                label: (
                  <Flex justify={'flex-end'}>
                    <Icon icon={'EnvaultPoweredBy'} type={'envault'} alt={'envault'} raw className={styles.poweredBy} />
                  </Flex>
                ),
                showArrow: false,
                children: (
                  <Flex justify={'space-between'}>
                    <Flex vertical align={'flex-start'}>
                      {/* <Link href="https://envault.io/terms-of-use" target="_blank" rel="noopener noreferrer">
                          <Text className={styles.infoText}>Terms of use</Text>
                        </Link> */}
                      <Link href="https://envault.io/privacy" target="_blank" rel="noopener noreferrer">
                        <Text className={styles.infoText}>Privacy policy</Text>
                      </Link>
                    </Flex>
                    <Flex vertical align={'flex-end'}>
                      <Text className={styles.infoText}>{`© Envault ${buildYear}`}</Text>
                      <Text className={styles.infoText}>{`v${buildVersion}`}</Text>
                    </Flex>
                  </Flex>
                ),
              },
            ]}
          />,
        ]}
      >
        <Flex justify={'center'} align={'center'} wrap={'wrap'}>
          {icon ? <img src={icon} className={styles.brand} /> : <Skeleton.Image active className={styles.brand} />}
          <Flex vertical align={'flex-end'} justify={'space-between'}>
            <Outlet />
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
};
Component.displayName = 'Auth';
