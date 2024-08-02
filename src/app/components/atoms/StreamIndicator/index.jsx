import {Flex, Tag} from 'antd';
import {createStyles} from 'antd-style';

const useStyles = createStyles(({token, css}) => ({
  tag: css`
    cursor: pointer;
  `,
  icon: css`
    height: 100%;
  `,
}));

export const StreamIndicator = props => {
  const {id, value, eventState = {}, onChange = () => {}} = props;
  const {styles} = useStyles();

  const triggerChange = () => {
    onChange?.(eventState);
  };

  return (
    <Tag
      id={id}
      color={eventState?.color}
      key={eventState?.state}
      checked={true}
      onClick={triggerChange}
      className={styles.tag}
      title={`${eventState?.state}! Click to change`}
      icon={
        <Flex vertical justify={'center'} className={styles.icon}>
          {eventState?.icon} {eventState?.state}
        </Flex>
      }
    />
  );
};
