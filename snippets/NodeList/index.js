import {Button, Collapse, Skeleton} from 'antd';
import Icon from 'app/components/atoms/Icon';
import {nodeIcons} from 'app/components/helper/helper';
import DraggableItem from 'components/draggable/DraggableItem';
import {generateId} from 'components/helper/common';
import {useHub} from 'hooks/useHub';
import {useNestedNode} from 'hooks/useNode';
import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';

const NodeList = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const {data: hub} = useHub();
  const {data: nestedTree} = useNestedNode(hub[0]);

  const chartPath = 'explore/chart';
  const mapPath = 'explore/map';
  const reportPath = 'explore/dashboard';
  const galleryPath = 'explore/gallery';

  const TreeHeader = ({item}) => {
    return <div className="envault-nav-nodelist-item-header">{item?.name}</div>;
  };

  const onItemClick = item => {
    switch (item.type) {
      case 'group':
        navigate(`/${mapPath}?groupid=${item.id}`);
        break;
      case 'dashboard':
        navigate(`/${reportPath}/${item.id}`);
        break;
      case 'chart':
        navigate(`/${chartPath}/${item.id}`);
        break;
      case 'series':
        navigate(`/${chartPath}?seriesid=${item.id}`);
        break;
      case 'timelapse':
        navigate(`/${galleryPath}/${item.id}`);
        break;
      default:
        navigate('/');
        break;
    }
  };

  const ItemComponent = props => {
    const {item} = props;
    switch (item.type) {
      case 'series':
      case 'chart':
      case 'timelapse':
        return (
          <div className="envault-nav-nodelist-item">
            <DraggableItem
              id={item.id}
              label={item.name}
              data={item}
              style={{display: 'flex', alignItems: 'center', flex: '1'}}
            >
              <div className="envault-nav-nodelist-item-icon">{nodeIcons[item?.type]}</div>
              <div className="envault-nav-nodelist-item-content">{item?.name}</div>
            </DraggableItem>
            <Button
              onClick={() => onItemClick(item)}
              type="link"
              shape="default"
              icon={<Icon icon="EyeOutlined" type={'ant'} />}
            />
          </div>
        );
      case 'dashboard':
        return (
          <div className="envault-nav-nodelist-item">
            <div style={{display: 'flex', alignItems: 'center', flex: 1}}>
              <div className="envault-nav-nodelist-item-icon">{nodeIcons[item?.type]}</div>
              <div className="envault-nav-nodelist-item-content">{item?.name}</div>
            </div>
            <Button
              onClick={() => onItemClick(item)}
              type="link"
              shape="default"
              icon={<Icon icon="EyeOutlined" type={'ant'} />}
            />
          </div>
        );
      // case 'group':
      //   return (
      //     <div className="envault-nav-nodelist-item">
      //       <div style={{display: 'flex', alignItems: 'center', flex: 1}}>
      //         <div className="envault-nav-nodelist-item-icon">{nodeIcons[item?.type]}</div>
      //         <div className="envault-nav-nodelist-item-content">{item?.name}</div>
      //       </div>
      //       <Button
      //         onClick={() => onItemClick(item)}
      //         type="link"
      //         shape="default"
      //         icon={<Icon icon="AimOutlined" type={'ant'} />}
      //       />
      //     </div>
      //   );

      default:
        return (
          <div className="envault-nav-nodelist-item">
            <div className="envault-nav-nodelist-item-icon">{nodeIcons[item?.type]}</div>
            <div className="envault-nav-nodelist-item-content">{item?.name}</div>
          </div>
        );
    }
  };

  useEffect(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 300);
  }, [setLoading]);

  const {Panel} = Collapse;

  const renderNode = node => {
    return node.children && node.children.length ? (
      <Collapse
        style={{padding: '0px'}}
        ghost
        expandIcon={panelProps => <div className="envault-nav-nodelist-item-icon">{nodeIcons[node?.type]}</div>}
        className="envault-nav-nodelist-collapse"
      >
        <Panel style={{margin: '5px 0 0 0'}} header={<TreeHeader item={node} />}>
          {node.children.map(nodeChild => (
            <div key={nodeChild.id}>{renderNode(nodeChild)}</div>
          ))}
        </Panel>
      </Collapse>
    ) : (
      <ItemComponent item={node} key={generateId()} />
    );
  };

  const ArrowDown = () => {
    return <span className="envault-icon-arrowDown"></span>;
  };
  const Circle = () => {
    return <span className="envault-icon-circle"></span>;
  };
  return (
    <>
      {loading ? (
        <>
          <br />
          <Skeleton.Button block active />
          <br />
          <br />
          <Skeleton.Button block active />
          <br />
          <br />
          <Skeleton.Button block active />
        </>
      ) : (
        // <div className="envault-nav-nodelist">
        //   {viewGroup === 'list' &&
        //     (filterTree.length ? filterTree : tree).map((option, index) => (
        //       <ItemComponent key={index} item={option} />
        //     ))}
        //   {viewGroup === 'tree' &&
        nestedTree.map(node => <div key={node.id}>{renderNode(node)}</div>)
      )}
    </>
  );
};

export default NodeList;
