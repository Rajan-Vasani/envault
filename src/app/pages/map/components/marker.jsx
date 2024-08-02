import {createStyles} from 'antd-style';
import Icon from 'components/atoms/Icon';

const useStyles = createStyles(({token, css}) => ({
  marker: css`
    background-color: ${token.colorPrimary};
    position: relative;
    border: 2px solid white;
    display: block;
    width: 30px;
    height: 30px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    svg {
      position: absolute;
      z-index: 2;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(45deg);
    }
  `,
}));

function LeafletMarker({customIcon, properties, ...props}) {
  const {styles} = useStyles();
  return (
    <div>
      <span
        className={styles.marker}
        style={{
          backgroundColor: customIcon ? customIcon.iconColor : '#000',
        }}
      >
        {customIcon ? customIcon : <Icon icon="QuestionCircleOutlined" type="ant" style={{color: '#fff'}} />}
      </span>
    </div>
  );
}

export default LeafletMarker;
