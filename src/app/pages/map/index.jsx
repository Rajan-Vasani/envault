import {Layout} from 'antd';
import {DraggableOverlay} from 'components/draggable/overlay';
import {Droppable} from 'components/droppable';
import Resizeable from 'components/resizeable';
import {useGroupGeo} from 'hooks/useGroup';
import {useNodeDescendants} from 'hooks/useNode';
import {useNodeContext} from 'layouts/node/context';
import GroupControl from 'pages/group/widget';
import MapView from 'pages/map/components/view';
import {useMemo, useRef, useState} from 'react';
import {generatePath, useLocation, useNavigate} from 'react-router-dom';
const {Content} = Layout;

export const Component = props => {
  const {closeWidgetEdit} = props;
  const {nodeAttrs} = useNodeContext();
  const {data: descendants} = useNodeDescendants({id: nodeAttrs?.id});
  const descendantIds = descendants?.flatMap(n => (n.type === 'group' ? n.id : []));
  const {data: geom} = useGroupGeo({
    select: data => data.features.filter(({properties}) => [+nodeAttrs?.id, ...descendantIds].includes(properties.id)),
  });
  const [visible, setVisible] = useState();
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const acceptNodeTypes = ['series', 'group'];

  const handleResizeableClose = () => {
    setVisible(undefined);
  };

  const geomData = useMemo(() => {
    if (geom?.length) {
      return geom.map(item => ({coordinates: item.geometry.coordinates, properties: item.properties}));
    } else {
      return [];
    }
  }, [geom]);

  const handleMarkerClick = item => {
    const path = generatePath('../group/:id', {id: item.properties.id});
    navigate({pathname: path, search: location.search});
  };

  return (
    <>
      <Droppable key={'map-droppable'} id={'map-droppable'} acceptedTypes={['device', 'group']}>
        <MapView data={geomData} handleMarkerClick={handleMarkerClick} />
        {visible && (
          <Resizeable
            placement={'bottom'}
            onClose={handleResizeableClose}
            parent={containerRef?.current}
            stop={[0.4, 0.6, 1]}
          >
            <GroupControl nodeData={visible} />
          </Resizeable>
        )}
      </Droppable>
      <DraggableOverlay />
    </>
  );
};
Component.displayName = 'Map';
