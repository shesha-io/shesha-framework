import { useCanvas } from '@/providers';
import { FC, PropsWithChildren, useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { calculateAutoZoom, DEFAULT_OPTIONS, getCanvasLayoutWidth, usePinchZoom } from '@/providers/canvas/utils';
import { useStyles } from './styles';
import classNames from 'classnames';
import { useElementSizeTracking } from '@/hooks/useElementSize';

// useLayoutEffect warns on the server, where there is nothing to measure.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface IZoomableCanvasProps {
  canZoom: boolean;
}

export const ZoomableCanvas: FC<PropsWithChildren<IZoomableCanvasProps>> = ({ children, canZoom }) => {
  const { styles } = useStyles();
  const { zoom, setCanvasZoom, setAvailableCanvasWidth, designerWidth, autoZoom, autoWidth, widthPercent } = useCanvas();

  const handleZoomChange = useCallback((newZoom: number) => {
    if (!canZoom) return;
    setCanvasZoom(newZoom);
  }, [setCanvasZoom, canZoom]);

  const canvasRef = usePinchZoom(
    handleZoomChange,
    zoom,
    DEFAULT_OPTIONS.minZoom,
    DEFAULT_OPTIONS.maxZoom,
    autoZoom || autoWidth,
  );

  const [availableWidth, setAvailableWidth] = useState(0);

  const onResize = useCallback((entry: ResizeObserverEntry) => {
    const { width } = entry.contentRect;

    // Dead-band: in "Canvas" mode this width feeds the canvas layout, so every fraction oscillates.
    setAvailableWidth((prev) => (Math.abs(prev - width) < 1 ? prev : width));

    // Auto zoom is skipped in "Canvas" mode - the width is derived from the zoom, so it feeds back.
    if (canZoom && autoZoom && !autoWidth) {
      const newZoom = calculateAutoZoom({
        currentZoom: zoom,
        designerWidth,
        containerWidth: width,
      });

      if (newZoom !== zoom) {
        setCanvasZoom(newZoom);
      }
    }
  }, [autoZoom, autoWidth, canZoom, designerWidth, setCanvasZoom, zoom]);
  const wrapperRef = useElementSizeTracking(onResize);

  // useElementSizeTracking observes in a plain effect, so seed the first measurement before paint.
  useIsomorphicLayoutEffect(() => {
    const width = wrapperRef.current?.clientWidth ?? 0;
    if (width > 0)
      setAvailableWidth((prev) => (Math.abs(prev - width) < 1 ? prev : width));
  }, [wrapperRef, autoWidth, canZoom]);

  const isAutoWidth = canZoom && autoWidth && availableWidth > 0;

  const canvasWidth = isAutoWidth
    ? getCanvasLayoutWidth(availableWidth, zoom, widthPercent)
    : designerWidth;

  // Layout effect, not effect: the reducer resolves activeDevice from this width, so publishing
  // after paint shows one frame in the previously pinned device's settings.
  useIsomorphicLayoutEffect(() => {
    if (isAutoWidth)
      setAvailableCanvasWidth(canvasWidth);
  }, [isAutoWidth, canvasWidth, setAvailableCanvasWidth]);

  return (
    <>
      <div
        className={classNames(styles.canvasWrapper, { [styles.canvasAutoWidth]: isAutoWidth })}
        ref={wrapperRef}
      >
        <div
          ref={canvasRef}
          className={classNames({ [styles.designerCanvas]: canZoom })}
          style={canZoom ? {
            width: canvasWidth,
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
