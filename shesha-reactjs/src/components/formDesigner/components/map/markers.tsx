import { PushpinOutlined } from '@ant-design/icons';
import React, { useRef } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import ReactDOMServer from 'react-dom/server';
import ShaIcon from 'components/shaIcon';

function getIcon(color: any, icon: any, size: any) {
  return () => {
    if (color && icon) {
      return <ShaIcon iconName={icon as any} style={{ color: `${color.hex}`, fontSize: size ? size : 24 }} />;
    }
    return <PushpinOutlined style={{ color: 'red', fontSize: 24 }} />;
  };
}

export const MarkerContent = (props) => {
  const markerRef = useRef();
  const { position, onMarkerClick, color, icon, size } = props;

  const AntIcon = getIcon(color, icon, size);

  const antIcon = divIcon({
    html: ReactDOMServer.renderToString(<AntIcon />),
  });

  return (
    <Marker
      icon={antIcon}
      position={position}
      eventHandlers={{
        click: (event) => onMarkerClick(event),
      }}
      ref={markerRef}
    >
      <Popup>
        <b>
          {position.lat}, {position.lng}
        </b>
      </Popup>
    </Marker>
  );
};
