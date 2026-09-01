import { useCanvas } from '@/providers';
import { FC, PropsWithChildren, useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { calculateAutoZoom, DEFAULT_OPTIONS, getCanvasDeviceWidth, getCanvasLayoutHeight, getCanvasLayoutWidth, usePinchZoom } from '@/providers/canvas/utils';
import { useStyles } from './styles';
import classNames from 'classnames';
import { useElementSizeTracking } from '@/hooks/useElementSize';
import { isDefined } from '@/utils/nullables';

// useLayoutEffect warns on the server, where there is nothing to measure.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface IZoomableCanvasProps {
  canZoom: boolean;
}

export const ZoomableCanvas: FC<PropsWithChildren<IZoomableCanvasProps>> = ({ children, canZoom }) => {
  const { styles } = useStyles();
  const { zoom, setCanvasZoom, setAvailableCanvasWidth, setCanvasMeasurement, registerCanvas, unregisterCanvas, designerWidth, autoZoom, autoWidth, widthPercent } = useCanvas();

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

  // Refcounted: the quick-edit dialog mounts a second canvas over the designer's own.
  useEffect(() => {
    registerCanvas();
    return () => unregisterCanvas();
  }, [registerCanvas, unregisterCanvas]);

  const [availableWidth, setAvailableWidth] = useState(0);
  const [availableHeight, setAvailableHeight] = useState(0);

  const onResize = useCallback((entry: ResizeObserverEntry) => {
    const { width, height } = entry.contentRect;

    // Dead-band: in "Canvas" mode this width feeds the canvas layout, so every fraction oscillates.
    setAvailableWidth((prev) => (Math.abs(prev - width) < 1 ? prev : width));
    setAvailableHeight((prev) => (Math.abs(prev - height) < 1 ? prev : height));

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

    const height = wrapperRef.current?.clientHeight ?? 0;
    if (height > 0)
      setAvailableHeight((prev) => (Math.abs(prev - height) < 1 ? prev : height));
  }, [wrapperRef, autoWidth, canZoom]);

  const isAutoWidth = canZoom && autoWidth && availableWidth > 0;

  const canvasWidth = isAutoWidth
    ? getCanvasLayoutWidth(availableWidth, zoom, widthPercent)
    : designerWidth;

  // Layout effect, not effect: the reducer resolves activeDevice from this width, so publishing
  // after paint shows one frame in the previously pinned device's settings.
  const deviceWidth = getCanvasDeviceWidth(availableWidth, widthPercent);

  useIsomorphicLayoutEffect(() => {
    if (isAutoWidth)
      setAvailableCanvasWidth({ layoutWidth: canvasWidth, deviceWidth });
  }, [isAutoWidth, canvasWidth, deviceWidth, setAvailableCanvasWidth]);

  // What `vh` means on the canvas: the pane it scrolls inside, pre-zoom as the width is.
  const canvasHeight = availableHeight > 0
    ? getCanvasLayoutHeight(availableHeight, canZoom ? zoom : 100)
    : undefined;

  useIsomorphicLayoutEffect(() => {
    if (isDefined(canvasHeight))
      setCanvasMeasurement({ width: canvasWidth, height: canvasHeight });
  }, [canvasWidth, canvasHeight, setCanvasMeasurement]);

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
