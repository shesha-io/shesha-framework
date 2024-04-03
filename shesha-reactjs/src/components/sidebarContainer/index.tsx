import classNames from 'classnames';
import React, { FC, PropsWithChildren, ReactNode, useMemo } from 'react';
import { ISidebarProps, SidebarPanelPosition } from './models';
import { SidebarPanel } from './sidebarPanel';
import { useStyles } from './styles/styles';
import {  useCanvasConfig } from '@/providers/canvasConfig';


export interface ISidebarContainerProps extends PropsWithChildren<any> {
  /**
   * Left sidebar props
   */
  leftSidebarProps?: ISidebarProps;

  /**
   * Right sidebar props
   */
  rightSidebarProps?: ISidebarProps;

  /**
   * Container header
   */
  header?: ReactNode | (() => ReactNode);

  /**
   * sidebar width. By default it's 250px
   */
  sideBarWidth?: number;

  allowFullCollapse?: boolean;
}

 export const SidebarContainer: FC<ISidebarContainerProps> = ({
  leftSidebarProps,
  rightSidebarProps,
  header,
  children,
  allowFullCollapse = false,
  noPadding,
}) => {
  const { styles } = useStyles();
  const {width,zoom}=useCanvasConfig();
  const renderSidebar = (side: SidebarPanelPosition) => {
    const sidebarProps = side === 'left' ? leftSidebarProps : rightSidebarProps;
    return sidebarProps
      ? (<SidebarPanel {...sidebarProps} allowFullCollapse={allowFullCollapse} side={side} />)
      : null;
  };

  const magnifiedWidth = useMemo(()=>width * (zoom/100),[width,zoom]);




  return (
    <div className={styles.sidebarContainer}>
      {header && <div className={styles.sidebarContainerHeader}>{typeof header === 'function' ? header() : header}</div>}

      <div className={styles.sidebarContainerBody}>
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
          <div className={styles.sidebarContainerMainAreaBody} style={{width:`${magnifiedWidth}%`, zoom:`${zoom}%`,overflow:'auto'}}>{children}</div>
        </div>

        {renderSidebar('right')}
      </div>
    </div>
  );
};
