import {LoadingOutlined} from '@ant-design/icons';
import {Progress, Spin} from 'antd';
import {createStyles} from 'antd-style';
import {useEffect, useState} from 'react';

const useStyles = createStyles(({token, css}) => ({
  loading: css`
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  `,
  loadingBar: css`
    margin: auto;
    justify-content: center;
    min-height: 40px;
    max-width: 300px;
    padding: 30px 50px;
    text-align: center;
  `,
  fullLoadingBar: css`
    display: flex;
    text-align: center;
    overflow: auto;
    flex-flow: column;
    height: 100%;
  `,
  loader: css`
    margin: auto 0;
    min-height: 40px;
    padding: 30px 50px;
    text-align: center;
  `,
  smallLoader: css`
    margin: auto 0;
    text-align: center;
  `,
}));

export const Loading = ({containerStyle}) => {
  const styles = useStyles();
  return (
    <div style={{position: 'relative', textAlign: 'center', ...containerStyle}}>
      <Spin size="large" className={styles.loading} />
    </div>
  );
};

export const loadingIndicator = <LoadingOutlined style={{fontSize: 24}} spin />;

export const FullLoadingBar = props => {
  const {isModal} = props;
  const styles = useStyles();

  if (isModal) {
    return <LoadingBar {...props} style={{padding: 0}} />;
  }
  return (
    <div className={styles.fullLoadingBar}>
      <LoadingBar {...props} style={{padding: 0}} />
    </div>
  );
};

export const LoadingBar = ({size, total, current, limit, percent, ...rest}) => {
  useEffect(() => {
    if (percent) {
      setPercent(percent);
    } else {
      const calc = Math.round(((limit * (current - 1)) / total) * 100);
      if (!total) {
        setPercent(10);
      } else {
        setPercent(Math.max(20, calc));
      }
    }
  }, [percent, limit, total, current]);
  const [usePercent, setPercent] = useState(percent);
  const styles = useStyles();

  return (
    <div className={styles.loadingBar}>
      <Progress
        percent={usePercent}
        showInfo={false}
        status="active"
        strokeColor={{'0%': '#13a89e', '100%': '#00aeef'}}
      />
    </div>
  );
};

export const LoadingSpin = ({icon, size, total, current, limit, ...rest}) => {
  const styles = useStyles();

  return (
    <div className={size === 'small' ? styles.smallLoader : styles.loader}>
      <Spin indicator={loadingIndicator} {...rest} />
    </div>
  );
};

export default LoadingSpin;
