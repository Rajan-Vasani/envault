import {App, Button, Flex, Form, Layout, Popover, Tabs} from 'antd';
import {createStyles} from 'antd-style';
import Icon from 'components/atoms/Icon';
import Resizeable from 'components/resizeable';
import {useContext, useEffect} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {useCurrentNodeFromLocation} from 'services/hooks/useCurrentNodeFromLocation';
import {useNodeDeleteMutation} from 'services/hooks/useNode';
import GalleryContext from '../context/gallery';
import {GalleryConfig} from '../forms/config';
import {GalleryInfo} from '../forms/info';
const {Sider} = Layout;

const useStyles = createStyles(({token, css}) => ({
  sider: css`
    background: ${token.colorBgContainer} !important;
    display: flex;
    flex: 1;
    flex-direction: column;
    height: 100%;
    padding: 10px;
  `,
  action: css`
    position: absolute;
    z-index: 2;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 16px;
    text-align: center;
  `,
}));

export default function GalleryBuilder() {
  const {selectedNodes, isEdit, setIsEdit} = useContext(GalleryContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentNode = useCurrentNodeFromLocation();
  const {message} = App.useApp();
  const {mutate: deleteNode} = useNodeDeleteMutation({hub: globalThis.envault.hub});
  const [form] = Form.useForm();
  const {styles} = useStyles();

  const items = [
    {
      key: 'info',
      label: 'Info',
      children: <GalleryInfo />,
      forceRender: true,
    },
    {
      key: 'config',
      label: 'Config',
      children: <GalleryConfig />,
      forceRender: true,
    },
  ];

  const handleTabChange = e => {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', e);
    window.history.replaceState({}, '', url);
    window.dispatchEvent(new Event('replacestate'));
  };

  useEffect(() => {
    const handleReplaceState = () => {
      const url = new URL(window.location.href);
      const tabValue = url.searchParams.get('tab');
    };

    window.addEventListener('replacestate', handleReplaceState);

    return () => {
      window.removeEventListener('replacestate', handleReplaceState);
    };
  }, [searchParams]);

  const handleDelete = () => {
    if (currentNode?.id) {
      message.info('Deleting your gallery');
      deleteNode(
        {id: currentNode?.id},
        {
          onSuccess: () => {
            message.success('Gallery delete success!');
            navigate('/explore/gallery');
          },
        },
      );
    }
  };
  const WidgetAction = () => {
    return (
      <>
        <Button type="text" danger onClick={handleDelete}>
          Delete
        </Button>
        <Button type="text">Export</Button>
        <Button type="text">Share</Button>
        <Button type="text">Move</Button>
      </>
    );
  };
  if (!selectedNodes.length) return null;
  return (
    <Resizeable placement={'right'}>
      <Sider className={styles.sider} width={'auto'}>
        <div className="envault-module-builder">
          <Flex justify="flex-end" gap="middle">
            <Popover content={<WidgetAction />} trigger="click">
              <Button>...</Button>
            </Popover>
            <Button
              onClick={() => setIsEdit(!isEdit)}
              icon={<Icon icon={isEdit ? 'UnlockOutlined' : 'LockOutlined'} type={'ant'} />}
            />
          </Flex>
          <Tabs defaultActiveKey={searchParams.get('tab') ?? 'info'} items={items} onChange={handleTabChange} />
          <Form form={form} name="gallerySave" requiredMark={false}>
            <div className={styles.action}>
              <Button type="primary" htmlType="submit" disabled={!isEdit} block>
                {currentNode?.id ? 'Update' : 'Save'}
              </Button>
            </div>
          </Form>
        </div>
      </Sider>
    </Resizeable>
  );
}
