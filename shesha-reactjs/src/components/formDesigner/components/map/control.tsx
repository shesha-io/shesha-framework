import { DownOutlined } from '@ant-design/icons';
import { Checkbox, Dropdown, Menu } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import { MapContainer, Polygon, TileLayer } from 'react-leaflet';
import { useDeepCompareEffect } from 'react-use';
import { MarkerContent } from './components/marker';
import { useMetaMapMarker } from './hooks';
import { ICoordinates, IMapProps } from './interfaces';
import {
  getCenter,
  getLayerMarkerOptions,
  getMapContainerStyle,
  getMarkerPoints,
  getPolygonPoints,
  getSinglePoint,
  getZoom,
} from './utils';

import 'leaflet/dist/leaflet.css';

export const MapControl: FC<IMapProps> = (props) => {
  const { layers } = props;

  const { layerMarkers, fetchData } = useMetaMapMarker(layers);

  useEffect(() => fetchData(), []);

  useDeepCompareEffect(() => {
    setPoints({
      markerPoints: getMarkerPoints(layerMarkers, defaultChecked),
      polygonPoints: getPolygonPoints(layerMarkers, defaultChecked),
    });
  }, [layerMarkers]);

  const [{ markerPoints, polygonPoints }, setPoints] = useState<ICoordinates>({
    markerPoints: [],
    polygonPoints: [],
  });

  const onChange = (checked: string[]) => {
    setPoints({
      markerPoints: getMarkerPoints(layerMarkers, checked),
      polygonPoints: getPolygonPoints(layerMarkers, checked),
    });
  };

  const defaultChecked = getLayerMarkerOptions(layers).map((item) => item.value);

  const menu = (
    <Menu style={{ display: 'block', padding: '20px', opacity: 0.9 }}>
      <Checkbox.Group options={getLayerMarkerOptions(layers)} onChange={onChange} defaultValue={defaultChecked} />
    </Menu>
  );

  return (
    <>
      {layers.length && (
        <div
          style={{
            position: 'absolute',
            zIndex: 1000,
            right: '10px',
          }}
        >
          <Dropdown overlay={menu}>
            <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
              Layers <DownOutlined />
            </a>
          </Dropdown>
        </div>
      )}

      <MapContainer
        style={getMapContainerStyle(props)}
        center={getCenter(props)}
        zoom={getZoom(props)}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">Shesha</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {getSinglePoint(props).map(({ position, color, icon }) => (
          <MarkerContent position={position} color={color} icon={icon} />
        ))}

        {markerPoints?.map((marker, index) => (
          <MarkerContent
            key={index}
            color={marker.color}
            size={marker.size}
            icon={marker.icon}
            position={marker.position}
          />
        ))}

        {polygonPoints?.map((polygon) => (
          <Polygon positions={[polygon]} />
        ))}
      </MapContainer>
    </>
  );
};

export default MapControl;
