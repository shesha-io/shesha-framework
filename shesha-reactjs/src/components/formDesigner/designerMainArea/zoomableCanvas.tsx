import { useCanvas } from '@/providers';
import { FC, PropsWithChildren, useCallback } from 'react';
import { calculateAutoZoom, DEFAULT_OPTIONS, usePinchZoom } from '@/providers/canvas/utils';
import { useStyles } from './styles';
import classNames from 'classnames';
import { useElementSizeTracking } from '@/hooks/useElementSize';

export interface IZoomableCanvasProps {
  canZoom: boolean;
}

export const ZoomableCanvas: FC<PropsWithChildren<IZoomableCanvasProps>> = ({ children, canZoom }) => {
  const { styles } = useStyles();
  const { zoom, setCanvasZoom, designerWidth, autoZoom } = useCanvas();

  const handleZoomChange = useCallback((newZoom: number) => {
    if (!canZoom) return;
    setCanvasZoom(newZoom);
  }, [setCanvasZoom, canZoom]);

  const canvasRef = usePinchZoom(
    handleZoomChange,
    zoom,
    DEFAULT_OPTIONS.minZoom,
    DEFAULT_OPTIONS.maxZoom,
    autoZoom,
  );

  const onResize = useCallback((entry: ResizeObserverEntry) => {
    const { width } = entry.contentRect;
    if (canZoom && autoZoom) {
      const newZoom = calculateAutoZoom({
        currentZoom: zoom,
        designerWidth,
        containerWidth: width,
      });

      if (newZoom !== zoom) {
        setCanvasZoom(newZoom);
      }
    }
  }, [autoZoom, canZoom, designerWidth, setCanvasZoom, zoom]);
  const wrapperRef = useElementSizeTracking(onResize);

  return (
    <>
      <div className={styles.canvasWrapper} ref={wrapperRef}>
        <div
          ref={canvasRef}
          className={classNames({ [styles.designerCanvas]: canZoom })}
          style={canZoom ? {
            width: designerWidth,
            zoom: `${zoom}%`,
          } : {}}
        >
          {children}
        </div>
        {/* Dedicated popup container for canvas components - applies zoom transformation */}
        {canZoom && (
          <div
            id="canvas-popup-container"
            className={styles.canvasPopupContainer}
            style={{
              zoom: `${zoom}%`,
            }}
          />
        )}
      </div>
    </>
  );
};
