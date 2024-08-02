import {Form} from 'antd';
import MapView from 'app/pages/map/components/view';
import 'leaflet/dist/leaflet.css';
import {MAP_DEFAULT_POSITION} from 'pages/map/config';
import {useEffect, useState} from 'react';
import {useGroupGeo} from 'services/hooks/useGroup';

function MapControl() {
  const form = Form.useFormInstance();
  const widgetData = Form.useWatch('widgetData', {form, preserve: true});
  const {data: groupData} = useGroupGeo();
  const [location, setLocation] = useState([{coordinates: MAP_DEFAULT_POSITION.coordinates}]);

  useEffect(() => {
    if (widgetData?.group && groupData?.features.length > 0) {
      const {group} = widgetData;
      const selectedGroup = groupData.features.find(item => item.properties.id === group);
      setLocation([{coordinates: selectedGroup.geometry.coordinates, properties: selectedGroup.properties}]);
    }
  }, [widgetData, groupData]);

  return <MapView data={location} />;
}
export default MapControl;
