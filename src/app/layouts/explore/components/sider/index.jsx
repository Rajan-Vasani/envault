import {Button, Empty, Flex, Input, Layout, Space, Tag, Tooltip, Tree, Typography} from 'antd';
import {ThemeProvider, createStyles, useTheme, useThemeMode} from 'antd-style';
import Icon from 'components/atoms/Icon';
import DraggableItem from 'components/draggable/item';
import {TreeSiderItemsSkeleton} from 'components/molecules/Skeleton';
import Resizeable from 'components/resizeable';
import {nodeDetails} from 'config/menu';
import {GridStack} from 'gridstack';
import {useNodeFilter, useNodeSaveMutation} from 'hooks/useNode';
import {debounce, union} from 'lodash';
import {useEffect, useMemo, useState} from 'react';
import {createSearchParams, generatePath, useNavigate, useParams, useSearchParams} from 'react-router-dom';
import {formatNumber} from 'utils/number';
import {arrayToTree, findAncestors} from 'utils/tree';
const {Sider} = Layout;
const {Search} = Input;
const {Text} = Typography;

const ConditionalWrapper = ({condition, wrapper, children}) => (condition ? wrapper(children) : children);

const useItemStyles = createStyles(({token, css, cx}, {isNew = false}) => ({
  item: cx(
    css`
      background: ${token.colorBgLayout};
      border: 1px solid ${token.colorBorder};
      border-radius: ${token.borderRadius}px;
      box-shadow: ${token.boxShadowTertiary};
      width: 100%;
    `,
    isNew &&
      css`
        border: 1px dashed ${token.colorPrimaryBorder};
        background: ${token.colorBgContainer};
      `,
  ),
}));
export const NodeItem = props => {
  const {icon, name, description, actions = [], onIconClick, isNew} = props;
  const {styles} = useItemStyles({isNew});
  return (
    <div className={styles.item}>
      <Flex justify={'space-between'} style={{padding: '3px', width: '100%'}}>
        <Flex justify={'flex-start'} align={'center'} gap={'small'} flex={1}>
          <Button icon={icon} type={isNew ? 'dashed' : undefined} size={'large'} onClick={onIconClick} />
          <Flex vertical flex={1} style={{width: 0}}>
            <Text ellipsis>{name}</Text>
            <Text ellipsis type={'secondary'}>
              {description}
            </Text>
          </Flex>
        </Flex>
        <Flex justify={'flex-end'} align={'center'} flex={'none'}>
          {actions.map((action, index) => (
            <div key={index}>{action}</div>
          ))}
        </Flex>
      </Flex>
    </div>
  );
};

const newNodeDetails = {
  value: 'new',
  title: 'New Node',
  icon: {icon: 'QuestionOutlined', type: 'ant'},
  color: 'green',
  draggable: false,
  label: {name: 'Notification'},
};

const ItemComponent = props => {
  const {item, expandedKeys, onExpand, onCreate} = props;
  const nodeInfo = nodeDetails.find(x => x.value === item.type) || newNodeDetails;
  const expanded = expandedKeys.includes(item.id);
  const icon = expanded ? nodeInfo.iconAlt : nodeInfo.icon;
  const isNew = item.id === -1;

  const handleIconClick = e => {
    e.stopPropagation();
    if (item.type === 'group') {
      if (expanded) {
        onExpand(expandedKeys.filter(key => key !== item.id));
      } else {
        onExpand([...expandedKeys, item.id]);
      }
    }
  };

  useEffect(() => {
    GridStack.setupDragIn('.newWidget', {appendTo: 'body', helper: 'clone'});
  }, []);

  return (
    <ConditionalWrapper
      condition={nodeInfo.draggable}
      wrapper={children => (
        <DraggableItem
          id={item.id}
          label={item.name}
          data={item}
          title={item.type}
          className={'newWidget grid-stack-item'}
          gs-w={'6'}
          gs-h={'4'}
          gs-id={item.id}
          gs-type={item.type === 'series' ? 'chart' : item.type === 'timelapse' ? 'gallery' : item.type}
        >
          {children}
        </DraggableItem>
      )}
    >
      <NodeItem
        key={item.id}
        name={item.name}
        icon={<Icon {...icon} />}
        onIconClick={handleIconClick}
        isNew={isNew}
        actions={[
          item.geom && <Button type="text" icon={<Icon icon={'AimOutlined'} type={'ant'} />} />,
          item.type === 'group' && item.permission?.create && (
            <Tooltip placement={'right'} title={'Create Node'}>
              <Button
                type="text"
                icon={<Icon icon={'SisternodeOutlined'} type={'ant'} />}
                onClick={e => onCreate(e, item)}
              />
            </Tooltip>
          ),
          item.type === 'series' && (
            <Tag color={'green'}>
              {formatNumber(item.latest?.value) ?? item.latest?.text} {item.variable?.unit}
            </Tag>
          ),
          isNew && (
            <Button
              type="text"
              icon={<Icon icon={'CloseOutlined'} type={'ant'} />}
              onClick={e => onCreate(e, {...item, remove: true})}
            />
          ),
        ]}
      />
    </ConditionalWrapper>
  );
};

const useStyles = createStyles(({token, css}) => ({
  sider: css`
    height: 100%;
    overflow-y: auto;
    background: ${token.colorBgContainer} !important;
  `,
  poweredBy: css`
    position: sticky;
    bottom: 3px;
    align-self: center;
    height: 1.5rem;
    padding: 3px;
  `,
  tree: css`
    .ant-tree-switcher {
      display: none;
    }
  `,
}));

export const Component = props => {
  const {isDarkMode, themeMode} = useThemeMode();
  const {nodeId: _nodeId} = useParams();
  const nodeId = +_nodeId;
  const [searchParams] = useSearchParams();
  const [value, setValue] = useState(['all']);
  const {data: tree = [], isFetched} = useNodeFilter({filters: [...value, 'group']});
  const {updateNode} = useNodeSaveMutation();
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();
  const {styles} = useStyles();
  const treeData = useMemo(() => arrayToTree(tree), [tree]);

  useEffect(() => {
    if (!nodeId) return;
    if (!isFetched) return;
    const ancestors = findAncestors(tree, nodeId)?.map(node => node.id);
    setExpandedKeys(expandedKeys => union(expandedKeys, ancestors));
    setSelectedKeys([nodeId]);
  }, [isFetched, nodeId, tree]);

  const onNodeClick = (props, info) => {
    const {type, id} = info.node;
    return navigate(
      {
        pathname: generatePath('node/:type/:id', {type, id}),
        search: searchParams.toString(),
      },
      {unstable_viewTransition: true},
    );
  };

  const onExpand = newExpandedKeys => {
    GridStack.setupDragIn('.newWidget', {appendTo: 'body', helper: 'clone'});
    setExpandedKeys(newExpandedKeys);
    setAutoExpandParent(false);
  };

  const onCreate = (e, item) => {
    e.stopPropagation();
    const newNode = {
      id: -1,
      parent: item?.id ?? null,
      name: 'New Node',
      type: 'create',
      remove: item?.remove ?? false,
    };
    setExpandedKeys([...expandedKeys, item?.id]);
    setSelectedKeys([newNode.id]);
    updateNode(newNode);
    if (!newNode.remove) {
      navigate(
        {
          pathname: generatePath('node/:type/:id', {type: newNode.type, id: newNode.id}),
          search: createSearchParams({tab: 'info'}).toString(),
        },
        {unstable_viewTransition: true},
      );
    } else {
      navigate({pathname: 'node'}, {unstable_viewTransition: true});
    }
  };

  const onSearch = e => {
    setIsSearchLoading(true);
    onSearchChange(e);
  };

  const onSearchChange = useMemo(
    () =>
      debounce(e => {
        const value = e.target.value;
        const newSelectedKeys = tree.flatMap(item => {
          if (value && item.name.toLowerCase().includes(value.toLowerCase())) {
            return item.id;
          }
          return [];
        });
        const newExpandedKeys = tree.flatMap(item => {
          if (value && item.name.toLowerCase().includes(value.toLowerCase())) {
            return item.parent;
          }
          return [];
        });
        setSelectedKeys(newSelectedKeys);
        setExpandedKeys(newExpandedKeys);
        setAutoExpandParent(true);
        setIsSearchLoading(false);
      }, 275),
    [tree],
  );

  return (
    <Resizeable placement={'left'}>
      <Sider className={styles.sider} width={'auto'}>
        <Flex vertical justify={'space-between'} style={{padding: '10px', minHeight: '100%'}}>
          {!isFetched ? (
            <TreeSiderItemsSkeleton />
          ) : (
            <Space direction="vertical" size="middle">
              <Search placeholder="Search" allowClear onChange={onSearch} loading={isSearchLoading} />
              {tree.length ? (
                <ThemeProvider
                  themeMode={theme.themeMode}
                  theme={{
                    ...theme,
                    components: {
                      Tree: {
                        controlItemBgActive: theme.colorPrimaryHover,
                        controlItemBgHover: theme.colorPrimaryBorder,
                      },
                    },
                  }}
                >
                  <Tree
                    onExpand={onExpand}
                    expandedKeys={expandedKeys}
                    selectedKeys={selectedKeys}
                    autoExpandParent={autoExpandParent}
                    treeData={treeData}
                    titleRender={nodeData => (
                      <ItemComponent
                        item={nodeData}
                        hubId={globalThis.envault.hub}
                        expandedKeys={expandedKeys}
                        onExpand={onExpand}
                        onCreate={onCreate}
                      />
                    )}
                    fieldNames={{key: 'id', title: 'type'}}
                    onSelect={onNodeClick}
                    showLine={false}
                    showIcon={false}
                    multiple={true}
                    blockNode={true}
                    className={styles.tree}
                  />
                </ThemeProvider>
              ) : (
                <Empty
                  description={`Welcome home, let's get started`}
                  image={<Icon icon={'Empty'} type={'envault'} raw />}
                />
              )}
              <Tooltip title={'Create Node'}>
                <Button
                  type="dashed"
                  icon={<Icon icon="PlusOutlined" type={'ant'} style={{fontSize: '16px'}} />}
                  style={{width: '100%'}}
                  onClick={onCreate}
                />
              </Tooltip>
            </Space>
          )}
          <Icon
            icon={isDarkMode ? 'EnvaultPoweredByDark' : 'EnvaultPoweredBy'}
            type={'envault'}
            raw
            className={styles.poweredBy}
          />
        </Flex>
      </Sider>
    </Resizeable>
  );
};
Component.displayName = 'TreeSider';

export default Component;
