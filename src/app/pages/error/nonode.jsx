import {useDndMonitor, useDroppable} from '@dnd-kit/core';
import {Card, Flex, Typography} from 'antd';
import {createStyles} from 'antd-style';
import Icon from 'components/atoms/Icon';
import {DraggableOverlay} from 'components/draggable/overlay';
import {Droppable} from 'components/droppable';
import {nodeDetails} from 'config/menu';
import {useNavigate} from 'react-router-dom';
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

export const Component = props => {
  const {type = 'node'} = props;
  const navigate = useNavigate();
  const {isOver} = useDroppable({
    id: `${type}-droppable`,
  });
  const {styles} = useStyles({isOver});

  //dnd-kit
  useDndMonitor({
    onDragEnd({active, over}) {
      if (!over) {
        return;
      }
      const {type, id} = active.data.current;
      navigate(`${type}/${id}`);
    },
  });

  const acceptNodeTypes = nodeDetails.map(item => item.value);

  return (
    <>
      <Droppable key={'node-droppable'} id={'node-droppable'} acceptedTypes={acceptNodeTypes}>
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
      </Droppable>
      <DraggableOverlay />
    </>
  );
};
export default Component;
