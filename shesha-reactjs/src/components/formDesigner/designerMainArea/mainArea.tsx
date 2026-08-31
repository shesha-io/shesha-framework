import { FC } from 'react';
import { DesignerCanvas } from './designerCanvas';
import { ZoomableCanvas } from './zoomableCanvas';

export const MainArea: FC = () => {
  return (
    <ZoomableCanvas canZoom>
      <DesignerCanvas />
    </ZoomableCanvas>
  );
};
