import {Col, Row} from 'antd';
import {createStyles} from 'antd-style';
import {Component as Hubs} from 'pages/user/hubs';
import {Component as Profile} from 'pages/user/profile';

const useStyles = createStyles(({token, css}) => {
  return {
    item: css`
      box-shadow: ${token.boxShadowTertiary};
      border: 1px solid ${token.colorBorder};
    `,
  };
});

export const Component = props => {
  const {styles} = useStyles({});

  return (
    <Row gutter={[32, 32]} justify={'center'} style={{height: '100%'}}>
      <Col xs={{flex: '100%'}} sm={{flex: '100%'}} md={{flex: '50%'}} lg={{flex: '40%'}}>
        <Profile className={styles.item} />
      </Col>
      <Col xs={{flex: '100%'}} sm={{flex: '100%'}} md={{flex: '50%'}} lg={{flex: '40%'}}>
        <Hubs className={styles.item} />
      </Col>
    </Row>
  );
};

Component.displayName = 'Hub';
