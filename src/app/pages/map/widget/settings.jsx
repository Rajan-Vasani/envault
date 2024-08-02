import {Button, Form, Input, Layout, Select} from 'antd';
import {createStyles, useTheme} from 'antd-style';
import NodeHeader from 'app/layouts/node/header';
import Resizeable from 'components/resizeable';
import {useGroupGeo} from 'hooks/useGroup';
import MapView from 'pages/map/components/view';
import {useEffect, useRef, useState} from 'react';
const {Content, Sider} = Layout;

const useStyles = createStyles(({token, css}) => ({
  siderStyle: css`
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

const MapSetting = props => {
  const {widget, closeWidgetEdit, onSave} = props;
  const sidebarRef = useRef(null);
  const token = useTheme();
  const {data: groupData, isPending} = useGroupGeo();
  const [location, setLocation] = useState([]);
  const [form] = Form.useForm();
  const zoom = Form.useWatch('zoom', {form, preserve: true});
  const {styles} = useStyles();

  const handleMapSetting = event => {
    if (['lat', 'lon'].includes(event[0].name[0])) {
      form.setFieldsValue({group: undefined});
    }
    const mapConfig = form.getFieldsValue();
    setLocation([{coordinates: [mapConfig.lat, mapConfig.lon]}]);
  };

  const handlePointChange = value => {
    const selectedGroup = groupData.features.find(group => group.properties.id === value);
    if (selectedGroup) {
      const {geometry} = selectedGroup;
      const selectedLat = geometry.coordinates[0];
      const selectedLon = geometry.coordinates[1];
      form.setFieldsValue({lat: selectedLat, lon: selectedLon});
      setLocation([{coordinates: [selectedLat, selectedLon]}]);
    }
  };

  useEffect(() => {
    const {group, lat, lon, zoom} = widget.widgetData;
    let defaultLat = lat;
    let defaultLon = lon;
    if (group && groupData?.features.length > 0) {
      const selectedGroup = groupData.features.find(item => item.properties.id === group);
      defaultLat = selectedGroup.geometry.coordinates[0];
      defaultLon = selectedGroup.geometry.coordinates[1];
    }
    setLocation([{coordinates: [defaultLat, defaultLon]}]);
    form.setFieldsValue({lat: defaultLat, lon: defaultLon, zoom: zoom, group: group});
  }, [widget, form, groupData]);

  const handleMapSettingSave = () => {
    const mapConfig = form.getFieldsValue();
    onSave(mapConfig);
  };

  return (
    <Layout style={{height: '100%'}}>
      <NodeHeader closeWidgetEdit={closeWidgetEdit} />
      <Layout>
        <Content>
          <MapView data={location} zoom={zoom} />
        </Content>
        <Resizeable
          placement="right"
          parent={sidebarRef?.current}
          initWidth="300"
          collapseButtonStyle={{left: '-16px'}}
        >
          <Sider className={styles.sider} width={'auto'}>
            <Form form={form} onFieldsChange={handleMapSetting} name={`map-${widget.id}`} layout="vertical">
              <Form.Item label="Group" name="group">
                <Select
                  showSearch
                  allowClear
                  style={{width: '100%'}}
                  placeholder="Please select"
                  onChange={handlePointChange}
                  options={groupData?.features.map(point => ({
                    label: point.properties.name,
                    value: point.properties.id,
                  }))}
                  loading={isPending}
                  value={widget?.group?.properties?.id}
                />
              </Form.Item>
              <Form.Item label="Latitude" name="lat">
                <Input type="number" />
              </Form.Item>
              <Form.Item label="Longitude" name="lon">
                <Input type="number" />
              </Form.Item>
              <Form.Item label="Zoom" name="zoom">
                <Input type="number" />
              </Form.Item>
              <div className={styles.action}>
                <Button type="primary" onClick={handleMapSettingSave} block>
                  Save
                </Button>
              </div>
            </Form>
          </Sider>
        </Resizeable>
      </Layout>
    </Layout>
  );
};

export default MapSetting;
