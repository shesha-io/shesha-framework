import { LatLngExpression, divIcon } from 'leaflet';
import React, { FC } from 'react';
import ReactDOMServer from 'react-dom/server';
import { Marker, Popup } from 'react-leaflet';
import { IMapMarker } from '../../interfaces';
import { getIcon } from './utils';

export const MarkerContent: FC<IMapMarker> = (props) => {
  const { position, color, icon, size } = props;

  const AntIcon = getIcon(color, icon, size);

  const antIcon = divIcon({
    html: ReactDOMServer.renderToString(<AntIcon />),
  });

  return (
    <Marker icon={antIcon} position={position as LatLngExpression}>
      <Popup>
        <b>
          {position.lat}, {position.lng}
        </b>
      </Popup>
    </Marker>
  );
};
