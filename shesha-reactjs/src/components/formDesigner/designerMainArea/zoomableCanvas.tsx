import { useCanvas } from '@/providers';
import { FC, PropsWithChildren, useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { calculateAutoZoom, DEFAULT_OPTIONS, getCanvasLayoutWidth, usePinchZoom } from '@/providers/canvas/utils';
import { useStyles } from './styles';
import classNames from 'classnames';
import { useElementSizeTracking } from '@/hooks/useElementSize';

// useLayoutEffect warns when it runs on the server, where there is nothing to measure anyway.
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
    // Manual pinch/ctrl+wheel zoom is suppressed while the zoom level is driven automatically. In
    // "Canvas" mode the canvas already fills its pane at any zoom, so there is nothing to reveal.
    autoZoom || autoWidth,
  );

  // Content-box width of the area between the designer panels, measured rather than derived from
  // the window, so panel drags, collapses and the vertical scrollbar are all accounted for.
  const [availableWidth, setAvailableWidth] = useState(0);

  const onResize = useCallback((entry: ResizeObserverEntry) => {
    const { width } = entry.contentRect;

    // Dead-band: a sub-pixel change is not worth a re-render, and in "Canvas" mode this width feeds
    // the canvas layout, so accepting every fraction can oscillate.
    setAvailableWidth((prev) => (Math.abs(prev - width) < 1 ? prev : width));

    // Auto zoom fits a fixed-width canvas into its pane. Skipped in "Canvas" mode: the canvas
    // already fills the pane at any zoom, and letting auto zoom react to a width that is itself
    // derived from the zoom would feed back on itself.
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

  // Seed the measurement before the first paint. useElementSizeTracking observes in a plain
  // effect, so on mount its first callback lands after paint - long enough to show one frame of
  // the canvas at whatever width a preset last pinned.
  useIsomorphicLayoutEffect(() => {
    const width = wrapperRef.current?.clientWidth ?? 0;
    if (width > 0)
      setAvailableWidth((prev) => (Math.abs(prev - width) < 1 ? prev : width));
  }, [wrapperRef, autoWidth, canZoom]);

  const isAutoWidth = canZoom && autoWidth && availableWidth > 0;

  // In "Canvas" mode the canvas is laid out at availableWidth / zoom, so once the CSS zoom is
  // applied it renders exactly as wide as its pane: no horizontal scrollbar, components re-wrap to
  // the space they have, and each one keeps the scale the user selected.
  const canvasWidth = isAutoWidth
    ? getCanvasLayoutWidth(availableWidth, zoom, widthPercent)
    : designerWidth;

  // Published so vw-based component sizing and anything else reading the canvas width agree with
  // what is on screen. Guarded in the reducer so it is a no-op outside "Canvas" mode.
  //
  // Deliberately a layout effect. The canvas device - and so which settings block every component
  // renders with, via activeDevice in dynamicComponent - is resolved by the reducer from this
  // width. Switching to "Canvas" off a device preset cannot resolve it at the point of the switch,
  // because designerWidth is still the width that preset pinned; only this measurement knows the
  // pane. Publishing after paint would therefore show one frame of a full-width canvas still
  // rendering the pinned device's settings - e.g. a ~1900px canvas in mobile styling straight
  // after leaving iPhone SE. Running before paint means that frame is never painted.
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
