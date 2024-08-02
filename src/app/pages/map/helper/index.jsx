import {LatLng, LatLngBounds} from 'leaflet';

export const defaultPolygonStyle = {
  color: '#f00',
  strokeColor: '#f00',
  fillColor: '#f00',
  strokeOpacity: 0.8,
  strokeWeight: 2,
  fillOpacity: 0.35,
  weight: 2,
  opacity: 0.8,
};

export const getCustomMarkerIcon = data => {
  const icon = data?.indicator_type;
  const iconColor = data?.indicator_color;

  if (icon === 'icon' || icon === 'pinpoint') return;

  return {icon, iconColor};
};

export const getPolygonStyle = data => {
  const styleOverride = {
    weight: 2,
    opacity: 0.8,
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillOpacity: 0.35,
  };
  if (data?.indicator_color?.length === 4 || data?.indicator_color?.length === 7) {
    styleOverride.fillColor = data?.indicator_color;
    styleOverride.strokeColor = data?.indicator_color;
    styleOverride.color = data?.indicator_color;
  }
  return styleOverride;
};

export const getviewablecenter = (maps, map, mapContainer, polygons = [], points = []) => {
  if (points.length < 1 && polygons.length < 1) {
    return false;
  }
  let extended = 0;
  const bounds = new maps.LatLngBounds();
  (polygons ?? [])
    .filter(polygon => polygon?.geometry?.boundary?.length)
    .map(polygon => {
      polygon.geometry.boundary
        .filter(point => point[0] && point[1])
        .map(point => {
          bounds.extend(
            new maps.LatLng({
              lat: Number(point[1]),
              lng: Number(point[0]),
            }),
          );
          extended++;
        });
    });
  (points ?? [])
    .filter(point => point?.geometry?.coordinates[0] && point?.geometry?.coordinates[1])
    .map(point => {
      bounds.extend(
        new maps.LatLng({
          lat: Number(point.geometry.coordinates[1]),
          lng: Number(point.geometry.coordinates[0]),
        }),
      );
      extended++;
    });
  const zoom = getboundszoom(bounds, {
    width: mapContainer.current.clientWidth,
    height: mapContainer.current.clientHeight,
  });
  const returnable = {};
  if (extended) {
    if (!isNaN(zoom) && isFinite(zoom)) {
      returnable.zoom = zoom;
    }
    returnable.lat = bounds.getCenter().lat();
    returnable.lng = bounds.getCenter().lng();
  }
  return {
    ...returnable,
  };
};

export const getlocalecenter = (map, callback) => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      callback({lat: position.coords.latitude, lng: position.coords.longitude});
    });
  } else {
    /* Browser doesn't support/allow Geolocation detection */
  }
};

export const getpolygoncenter = (maps, polygon) => {
  const bounds = new maps.LatLngBounds();
  polygon?.getPath()?.forEach(function (element, index) {
    bounds.extend(element);
  });
  return bounds.getCenter();
};

export const sortpolygon = points => {
  function squaredPolar(point, centre) {
    return [
      Math.atan2(point[1] - centre[1], point[0] - centre[0]),
      (point[0] - centre[0]) ** 2 + (point[1] - centre[1]) ** 2, // Square of distance
    ];
  }
  // Get "centre of mass"
  const centre = [
    points.reduce((sum, p) => sum + p[0], 0) / points.length,
    points.reduce((sum, p) => sum + p[1], 0) / points.length,
  ];

  // Sort by polar angle and distance, centered at this centre of mass.
  for (const point of points) point.push(...squaredPolar(point, centre));
  points.sort((a, b) => a[2] - b[2] || a[3] - b[3]);
  // Throw away the temporary polar coordinates
  for (const point of points) point.length -= 2;
  return points;
};

export const attachpolygoncontrols = (maps, map, polygon, polygonDOM, callback = () => {}) => {
  const polygonDOMPoints = polygonDOM.getPath();
  // New point
  polygonDOMPoints?.addListener('insert_at', callback);
  // Point was removed
  polygonDOMPoints?.addListener('remove_at', callback);
  // moved
  polygonDOMPoints?.addListener('set_at', callback);

  class DeleteMenu extends maps.OverlayView {
    constructor() {
      super();
      this.div_ = document.createElement('div');
      this.div_.className = 'map-delete-menu';
      this.div_.innerHTML = 'Delete';
      const menu = this;
      maps.event.addDomListener(this.div_, 'click', () => {
        menu.removeVertex();
      });
    }

    onAdd() {
      const deleteMenu = this;
      const map = this.getMap();
      this.getPanes().floatPane.appendChild(this.div_);
      // mousedown anywhere on the map except on the menu div will close the
      // menu.
      this.divListener_ = maps.event.addDomListener(
        map.getDiv(),
        'mousedown',
        e => {
          if (e.target != deleteMenu.div_) {
            deleteMenu.close();
          }
        },
        true,
      );
    }

    onRemove() {
      if (this.divListener_) {
        maps.event.removeListener(this.divListener_);
      }
      this.div_.parentNode.removeChild(this.div_);
      // clean up
      this.set('position', null);
      this.set('path', null);
      this.set('vertex', null);
    }

    close() {
      this.setMap(null);
    }

    draw() {
      const position = this.get('position');
      const projection = this.getProjection();

      if (!position || !projection) {
        return;
      }
      const point = projection.fromLatLngToDivPixel(position);
      this.div_.style.top = point.y + 'px';
      this.div_.style.left = point.x + 'px';
    }

    // Opens the menu at a vertex of a given path.

    open(map, path, vertex) {
      this.set('position', path.getAt(vertex));
      this.set('path', path);
      this.set('vertex', vertex);
      this.setMap(map);
      this.draw();
    }

    /**
     * Deletes the vertex from the path.
     */
    removeVertex() {
      const path = this.get('path');
      const vertex = this.get('vertex');

      if (!path || vertex == undefined) {
        this.close();
        return;
      }
      path.removeAt(vertex);
      this.close();
    }
  }

  const deleteMenu = new DeleteMenu();
  maps.event?.addListener(polygonDOM, 'contextmenu', e => {
    if (polygonDOM.getPath().length <= 3) {
      return;
    }
    // Check if click was on a vertex control point
    if (e.vertex == undefined) {
      return;
    }
    deleteMenu.open(map, polygonDOM.getPath(), e.vertex);
  });
};

export const getboundszoom = (bounds, mapDim, ZOOM_MAX = 18) => {
  const WORLD_DIM = {height: 256, width: 256};

  function latRad(lat) {
    const sin = Math.sin((lat * Math.PI) / 180);
    const radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
    return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
  }

  function zoom(mapPx, worldPx, fraction) {
    return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
  }

  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();

  const latFraction = (latRad(ne.lat()) - latRad(sw.lat())) / Math.PI;

  const lngDiff = ne.lng() - sw.lng();
  const lngFraction = (lngDiff < 0 ? lngDiff + 360 : lngDiff) / 360;

  const latZoom = zoom(mapDim.height, WORLD_DIM.height, latFraction);
  const lngZoom = zoom(mapDim.width, WORLD_DIM.width, lngFraction);

  return Math.min(latZoom, lngZoom, ZOOM_MAX);
};

export const generateboundary = (data, offset = 0.05) => {
  const latitude = data?.latitude;
  const longitude = data?.longitude;
  const boundary = [];
  if (data && data?.bounds_east && data?.bounds_north && data?.bounds_south && data?.bounds_west) {
    boundary.push([parseFloat(data?.bounds_east), parseFloat(data?.bounds_north)]);
    boundary.push([parseFloat(data?.bounds_west), parseFloat(data?.bounds_north)]);
    boundary.push([parseFloat(data?.bounds_west), parseFloat(data?.bounds_south)]);
    boundary.push([parseFloat(data?.bounds_east), parseFloat(data?.bounds_south)]);
  } else if (latitude && longitude) {
    boundary.push([parseFloat(longitude) + offset, parseFloat(latitude) + offset]);
    boundary.push([parseFloat(longitude) + offset, parseFloat(latitude) - offset]);
    boundary.push([parseFloat(longitude) - offset, parseFloat(latitude) - offset]);
    boundary.push([parseFloat(longitude) - offset, parseFloat(latitude) + offset]);
  }
  return boundary;
};

export const getLeafletBoundZoom = (bounds, mapDim, ZOOM_MAX = 12) => {
  const WORLD_DIM = {height: 256, width: 256};

  function latRad(lat) {
    const sin = Math.sin((lat * Math.PI) / 180);
    const radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
    return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
  }

  function zoom(mapPx, worldPx, fraction) {
    return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
  }

  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();

  const latFraction = (latRad(ne.lat) - latRad(sw.lat)) / Math.PI;

  const lngDiff = ne.lng - sw.lng;
  const lngFraction = (lngDiff < 0 ? lngDiff + 360 : lngDiff) / 360;

  const latZoom = zoom(mapDim.height, WORLD_DIM.height, latFraction);
  const lngZoom = zoom(mapDim.width, WORLD_DIM.width, lngFraction);

  return Math.min(latZoom, lngZoom, ZOOM_MAX);
};

export const getCenterView = (mapContainer, polygons = [], points = []) => {
  if (points.length < 1 && polygons.length < 1) {
    return false;
  }
  let extended = 0;
  const bounds = new LatLngBounds();
  (polygons ?? [])
    .filter(polygon => polygon?.geometry?.boundary?.length)
    .map(polygon => {
      polygon.geometry.boundary
        .filter(point => point[0] && point[1])
        .map(point => {
          bounds.extend(new LatLng(Number(point[1]), Number(point[0])));
          extended++;
        });
    });
  (points ?? [])
    .filter(point => point?.geometry?.coordinates[0] && point?.geometry?.coordinates[1])
    .map(point => {
      bounds.extend(new LatLng(Number(point.geometry.coordinates[1]), Number(point.geometry.coordinates[0])));
      extended++;
    });
  let zoom = 6;
  if (bounds.getNorthEast() && bounds.getSouthWest()) {
    zoom = getLeafletBoundZoom(bounds, {
      width: mapContainer.current.clientWidth,
      height: mapContainer.current.clientHeight,
    });
  }
  const returnable = {};
  if (extended) {
    if (!isNaN(zoom) && isFinite(zoom)) {
      returnable.zoom = zoom;
    }
    returnable.bounds = bounds;
  }
  return {
    ...returnable,
  };
};

export const clearHead = () => {
  const head = document.getElementsByTagName('head')[0];
  const scripts = head.getElementsByTagName('script');
  const delscripts = [];
  for (const script of scripts) {
    if (script.outerHTML.indexOf('windy') !== -1) {
      delscripts.push(script);
    }
  }
  for (const script of delscripts) {
    script.parentNode.removeChild(script);
  }
  const links = head.getElementsByTagName('link');
  const dellinks = [];
  for (const link of links) {
    if (link.outerHTML.indexOf('windy') !== -1) {
      dellinks.push(link);
    }
  }
  for (const link of dellinks) {
    link.parentNode.removeChild(link);
  }
  const styles = head.getElementsByTagName('style');
  const delstyles = [];
  for (const style of styles) {
    if (style.outerHTML.indexOf('www.windy.com') !== -1) {
      delstyles.push(style);
    }
  }
  for (const style of delstyles) {
    style.parentNode.removeChild(style);
  }
};

export const clearWindy = () => {
  const www = window['W'];
  delete window['W'];
  window['W'] = {
    version: '23.1.1',
    assets: '23.1.1.lib.baaa',
    sha: 'a2400baaa',
    target: 'lib',
    build: '2020-01-27, 09:01',
  };
};
