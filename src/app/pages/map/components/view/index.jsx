import {createStyles} from 'antd-style';
import {useSize} from 'components/resizeable';
import {LatLng, Point, divIcon, latLngBounds} from 'leaflet';
import 'leaflet/dist/leaflet.css';
import LeafletMarker from 'pages/map/components/marker';
import {MAP_DEFAULT_POSITION} from 'pages/map/config';
import {useEffect, useRef} from 'react';
import {renderToString} from 'react-dom/server';
import {LayersControl, MapContainer, Marker, ScaleControl, TileLayer, Tooltip, useMap} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
const {BaseLayer} = LayersControl;

export const useStyles = createStyles(({token, css}) => ({
  container: css`
    height: 100%;
    width: 100%;
  `,
  map: css`
    height: 100%;
    width: 100%;
    &.leaflet-container {
      border-radius: ${token.borderRadius}px;
      z-index: 1;
    }
  `,
}));

const MapControl = props => {
  const {zoom, width, height, data = [], handleMarkerClick = () => {}} = props;
  const map = useMap();

  const markerIcon = divIcon({
    className: 'custom icon',
    html: renderToString(<LeafletMarker properties={{}} />),
    iconSize: new Point(30, 30),
  });

  useEffect(() => {
    if (map) {
      map.invalidateSize();
    }
  }, [width, height, map]);

  useEffect(() => {
    if (map) {
      map.setZoom(zoom ?? MAP_DEFAULT_POSITION.zoom);
    }
  }, [zoom, map]);

  useEffect(() => {
    if (map && data.length > 0) {
      let markerBounds = latLngBounds();
      data.forEach(item => {
        markerBounds.extend(new LatLng(item.coordinates[0], item.coordinates[1]));
      });
      map.flyToBounds(markerBounds, {padding: [20, 20]});
    }
  }, [data, map]);

  return (
    <MarkerClusterGroup>
      {data?.map(item => (
        <Marker
          key={`${item?.properties?.id}`}
          position={item.coordinates}
          icon={markerIcon}
          eventHandlers={{
            click: () => handleMarkerClick(item),
          }}
        >
          <Tooltip direction="top">
            <span>{item?.properties?.name}</span>
          </Tooltip>
        </Marker>
      ))}
    </MarkerClusterGroup>
  );
};

const MapView = props => {
  const {zoom, data = [], handleMarkerClick = () => {}} = props;
  const mapRef = useRef(null);
  const {width, height} = useSize(mapRef);
  const {styles} = useStyles();

  return (
    <div className={styles.container} ref={mapRef}>
      <MapContainer
        center={MAP_DEFAULT_POSITION.coordinates}
        zoom={zoom ?? MAP_DEFAULT_POSITION.zoom}
        className={styles.map}
        zoomControl={false}
      >
        <ScaleControl position="bottomleft" imperial={false} />
        <LayersControl position="topright">
          <BaseLayer checked name="ArcGIS">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS,  AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
              maxZoom={18}
              maxNativeZoom={18}
            />
          </BaseLayer>
          <BaseLayer name="OpenStreetMap">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              maxZoom={19}
              maxNativeZoom={19}
            />
          </BaseLayer>
        </LayersControl>
        <MapControl zoom={zoom} width={width} height={height} data={data} handleMarkerClick={handleMarkerClick} />
      </MapContainer>
    </div>
  );
};

export default MapView;
