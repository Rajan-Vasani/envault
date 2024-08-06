import {Button, Flex, Layout} from 'antd';
import {createStyles} from 'antd-style';
import Icon from 'components/atoms/Icon';
import {nodeDetails} from 'config/menu';
import {useNodeSaveMutation} from 'hooks/useNode';
import {NodeItem} from 'layouts/explore/components/sider';
import {useNodeContext} from 'layouts/node/context';
import {generatePath, useNavigate} from 'react-router-dom';
const {Content} = Layout;

const useStyles = createStyles(({token, css}) => ({
  item: css`
    cursor: pointer;
    border-radius: ${token.borderRadius}px;
    padding-left: ${token.lineWidthFocus}px;
    padding-right: ${token.lineWidthFocus}px;
    transition: ${token.motionDurationMid} ${token.motionEaseOut};
    &:hover {
      background-color: ${token.colorPrimaryBorder};
    }
  `,
}));

export const Component = props => {
  const {
    node: {id},
  } = useNodeContext();
  const {styles} = useStyles();
  const navigate = useNavigate();
  const {updateNode} = useNodeSaveMutation();

  const handleClick = e => {
    const type = e.currentTarget.getAttribute('data-value');
    updateNode({type, id});
    const pathname = generatePath(`../:type/:id`, {type, id});
    const search = new URLSearchParams({tab: 'info'}).toString();
    navigate({pathname, search});
  };

  return (
    <>
      <Flex vertical gap={'middle'} style={{padding: '20px'}}>
        Select a Node Type to get started
        <Flex vertical gap={'small'}>
          {nodeDetails.map((item, index) => (
            <div key={index} data-value={item.value} className={styles.item} onClick={handleClick}>
              <NodeItem
                icon={<Icon {...item.icon} />}
                value={item.value}
                name={item.title}
                description={item.description}
                actions={[<Button key={index} type="text" icon={<Icon icon={'RightOutlined'} type={'ant'} />} />]}
              />
            </div>
          ))}
        </Flex>
      </Flex>
    </>
  );
};

Component.displayName = 'NodeCreate';
