import {
  FC,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
  useLayoutEffect,
  CSSProperties,
} from 'react';
import classNames from 'classnames';

import { ISidebarProps, SidebarPanelPosition } from './models';
import { SidebarPanel } from './sidebarPanel';
import { CANVAS_PADDING, useStyles } from './styles/styles';
import { SizableColumns } from '../sizableColumns';
import { getPanelSizes } from './utilis';
import { calculateAutoZoom, getCanvasLayoutWidth, getCanvasVhUnit, usePinchZoom } from '@/providers/canvas/utils';
import { CANVAS_VH_VAR, DEFAULT_OPTIONS, defaultDesignerWidth } from '@/providers/canvas/options';
import { IViewType } from '@/providers/canvas/contexts';
import { useShaFormInstance } from '@/providers/form/providers/shaFormProvider';
import { useCanvas } from '@/providers/canvas';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { SIDEBAR_COLLAPSE } from '../mainLayout/constant';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';

// useLayoutEffect warns when it runs on the server, where there is nothing to measure anyway.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/** Canvas padding on both the top and bottom edges, in canvas (pre-zoom) pixels. */
const CANVAS_VERTICAL_PADDING = CANVAS_PADDING * 2;

export interface ISidebarContainerProps extends PropsWithChildren {
  leftSidebarProps?: ISidebarProps | undefined;
  rightSidebarProps?: ISidebarProps | undefined;
  header?: ReactNode | (() => ReactNode) | undefined;
  sideBarWidth?: number | undefined;
  allowFullCollapse?: boolean | undefined;
  canZoom?: boolean | undefined;
  configTreePanelSize?: string | number | undefined;
  noPadding?: boolean | undefined;
  viewType?: IViewType | undefined;
  /** Inline usage: size the sidebar to its content (capped at the viewport) instead
   * of forcing a full-viewport height. Use when this container is embedded as a plain
   * component (e.g. the datatable filter panel) rather than a full-screen editor. */
  embedded?: boolean | undefined;
  storeName?: string | undefined;
}

export const SidebarContainer: FC<ISidebarContainerProps> = ({
  leftSidebarProps,
  rightSidebarProps,
  header,
  children,
  allowFullCollapse = false,
  noPadding,
  canZoom = false,
  viewType = 'configStudio',
  embedded = false,
  storeName,
}) => {
  const { formMode } = useShaFormInstance();
  const { styles } = useStyles();
  const [isOpenLeftLocal, setIsOpenLeftLocal] = useState(false);
  const [isOpenRightLocal, setIsOpenRightLocal] = useState(false);
  const storeKey = isNullOrWhiteSpace(storeName) ? 'sidebarContainer.transient' : storeName;
  const [isOpenLeftStore, setIsOpenLeftStore] = useLocalStorage(`${storeKey}.isOpenLeft`, false);
  const [isOpenRightStore, setIsOpenRightStore] = useLocalStorage(`${storeKey}.isOpenRight`, false);
  const { zoom, setCanvasZoom, setViewType, setAvailableCanvasWidth, designerWidth, autoZoom, autoWidth, configTreePanelSize } = useCanvas();
  const [isSidebarCollapsed] = useLocalStorage(SIDEBAR_COLLAPSE, false);
  // Content-box size of the area between the sidebars, measured rather than derived from the
  // window, so panel drags, collapses and the scrollbars are all accounted for.
  const mainAreaRef = useRef<HTMLDivElement>(null);
  const [availableSize, setAvailableSize] = useState({ width: 0, height: 0 });
  const { width: availableWidth, height: availableHeight } = availableSize;

  const isOpenLeft = isNullOrWhiteSpace(storeName) ? isOpenLeftLocal : isOpenLeftStore;
  const isOpenRight = isNullOrWhiteSpace(storeName) ? isOpenRightLocal : isOpenRightStore;

  const setIsOpenLeft = isNullOrWhiteSpace(storeName) ? setIsOpenLeftLocal : setIsOpenLeftStore;
  const setIsOpenRight = isNullOrWhiteSpace(storeName) ? setIsOpenRightLocal : setIsOpenRightStore;

  const [currentSizes, setCurrentSizes] = useState(() => getPanelSizes(isOpenLeft, isOpenRight, leftSidebarProps, rightSidebarProps, allowFullCollapse).sizes);
  const [windowSize, setWindowSize] = useState({ width: designerWidth });

  const handleDragSizesChange = useCallback((sizes: number[]) => {
    setCurrentSizes(sizes);
  }, []);

  const handleZoomChange = useCallback((newZoom: number) => {
    if (!canZoom) return;
    setCanvasZoom(newZoom);
  }, [setCanvasZoom, canZoom]);

  const canvasRef = usePinchZoom(
    handleZoomChange,
    zoom,
    DEFAULT_OPTIONS.minZoom,
    DEFAULT_OPTIONS.maxZoom,
    // Only auto zoom drives the zoom level for us; in "Canvas" mode nothing does, so pinch and
    // ctrl+wheel stay available. The reducer already keeps the two flags from being set together,
    // but spelling the condition out here matches the auto-zoom effect below and keeps this call
    // site correct on its own terms rather than by way of an invariant enforced elsewhere.
    autoZoom && !autoWidth,
  );

  // Set the view type on mount
  useEffect(() => {
    setViewType(viewType);
  }, [viewType, setViewType]);

  // Track window resize
  useEffect(() => {
    const handleResize = (): void => {
      const innerWidth = isDefined(window) ? window.innerWidth : undefined;
      setWindowSize({ width: (innerWidth ?? parseInt(defaultDesignerWidth, 10)) + 'px' });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keep the "Canvas" preset in sync with the space actually available. Auto zoom is skipped in
  // this mode: the canvas already fills its pane at any zoom, and letting auto zoom react to a
  // width that is itself derived from the zoom would feed back on itself.
  useEffect(() => {
    if (canZoom) {
      if (autoZoom && !autoWidth) {
        const newZoom = calculateAutoZoom({
          currentZoom: zoom,
          designerWidth,
          sizes: currentSizes,
          configTreePanelSize: configTreePanelSize,
          viewType: viewType,
          isSidebarCollapsed: isSidebarCollapsed,
        });
        if (newZoom !== zoom) {
          setCanvasZoom(newZoom);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canZoom, autoZoom, autoWidth, windowSize.width, designerWidth, currentSizes, configTreePanelSize, setCanvasZoom, viewType, isSidebarCollapsed]);

  useEffect(() => {
    setCurrentSizes(getPanelSizes(isOpenLeft, isOpenRight, leftSidebarProps, rightSidebarProps, allowFullCollapse).sizes);
  }, [isOpenRight, isOpenLeft, leftSidebarProps, rightSidebarProps, allowFullCollapse]);

  const sizes = useMemo(() => getPanelSizes(isOpenLeft, isOpenRight, leftSidebarProps, rightSidebarProps, allowFullCollapse),
    [isOpenRight, leftSidebarProps, rightSidebarProps, allowFullCollapse, isOpenLeft],
  );

  const isDesigner = formMode === 'designer';
  const isZoomableCanvas = isDesigner && canZoom;

  // Track the space available to the canvas. The content-box excludes the scrollbars, so the canvas
  // never has to give up a scrollbar on one axis to make room for one on the other.
  //
  // Deliberately a layout effect: until the pane is measured, `canvasWidth` falls back to
  // `designerWidth`, which in "Canvas" mode is whatever width was last pinned by a device preset.
  // Measuring after paint would show the canvas at that stale width for a frame. Running before
  // paint means the browser only ever paints the measured width.
  useIsomorphicLayoutEffect(() => {
    const mainArea = mainAreaRef.current;
    if (!isZoomableCanvas || !mainArea) return undefined;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentBoxSize[0]?.inlineSize ?? entry.contentRect.width;
        const height = entry.contentBoxSize[0]?.blockSize ?? entry.contentRect.height;
        setAvailableSize((prev) => (Math.abs(prev.width - width) < 1 && Math.abs(prev.height - height) < 1
          ? prev
          : { width, height }));
      }
    });
    observer.observe(mainArea);
    setAvailableSize({ width: mainArea.clientWidth, height: mainArea.clientHeight });

    return () => observer.disconnect();
  }, [isZoomableCanvas]);

  // In "Canvas" mode the canvas is laid out at availableWidth / zoom, so once the CSS zoom is
  // applied it renders exactly as wide as its pane: no horizontal scrollbar, components re-wrap
  // to the space they have, and each one keeps the scale the user selected.
  const canvasWidth = isZoomableCanvas && autoWidth && availableWidth > 0
    ? getCanvasLayoutWidth(availableWidth, zoom)
    : designerWidth;

  // Publish it so vw-based component sizing and anything else reading the canvas width agree with
  // what is on screen. Guarded in the reducer so it is a no-op outside "Canvas" mode.
  //
  // The pane width goes with it because `canvasWidth` has been divided by the zoom factor, and it
  // is the pane - not the zoomed layout width - that picks the device. See the reducer.
  useEffect(() => {
    if (isZoomableCanvas && autoWidth && availableWidth > 0)
      setAvailableCanvasWidth(canvasWidth, availableWidth);
  }, [isZoomableCanvas, autoWidth, availableWidth, canvasWidth, setAvailableCanvasWidth]);

  // How long one `vh` is on this canvas, published as a custom property that component dimensions
  // read (see `canvasRelativeVh`), so a component sized in `vh` fits the canvas rather than the
  // browser window. Unlike the width this applies to every resolution: a device preset pins how
  // wide the canvas is, but never how tall - the pane is all the height there has ever been.
  //
  // It rides on the element rather than through the canvas context so that a zoom or a panel drag
  // re-renders nothing below this component: only the variable changes, and every `vh` beneath it
  // follows. Set nowhere but here, so `vh` keeps its usual meaning everywhere outside the canvas.
  const canvasVhStyle = useMemo<CSSProperties>(() => (isZoomableCanvas && availableHeight > 0
    ? { [CANVAS_VH_VAR]: getCanvasVhUnit(availableHeight, zoom, CANVAS_VERTICAL_PADDING) } as CSSProperties
    : {}), [isZoomableCanvas, availableHeight, zoom]);

  const renderSidebar = (side: SidebarPanelPosition): ReactNode => {
    const sidebarProps = side === 'left' ? leftSidebarProps : rightSidebarProps;
    const hideFullCollapse = allowFullCollapse && sidebarProps?.open !== true;

    return sidebarProps && !hideFullCollapse ? (
      <SidebarPanel
        {...sidebarProps}
        allowFullCollapse={allowFullCollapse}
        side={side}
        setIsOpenGlobal={side === 'left' ? setIsOpenLeft : setIsOpenRight}
      />
    ) : null;
  };

  return (
    <div className={classNames(styles.sidebarContainer, { embedded })}>
      {isDefined(header) && (
        <div className={styles.sidebarContainerHeader}>{typeof header === 'function' ? header() : header}</div>
      )}
      <SizableColumns
        sizes={currentSizes}
        expandToMin={false}
        {...(isDefined(sizes.minSizes) ? { minSize: sizes.minSizes } : {})}
        {...(isDefined(sizes.maxSizes) ? { maxSize: sizes.maxSizes } : {})}
        onDrag={handleDragSizesChange}
        onDragEnd={handleDragSizesChange}
        gutterSize={DEFAULT_OPTIONS.gutter}
        gutterAlign="center"
        snapOffset={5}
        dragInterval={12}
        direction="horizontal"
        cursor="col-resize"
        className={classNames(styles.sidebarContainerBody)}
      >
        {renderSidebar('left')}

        <div
          ref={mainAreaRef}
          className={classNames(
            styles.sidebarContainerMainArea,
            styles.canvasWrapper,
            { [styles.canvasAutoWidth]: isZoomableCanvas && autoWidth },
            { 'both-open': leftSidebarProps?.open === true && rightSidebarProps?.open === true },
            { 'left-only-open': leftSidebarProps?.open === true && rightSidebarProps?.open !== true },
            { 'right-only-open': rightSidebarProps?.open === true && leftSidebarProps?.open !== true },
            { 'no-left-panel': !leftSidebarProps },
            { 'no-right-panel': !rightSidebarProps },
            { 'no-padding': noPadding },
            { 'allow-full-collapse': allowFullCollapse },
          )}
        >
          <div
            ref={canvasRef}
            className={classNames(
              styles.sidebarContainerMainAreaBody,
              { [styles.designerCanvas]: isZoomableCanvas },
            )}
            style={isZoomableCanvas ? {
              width: canvasWidth,
              zoom: `${zoom}%`,
              ...canvasVhStyle,
            } : {}}
          >
            {children}
          </div>
        </div>
        {renderSidebar('right')}
      </SizableColumns>
      {/* Dedicated popup container for canvas components - applies zoom transformation */}
      {isZoomableCanvas && (
        <div
          id="canvas-popup-container"
          className={styles.canvasPopupContainer}
          // Same zoom and the same `vh` basis as the canvas, so a popup rendered out here is sized
          // the way it would have been inside it.
          style={{
            zoom: `${zoom}%`,
            ...canvasVhStyle,
          }}
        />
      )}
    </div>
  );
};
