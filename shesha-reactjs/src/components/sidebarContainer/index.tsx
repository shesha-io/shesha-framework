import React, { FC, PropsWithChildren, ReactNode, useEffect, useState, useMemo, useCallback } from 'react';
import classNames from 'classnames';

import { ISidebarProps, SidebarPanelPosition } from './models';
import { SidebarPanel } from './sidebarPanel';
import { useStyles } from './styles/styles';
import { SizableColumns } from '../sizableColumns';
import { getPanelSizes } from './utilis';
import { DEFAULT_OPTIONS } from '@/providers/canvas/utils';
export interface ISidebarContainerProps extends PropsWithChildren<any> {
  leftSidebarProps?: ISidebarProps;
  rightSidebarProps?: ISidebarProps;
  header?: ReactNode | (() => ReactNode);
  sideBarWidth?: number;
  allowFullCollapse?: boolean;
  configTreePanelSize?: string | number;
  noPadding?: boolean;
  onDragSizesChange?: (sizes: number[]) => void;
  onToggleLeft?: (isOpen: boolean) => void;
  onToggleRight?: (isOpen: boolean) => void;
}

export const SidebarContainer: FC<ISidebarContainerProps> = ({
  leftSidebarProps,
  rightSidebarProps,
  header,
  children,
  allowFullCollapse = false,
  noPadding,
  onDragSizesChange,
  onToggleLeft,
  onToggleRight,
}) => {
  const { styles } = useStyles();
  const [isOpenLeft, setIsOpenLeft] = useState(false);
  const [isOpenRight, setIsOpenRight] = useState(false);

  const [currentSizes, setCurrentSizes] = useState(getPanelSizes(isOpenLeft, isOpenRight, leftSidebarProps, rightSidebarProps, allowFullCollapse).sizes);

  const handleDragSizesChange = useCallback((sizes: number[]) => {
    setCurrentSizes(sizes);
    onDragSizesChange?.(sizes);
  }, [onDragSizesChange]);

  // Notify parent when sidebars toggle
  useEffect(() => {
    onToggleLeft?.(isOpenLeft);
  }, [isOpenLeft, onToggleLeft]);

  useEffect(() => {
    onToggleRight?.(isOpenRight);
  }, [isOpenRight, onToggleRight]);

  useEffect(() => {
    setCurrentSizes(getPanelSizes(isOpenLeft, isOpenRight, leftSidebarProps, rightSidebarProps, allowFullCollapse).sizes);
  }, [isOpenRight, isOpenLeft, leftSidebarProps, rightSidebarProps, allowFullCollapse]);

  const sizes = useMemo(() => getPanelSizes(isOpenLeft, isOpenRight, leftSidebarProps, rightSidebarProps, allowFullCollapse),
    [isOpenRight, leftSidebarProps, rightSidebarProps, allowFullCollapse, isOpenLeft],
  );

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
            className={classNames(
              styles.sidebarContainerMainAreaBody,
            )}
          >
            {children}
          </div>
        </div>
        {renderSidebar('right')}
      </SizableColumns>
    </div>
  );
};
