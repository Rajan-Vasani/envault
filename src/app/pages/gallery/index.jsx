import {SearchOutlined} from '@ant-design/icons';
import {useDroppable} from '@dnd-kit/core';
import {useQueryClient} from '@tanstack/react-query';
import {App, Form, Layout, TreeSelect, Typography} from 'antd';
import {createStyles} from 'antd-style';
import Icon from 'components/atoms/Icon';
import {DraggableOverlay} from 'components/draggable/overlay';
import {Droppable} from 'components/droppable';
import {API_QUERY} from 'constant/query';
import {useCurrentNodeFromLocation} from 'hooks/useCurrentNodeFromLocation';
import {useHub} from 'hooks/useHub';
import {useNodeFilter, useNodeSaveMutation} from 'hooks/useNode';
import NodeHeader from 'layouts/node/components/header';
import {createContext, useContext} from 'react';
import {useLocation} from 'react-router-dom';
import GalleryBuilder from './GalleryBuilder';
import GalleryPreview from './GalleryPreview';
import GalleryContext, {GalleryContextProvider} from './context/gallery';
const {Text} = Typography;
const {Content} = Layout;

const useStyles = createStyles(({token, css}, {isOver}) => ({
  helper: css`
    display: flex;
    position: absolute;
    top: 50%;
    left: 50%;
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

const GalleryDroppable = () => {
  const {data: tree} = useNodeFilter({filters: ['group', 'timelapse']});
  const {selectedNodes, setSelectedNodes} = useContext(GalleryContext);
  const {isOver} = useDroppable({
    id: 'timelapse-droppable',
  });
  const {styles} = useStyles({isOver});

  const handleNodeSelect = v => {
    const nodeItem = tree.filter(item => v.includes(item.id));
    if (nodeItem.every(node => node.type === 'timelapse')) {
      setSelectedNodes(nodeItem);
    } else {
      alert('Please select a timelapse node');
    }
  };

  if (selectedNodes.length) {
    return null;
  }

  return (
    <div className={styles.helper} id={'timelapse-droppable'}>
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
            &nbsp; Browse timelapse...
          </>
        }
        treeData={tree}
        treeDataSimpleMode={{
          id: 'id',
          pId: 'parent',
          rootPId: null,
        }}
        showSearch
        multiple
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

export const Component = props => {
  const location = useLocation();
  const timelapseFromParam = location.state?.type === 'timelapse' ? +location.state?.id : null;
  const {previousData, series = [], onSave, closeWidgetEdit} = props;
  const {data: hub} = useHub();
  const {message} = App.useApp();
  const queryClient = useQueryClient();
  const {mutate: saveNode} = useNodeSaveMutation();
  const currentNodeFromLocation = useCurrentNodeFromLocation();

  const gallery = createContext();
  gallery.type = 'gallery';
  gallery.series = series;
  gallery.previousData = currentNodeFromLocation?.type === 'gallery' ? currentNodeFromLocation : previousData;
  gallery.series = timelapseFromParam ? [timelapseFromParam] : series;

  const onFormFinish = async (name, {forms}) => {
    if (name === 'gallerySave') {
      message.info('Saving your gallery');
      const value = forms['form-gallery'].getFieldsValue(true);
      const config = forms['galleryConfig'].getFieldsValue(true);
      const {timeRange, dataSource, activeTimelapse, filterLabel} = config;
      const dataGallery = {
        ...value,
        hub: hub[0]?.id,
        type: 'gallery',
        config: {
          activeTimelapse,
          timeRange,
          filterLabel,
        },
        data: dataSource.reduce(
          (a, v) => ({
            ...a,
            [v]: {
              pathname: `/api/series-data`,
              query: `hub=${hub[0]?.id}&series=${v}from=${timeRange?.from.valueOf()}&to=${timeRange?.to.valueOf()}`,
            },
          }),
          {},
        ),
      };
      saveNode(
        {type: 'gallery', data: dataGallery},
        {
          onSuccess: data => {
            message.success('Gallery save success!');
            queryClient.invalidateQueries({queryKey: [API_QUERY.NODE_DATA]});
            if (onSave) {
              onSave({id: data[0].id});
            }
          },
        },
      );
    }
  };

  return (
    <GalleryContextProvider values={gallery}>
      <Layout style={{height: '100%'}}>
        <Form.Provider onFormFinish={onFormFinish}>
          <NodeHeader closeWidgetEdit={closeWidgetEdit} nodeId={previousData?.id} />
          <Layout>
            <Content>
              <Droppable key={'timelapse-droppable'} id={'timelapse-droppable'} acceptedTypes={['timelapse']}>
                <GalleryDroppable />
                <GalleryPreview />
              </Droppable>
              <DraggableOverlay />
            </Content>
            <GalleryBuilder closeWidgetEdit={closeWidgetEdit} onSave={onSave} />
          </Layout>
        </Form.Provider>
      </Layout>
    </GalleryContextProvider>
  );
};

Component.displayName = 'Gallery';
