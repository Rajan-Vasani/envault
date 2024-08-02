import {SearchOutlined} from '@ant-design/icons';
import {useDroppable} from '@dnd-kit/core';
import {TreeSelect, Typography} from 'antd';
import {createStyles} from 'antd-style';
import Icon from 'app/components/atoms/Icon';
import {useNode} from 'hooks/useNode';
import {v4 as uuidv4} from 'uuid';
const {Text} = Typography;

const useStyles = createStyles(({token, css}, {isOver}) => ({
  helper: css`
    display: flex;
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 0;
    transform: translate(-50%, -50%);
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    border-radius: ${token.borderRadius}px;
    border: ${isOver ? `1px solid ${token.colorPrimaryBorder}` : ''};
    box-shadow: ${isOver ? `0 0 10px ${token.colorPrimaryBorderHover}` : ''};
    padding: 40px;
    width: 100%;
    max-width: 400px;
    min-width: 300px;
    background-color: ${token.colorBgLayout};
  `,
}));

export const DashboardStart = props => {
  const {addWidget} = props;
  const {data: tree} = useNode();
  const {isOver} = useDroppable({
    id: 'dashboard-droppable',
  });
  const {styles} = useStyles({isOver});

  const widgetType = {
    timelapse: 'gallery',
    gallery: 'gallery',
    chart: 'chart',
    series: 'chart',
  };

  const handleNodeSelect = v => {
    const nodeItem = tree.find(item => item.id === +v);
    if (!nodeItem) {
      alert('Please select a suitable node');
    }
    if (['timelapse', 'gallery', 'chart', 'series'].includes(nodeItem.type)) {
      const data = {
        id: uuidv4(),
        data: {},
        type: widgetType[nodeItem.type],
        widgetData: {
          id: ['gallery', 'chart'].includes(nodeItem.type) ? nodeItem.id : null,
          series: ['series', 'timelapse'].includes(nodeItem.type) ? [nodeItem.id] : null,
        },
      };
      addWidget(data);
    } else {
      alert(`Please select a ${['timelapse', 'gallery', 'chart', 'series']} node`);
    }
  };

  return (
    <div className={styles.helper} id={'dashboard-droppable'}>
      <Icon icon={'Realtime'} type={'envault'} alt={'Drag&Drop'} raw style={{width: '50%', height: 'auto'}} />
      <br />
      <br />
      <Text style={{fontSize: '24px'}}>Drag&Drop to get started</Text>
      <br />
      <Text>or</Text>
      <br />
      <br />
      <TreeSelect
        placeholder={
          <>
            <SearchOutlined />
            &nbsp; Browse nodes...
          </>
        }
        treeData={tree}
        treeDataSimpleMode={{
          id: 'id',
          pId: 'parent',
          rootPId: null,
        }}
        showSearch
        fieldNames={{value: 'id', label: 'name'}}
        treeIcon
        treeLine={true}
        listHeight={500}
        treeNodeFilterProp="name"
        onChange={handleNodeSelect}
        style={{width: '300px', marginBottom: '10px'}}
      />
    </div>
  );
};
