import {Skeleton} from 'antd';
import {Component as Gallery} from 'app/pages/gallery';
import {useNodeFilter} from 'app/services/hooks/useNode';
import {useParams} from 'react-router-dom';

export const Component = props => {
  const {nodeId: _nodeId} = useParams();
  const nodeId = +_nodeId;
  const {data: timelapseData} = useNodeFilter({filters: ['gallery']});
  const data = timelapseData?.find(node => node.id === nodeId);

  return (
    <>
      {!data && (
        <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Skeleton.Image active={true} size="large" />
        </div>
      )}
      {data && <Gallery previousData={data} />}
    </>
  );
};
Component.displayName = 'GalleryDetail';
export default Component;
