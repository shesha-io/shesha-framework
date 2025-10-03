import React, { FC, PropsWithChildren, ReactNode, useEffect, useState, useMemo, useCallback } from 'react';
import classNames from 'classnames';

import { ISidebarProps, SidebarPanelPosition } from './models';
import { SidebarPanel } from './sidebarPanel';
import { useStyles } from './styles/styles';
import { SizableColumns } from '../sizableColumns';
import { getPanelSizes } from './utilis';
import { useCanvas, useShaFormInstance } from '@/index';
import { calculateAutoZoom, DEFAULT_OPTIONS, usePinchZoom } from '@/providers/canvas/utils';
export interface ISidebarContainerProps extends PropsWithChildren<any> {
  leftSidebarProps?: ISidebarProps;
  rightSidebarProps?: ISidebarProps;
  header?: ReactNode | (() => ReactNode);
  sideBarWidth?: number;
  allowFullCollapse?: boolean;
  canZoom?: boolean;
  configTreePanelSize?: string | number;
  noPadding?: boolean;
}

export const SidebarContainer: FC<ISidebarContainerProps> = ({
  leftSidebarProps,
  rightSidebarProps,
  header,
  children,
  allowFullCollapse = false,
  noPadding,
  canZoom = false,
}) => {
  const { formMode } = useShaFormInstance();
  const { styles } = useStyles();
  const [isOpenLeft, setIsOpenLeft] = useState(false);
  const [isOpenRight, setIsOpenRight] = useState(false);
  const { zoom, setCanvasZoom, designerWidth, autoZoom, configTreePanelSize } = useCanvas();

  const [currentSizes, setCurrentSizes] = useState(getPanelSizes(isOpenLeft, isOpenRight, leftSidebarProps, rightSidebarProps, allowFullCollapse).sizes);

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
    autoZoom
  );

  useEffect(() => {
    if (canZoom) {
      if (autoZoom) {
        const newZoom = calculateAutoZoom({
          currentZoom: zoom,
          designerWidth,
          sizes: currentSizes,
          configTreePanelSize: configTreePanelSize,
        });
        setCanvasZoom(newZoom);
      }
    }
  }, [canZoom, autoZoom, designerWidth, currentSizes, configTreePanelSize, zoom]);

  useEffect(() => {
    setCurrentSizes(getPanelSizes(isOpenLeft, isOpenRight, leftSidebarProps, rightSidebarProps, allowFullCollapse).sizes);
  }, [isOpenRight, isOpenLeft, leftSidebarProps, rightSidebarProps, allowFullCollapse]);

  const sizes = useMemo(() => getPanelSizes(isOpenLeft, isOpenRight, leftSidebarProps, rightSidebarProps, allowFullCollapse),
    [isOpenRight, leftSidebarProps, rightSidebarProps, allowFullCollapse, isOpenLeft]
  );

  const isDesigner = formMode === 'designer';

  const renderSidebar = (side: SidebarPanelPosition) => {
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
            { 'both-open': leftSidebarProps?.open && rightSidebarProps?.open },
            { 'left-only-open': leftSidebarProps?.open && !rightSidebarProps?.open },
            { 'right-only-open': rightSidebarProps?.open && !leftSidebarProps?.open },
            { 'no-left-panel': !leftSidebarProps },
            { 'no-right-panel': !rightSidebarProps },
            { 'no-padding': noPadding },
            { 'allow-full-collapse': allowFullCollapse }
          )}
        >
          <div
            ref={canvasRef}
            className={classNames(
              styles.sidebarContainerMainAreaBody,
              { [styles.designerCanvas]: isDesigner && canZoom }
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
    </div>
  );
};
