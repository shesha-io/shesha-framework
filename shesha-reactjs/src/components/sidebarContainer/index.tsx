import React, { FC, PropsWithChildren, ReactNode, useEffect, useState, useMemo, useCallback } from 'react';
import classNames from 'classnames';
import _ from 'lodash';

import { ISidebarProps, SidebarPanelPosition } from './models';
import { SidebarPanel } from './sidebarPanel';
import { useStyles } from './styles/styles';
import { SizableColumns } from '../sizableColumns';
import { getPanelSizes } from './utilis';
import { useCanvas, useShaFormInstance } from '@/index';
import { calculateAutoZoom, usePinchZoom } from './canvasUtils';

export interface ISidebarContainerProps extends PropsWithChildren<any> {
  leftSidebarProps?: ISidebarProps;
  rightSidebarProps?: ISidebarProps;
  header?: ReactNode | (() => ReactNode);
  sideBarWidth?: number;
  allowFullCollapse?: boolean;
  renderSource?: 'modal' | 'designer-page';
}

export const SidebarContainer: FC<ISidebarContainerProps> = ({
  leftSidebarProps,
  rightSidebarProps,
  header,
  children,
  allowFullCollapse = false,
  noPadding,
  renderSource
}) => {
  const { formMode } = useShaFormInstance();
  const { styles } = useStyles();
  const [isOpenLeft, setIsOpenLeft] = useState(false);
  const [isOpenRight, setIsOpenRight] = useState(false);
  const { zoom, setCanvasZoom, setCanvasWidth, designerDevice, designerWidth, autoZoom } = useCanvas();
  const isSidebarCollapsed =
    typeof window !== 'undefined' &&
    localStorage.getItem('SIDEBAR_COLLAPSE') === 'true';


  const [currentSizes, setCurrentSizes] = useState(getPanelSizes(isOpenLeft, isOpenRight, leftSidebarProps, rightSidebarProps, allowFullCollapse).sizes);

  const handleDragSizesChange = useCallback((sizes: number[]) => {
    setCurrentSizes(sizes as any);
  }, []);

  const handleZoomChange = useCallback((newZoom: number) => {
    setCanvasZoom(newZoom);
  }, [setCanvasZoom]);

  const canvasRef = usePinchZoom(
    handleZoomChange,
    zoom,
    25,
    200,
    autoZoom
  );

  useEffect(() => {
    setCanvasWidth(designerWidth ?? `1024px`, designerDevice);
    setCanvasZoom(autoZoom ? calculateAutoZoom({currentZoom: zoom, designerWidth, sizes: currentSizes, isSidebarCollapsed, renderSource}) : zoom);
  }, [isOpenRight, isOpenLeft, autoZoom, designerDevice, designerWidth, currentSizes, isSidebarCollapsed]);
  

  useEffect(()=>{
    setCurrentSizes(getPanelSizes(isOpenLeft, isOpenRight, leftSidebarProps, rightSidebarProps, allowFullCollapse).sizes);
  },[isOpenRight, isOpenLeft]);

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
        gutterSize={8}
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
          <div ref={canvasRef} className={styles.sidebarContainerMainAreaBody} style={isDesigner ? { width: designerWidth, zoom: `${zoom}%`, overflow: 'auto', margin: '0 auto' } : {}}>{children}</div>
        </div>
        {renderSidebar('right')}
      </SizableColumns>
    </div>
  );
};