import {useDroppable} from '@dnd-kit/core';
import {Card, Flex, Typography} from 'antd';
import {createStyles} from 'antd-style';
import Icon from 'components/atoms/Icon';
const {Title} = Typography;

const useStyles = createStyles(({token, css}, {isOver}) => ({
  container: css`
    height: 100%;
  `,
  card: css`
    border: ${isOver ? `1px solid ${token.colorPrimaryBorder}` : ''};
    box-shadow: ${isOver ? `0 0 10px ${token.colorPrimaryBorderHover}` : ''};
    background-color: ${token.colorBgLayout};
    max-width: 80%;
  `,
  icon: css`
    padding: 40px;
  `,
}));

export const NoNode = props => {
  const {type} = props;
  const {isOver} = useDroppable({
    id: `${type}-droppable`,
  });
  const {styles} = useStyles({isOver});

  return (
    <Flex vertical gap={'small'} justify={'center'} align={'center'} className={styles.container}>
      <Card
        cover={<Icon icon={'Realtime'} type={'envault'} alt={'Drag&Drop'} raw className={styles.icon} />}
        className={styles.card}
      >
        <Flex vertical gap={'small'} justify={'space-between'} align={'center'} wrap={'wrap'}>
          <Title level={4}>Select a node to get started</Title>
        </Flex>
      </Card>
    </Flex>
  );
};
export default NoNode;
