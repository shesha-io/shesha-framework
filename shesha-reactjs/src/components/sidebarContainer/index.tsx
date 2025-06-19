import React, { FC, PropsWithChildren, ReactNode, useEffect, useState, useMemo } from 'react';
import classNames from 'classnames';
import _ from 'lodash';

import { ISidebarProps, SidebarPanelPosition } from './models';
import { SidebarPanel } from './sidebarPanel';
import { useStyles } from './styles/styles';
import { SizableColumns } from '../sizableColumns';
import { getPanelSizes } from './utilis';

export interface ISidebarContainerProps extends PropsWithChildren<any> {
  leftSidebarProps?: ISidebarProps;
  rightSidebarProps?: ISidebarProps;
  header?: ReactNode | (() => ReactNode);
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
  const [isOpenLeft, setIsOpenLeft] = useState(false);
  const [isOpenRight, setIsOpenRight] = useState(false);


  const [currentSizes, setCurrentSizes] = useState([]);

  useEffect(() => {
    const newSizes = getPanelSizes(isOpenLeft, isOpenRight, leftSidebarProps, rightSidebarProps, allowFullCollapse);
    setCurrentSizes(newSizes.sizes);
  }, [isOpenRight, isOpenLeft]);

  const sizes = useMemo(() => getPanelSizes(isOpenLeft, isOpenRight, leftSidebarProps, rightSidebarProps, allowFullCollapse),
    [isOpenRight, leftSidebarProps, rightSidebarProps, allowFullCollapse, isOpenLeft]
  );

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
          <div className={styles.sidebarContainerMainAreaBody}>{children}</div>
        </div>

        {renderSidebar('right')}
      </SizableColumns>
    </div>
  );
};