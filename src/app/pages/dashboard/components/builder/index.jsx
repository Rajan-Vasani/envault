import {Drawer, Form, Input} from 'antd';
import {createStyles} from 'antd-style';
import {useGetNodeById} from 'hooks/useGetNodeById';
import {Component as Chart} from 'pages/chart';
import {Component as Gallery} from 'pages/gallery';
import MapSetting from 'pages/map/widget/settings';
import {useContext, useMemo, useState} from 'react';
import DashboardContext from '../../context';

const useStyles = createStyles(({token, css}) => ({
  container: css`
    position: absolute;
    top: 43px;
    bottom: 0;
    left: 0;
    right: 0;
    background: ${token.colorFillAlter};
    border-radius: ${token.borderRadius}px;
    display: flex;
    flex-direction: column;
  `,
}));

export default function DashboardDetailBuilder({widgets}) {
  const {editWidget, setEditWidget} = useContext(DashboardContext);
  const [form] = Form.useForm();
  const currentNode = useGetNodeById(editWidget?.widgetData?.id);
  const [currentEditWidget, setCurrentEditWidget] = useState();
  const {styles} = useStyles();

  const closeEdit = () => {
    setEditWidget(undefined);
  };
  const handleMapWidgetSave = value => {
    form.setFieldsValue(value);
    form.submit();
    closeEdit();
  };
  const handleGalleryWidgetSave = value => {
    form.setFieldsValue(value);
    form.submit();
    closeEdit();
  };
  const handleChartWidgetSave = value => {
    form.setFieldsValue(value);
    form.submit();
    closeEdit();
  };

  let singleSetting;
  switch (editWidget?.type) {
    case 'chart':
      singleSetting = (
        <Chart
          series={editWidget.widgetData?.series}
          previousData={currentNode?.type === 'chart' ? currentNode : undefined}
          onSave={handleChartWidgetSave}
          closeWidgetEdit={closeEdit}
        />
      );
      break;
    case 'map':
      singleSetting = <MapSetting widget={editWidget} closeWidgetEdit={closeEdit} onSave={handleMapWidgetSave} />;
      break;
    case 'gallery':
      singleSetting = (
        <Gallery
          series={editWidget?.widgetData?.series?.map(Number)}
          previousData={currentNode?.type === 'gallery' ? currentNode : undefined}
          onSave={handleGalleryWidgetSave}
          closeWidgetEdit={closeEdit}
        />
      );
      break;

    default:
      singleSetting = '';
      break;
  }

  useMemo(() => {
    setCurrentEditWidget(prevEditWidget => widgets.find(widget => widget.id === editWidget?.id) ?? prevEditWidget);
  }, [editWidget, widgets]);

  return (
    <>
      {editWidget && (
        <div className={styles.container}>
          <Drawer
            placement={'bottom'}
            onClose={closeEdit}
            open={editWidget}
            getContainer={false}
            styles={{header: {padding: 0}, body: {padding: 0}}}
            keyboard={true}
            height={'100%'}
            closeIcon={false}
          >
            {singleSetting}
          </Drawer>
        </div>
      )}
      <Form form={form} style={{display: 'none'}} name={`widgetData${currentEditWidget?.id}`}>
        <Form.Item name="widgetData">
          <Input />
        </Form.Item>
      </Form>
    </>
  );
}
