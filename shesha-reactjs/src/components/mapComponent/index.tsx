import { Spin } from 'antd';
import React, { FC } from 'react';
import { GoogleMap, Marker, withScriptjs, withGoogleMap } from 'react-google-maps';
export interface IShaMap {
  apiKey?: string;
  center?: { lat: any; lng: any };
  zoom?: number;
}

export const ShaMap: FC<IShaMap> = ({ center, zoom, apiKey = '' }) => {
  return (
    <div>
      <MapContainer
        apiKey={apiKey}
        center={center}
        zoom={zoom}
        containerElement={<div style={{ height: `400px` }} />}
        mapElement={<div style={{ height: `100%` }} />}
        googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=3.exp&libraries=geometry,drawing,places`}
        loadingElement={
          <div>
            <Spin spinning />
          </div>
        }
      />
    </div>
  );
};

export const MapContainer = withScriptjs(
  withGoogleMap(({ center = { lat: 0, lng: 0 }, zoom = 8 }: IShaMap) => {
    const position = { lat: parseInt(center.lat), lng: parseInt(center.lng) };

    return (
      <GoogleMap zoom={zoom} center={position}>
        <Marker position={position}></Marker>
      </GoogleMap>
    );
  })
);
