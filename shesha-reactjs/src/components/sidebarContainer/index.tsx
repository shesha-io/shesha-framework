import {
  FC,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import classNames from 'classnames';

import { ISidebarProps, SidebarPanelPosition } from './models';
import { SidebarPanel } from './sidebarPanel';
import { useStyles } from './styles/styles';
import { SizableColumns } from '../sizableColumns';
import { getPanelSizes } from './utilis';
import { calculateAutoZoom, DEFAULT_OPTIONS, defaultDesignerWidth, getCanvasLayoutWidth, usePinchZoom } from '@/providers/canvas/utils';
import { IViewType } from '@/providers/canvas/contexts';
import { useShaFormInstance } from '@/providers/form/providers/shaFormProvider';
import { useCanvas } from '@/providers/canvas';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { SIDEBAR_COLLAPSE } from '../mainLayout/constant';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
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
  // Content-box width of the area between the sidebars, measured rather than derived from the
  // window, so panel drags, collapses and the vertical scrollbar are all accounted for.
  const mainAreaRef = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState(0);

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
    autoZoom,
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

  // Track the width available to the canvas. The content-box excludes the vertical scrollbar, so
  // the canvas never has to give up a horizontal scrollbar to make room for it.
  useEffect(() => {
    const mainArea = mainAreaRef.current;
    if (!isZoomableCanvas || !mainArea) return undefined;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentBoxSize[0]?.inlineSize ?? entry.contentRect.width;
        setAvailableWidth((prev) => (Math.abs(prev - width) < 1 ? prev : width));
      }
    });
    observer.observe(mainArea);
    setAvailableWidth(mainArea.clientWidth);

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
  useEffect(() => {
    if (isZoomableCanvas && autoWidth && availableWidth > 0)
      setAvailableCanvasWidth(canvasWidth);
  }, [isZoomableCanvas, autoWidth, availableWidth, canvasWidth, setAvailableCanvasWidth]);

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
          style={{
            zoom: `${zoom}%`,
          }}
        />
      )}
    </div>
  );
};
