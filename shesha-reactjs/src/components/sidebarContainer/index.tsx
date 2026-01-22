import React, { FC, PropsWithChildren, ReactNode, useEffect, useState, useMemo, useCallback } from 'react';
import classNames from 'classnames';

import { ISidebarProps, SidebarPanelPosition } from './models';
import { SidebarPanel } from './sidebarPanel';
import { useStyles } from './styles/styles';
import { SizableColumns } from '../sizableColumns';
import { getPanelSizes } from './utilis';
import { SIDEBAR_COLLAPSE, useCanvas, useLocalStorage, useShaFormInstance } from '@/index';
import { calculateAutoZoom, DEFAULT_OPTIONS, defaultDesignerWidth, usePinchZoom } from '@/providers/canvas/utils';
import { IViewType } from '@/providers/canvas/contexts';
export interface ISidebarContainerProps extends PropsWithChildren<any> {
  leftSidebarProps?: ISidebarProps;
  rightSidebarProps?: ISidebarProps;
  header?: ReactNode | (() => ReactNode);
  sideBarWidth?: number;
  allowFullCollapse?: boolean;
  canZoom?: boolean;
  configTreePanelSize?: string | number;
  noPadding?: boolean;
  viewType?: IViewType;
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
}) => {
  const { formMode } = useShaFormInstance();
  const { styles } = useStyles();
  const [isOpenLeft, setIsOpenLeft] = useState(false);
  const [isOpenRight, setIsOpenRight] = useState(false);
  const { zoom, setCanvasZoom, setViewType, designerWidth, autoZoom, configTreePanelSize } = useCanvas();
  const [isSidebarCollapsed] = useLocalStorage(SIDEBAR_COLLAPSE, false);

  const [currentSizes, setCurrentSizes] = useState(getPanelSizes(isOpenLeft, isOpenRight, leftSidebarProps, rightSidebarProps, allowFullCollapse).sizes);
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
      setWindowSize({ width: (window?.innerWidth ?? parseInt(defaultDesignerWidth, 10)) + 'px' });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (canZoom) {
      if (autoZoom) {
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
  }, [canZoom, autoZoom, windowSize.width, designerWidth, currentSizes, configTreePanelSize, setCanvasZoom, viewType, isSidebarCollapsed]);

  useEffect(() => {
    setCurrentSizes(getPanelSizes(isOpenLeft, isOpenRight, leftSidebarProps, rightSidebarProps, allowFullCollapse).sizes);
  }, [isOpenRight, isOpenLeft, leftSidebarProps, rightSidebarProps, allowFullCollapse]);

  const sizes = useMemo(() => getPanelSizes(isOpenLeft, isOpenRight, leftSidebarProps, rightSidebarProps, allowFullCollapse),
    [isOpenRight, leftSidebarProps, rightSidebarProps, allowFullCollapse, isOpenLeft],
  );

  const isDesigner = formMode === 'designer';

  const renderSidebar = (side: SidebarPanelPosition): JSX.Element => {
    const sidebarProps = side === 'left' ? leftSidebarProps : rightSidebarProps;
    const hideFullCollapse = allowFullCollapse && !sidebarProps?.open;

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
    <div className={styles.sidebarContainer}>
      {header && (
        <div className={styles.sidebarContainerHeader}>{typeof header === 'function' ? header() : header}</div>
      )}
      <SizableColumns
        sizes={currentSizes}
        expandToMin={false}
        minSize={sizes?.minSizes}
        maxSize={sizes?.maxSizes}
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
          className={classNames(
            styles.sidebarContainerMainArea,
            styles.canvasWrapper,
            { 'both-open': leftSidebarProps?.open && rightSidebarProps?.open },
            { 'left-only-open': leftSidebarProps?.open && !rightSidebarProps?.open },
            { 'right-only-open': rightSidebarProps?.open && !leftSidebarProps?.open },
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
              { [styles.designerCanvas]: isDesigner && canZoom },
            )}
            style={isDesigner && canZoom ? {
              width: designerWidth,
              zoom: `${zoom}%`,
            } : {}}
          >
            {children}
          </div>
        </div>
        {renderSidebar('right')}
      </SizableColumns>
      {/* Dedicated popup container for canvas components - applies zoom transformation */}
      {isDesigner && canZoom && (
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
