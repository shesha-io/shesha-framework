import React, { FC, useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Polygon, TileLayer } from 'react-leaflet';
import { ICoordinates, ILayerMarker, IMapProps } from './interfaces';
import { DownOutlined } from '@ant-design/icons';
import { MarkerContent } from './markers';
import { MapContent, evaluateFilters, getData, getPolgonAndMarkerData, mapClicked, markerClicked } from './utils';
import { Checkbox, Dropdown, Menu } from 'antd';
import { useFormData, useGlobalState } from 'providers';
import { ILayerFormModel } from 'providers/layersConfigurator/models';

export const Map: FC<IMapProps> = ({
  icon,
  color,
  width,
  height,
  defaultViewPortLat,
  defaultViewPortLng,
  defaultViewPortZoom,
  longitude,
  latitude,
  layers,
}) => {
  const mapRef = useRef();
  const { data: formData } = useFormData();
  const { globalState } = useGlobalState();
  const [{ layerMarkers, polygonData }, setCoordinates] = useState<ICoordinates>({
    layerMarkers: [],
    polygonData: [],
  });

  const zoom = defaultViewPortZoom ? defaultViewPortZoom : 6;
  const containerStyle = {
    width: width ? `${width}%` : '100%',
    height: height ? `${height}vh` : '100vh',
  };

  const center = {
    lat: defaultViewPortLat ? (defaultViewPortLat as number) : -28.4792625,
    lng: defaultViewPortLng ? (defaultViewPortLng as number) : 24.6727135,
  };

  const singlePoint = [
    {
      color: color,
      icon: icon,
      position: {
        lat: latitude,
        lng: longitude,
      },
    },
  ];

  function onChange(checkedValues: string[]) {
    console.log('LOG:: Checked Values', checkedValues, layerMarker);
    setCoordinates({
      polygonData: getPolgonAndMarkerData(checkedValues, layerMarker, 'polygon'),
      layerMarkers: getPolgonAndMarkerData(checkedValues, layerMarker, 'points'),
    });
  }

  let layerMarker: ILayerMarker[] = layers?.map((item, index) => {
    console.log(`LOG:: layer ${index}`, item);
    const evaluatedFilters = evaluateFilters(item, formData, globalState);
    console.log('LOG:: filters', evaluatedFilters);
    const layerData = getData(
      item.dataSource,
      item.entityType,
      item.longitude,
      item.latitude,
      evaluatedFilters,
      item.customUrl,
      item.ownerId,
      item.layertype,
      item.boundary
    );

    console.log(`LOG:: layer check  ${index}`, layerData);

    if (item.layertype === 'polygon') {
      return {
        ...item,
        markers: layerData
          ?.filter((i) => {
            return !Object.values(i).includes(null);
          })
          .map((j) => JSON.parse(j?.comments)),
      };
    }

    return {
      ...item,
      markers: Array.isArray(layerData)
        ? layerData
            ?.filter((i) => {
              return !Object.values(i).includes(null);
            })
            .map((j) => ({
              color: item.iconColor,
              icon: item.icon,
              position: {
                lat: j.latitude,
                lng: j.longitude,
              },
            }))
        : [{ position: { lat: layerData?.latitude, lng: layerData?.longitude } }],
    };
  });

  console.log('LOG:: LAYER DATA', layerMarker);

  const options = layerMarker
    ?.filter((item) => item.visible === true)
    ?.map((i) => {
      return {
        label: i.label,
        value: i.id,
        disabled: !i.allowChangeVisibility,
      };
    });

  const defaultChecked = options?.map((item) => {
    return item.value;
  });

  const menu = (
    <Menu style={{ display: 'block', padding: '20px', opacity: 0.9 }}>
      <Checkbox.Group options={options} onChange={onChange} defaultValue={defaultChecked} />
    </Menu>
  );

  useEffect(() => {
    if (
      layerMarker?.every(
        (item) =>
          Array.isArray(item?.markers) &&
          item?.markers?.every((marker) => {
            return item?.layertype == 'points'
              ? Object.values(marker?.position).every((value) => value !== undefined)
              : true;
          })
      )
    ) {
      onChange(defaultChecked);
    }
  }, [JSON.stringify(layerMarker)]);

  console.log('LOGG:: polygonData', polygonData);

  return (
    <>
      {layers && (
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
      <MapContainer style={containerStyle} center={center} zoom={zoom} scrollWheelZoom={false} ref={mapRef}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">Shesha</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapContent onClick={mapClicked} />

        {singlePoint?.map((marker) => (
          <MarkerContent
            position={marker.position}
            color={marker.color}
            icon={marker.icon}
            onMarkerClick={() => markerClicked(marker)}
          />
        ))}
        {layerMarkers?.map((marker, index) => (
          <MarkerContent
            key={index}
            color={marker.color}
            size={marker.size}
            icon={marker.icon}
            position={marker.position}
            onMarkerClick={() => markerClicked(marker)}
          />
        ))}
        {polygonData?.map((polygon) => (
          <Polygon positions={polygon} />
        ))}
      </MapContainer>
    </>
  );
};
