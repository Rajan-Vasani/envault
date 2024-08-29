import {createStyles} from 'antd-style';
import {Empty} from 'app/assets/icons/envault';
import Icon from 'app/components/atoms/Icon';

const useStyles = createStyles(({token, css}) => ({
  page: css`
    text-align: center;
    padding: 40px;
    overflow-y: auto;
  `,
  icon: css`
    display: block;
    width: 100%;
    max-width: 600px;
    margin: auto;
  `,
}));

export const Component = props => {
  const {styles} = useStyles();

  return (
    <div className={styles.page}>
      <h1>Welcome to analyse, let&apos;s get started</h1>
      <Empty
        description={`Welcome to analyse, let's get started`}
        image={<Icon icon={'Empty'} type={'envault'} raw />}
        className={styles.icon}
      />
    </div>
  );
};
Component.displayName = 'Analyse';
