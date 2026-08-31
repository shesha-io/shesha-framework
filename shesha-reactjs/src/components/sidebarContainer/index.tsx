import {
  FC,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';
import classNames from 'classnames';

import { ISidebarProps, SidebarPanelPosition } from './models';
import { SidebarPanel } from './sidebarPanel';
import { useStyles } from './styles/styles';
import { SizableColumns } from '../sizableColumns';
import { getPanelSizes } from './utilis';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
export interface ISidebarContainerProps extends PropsWithChildren {
  leftSidebarProps?: ISidebarProps | undefined;
  rightSidebarProps?: ISidebarProps | undefined;
  header?: ReactNode | (() => ReactNode) | undefined;
  sideBarWidth?: number | undefined;
  allowFullCollapse?: boolean | undefined;
  configTreePanelSize?: string | number | undefined;
  noPadding?: boolean | undefined;
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
  embedded = false,
  storeName,
}) => {
  const { styles } = useStyles();
  const [isOpenLeftLocal, setIsOpenLeftLocal] = useState(false);
  const [isOpenRightLocal, setIsOpenRightLocal] = useState(false);
  const storeKey = isNullOrWhiteSpace(storeName) ? 'sidebarContainer.transient' : storeName;
  const [isOpenLeftStore, setIsOpenLeftStore] = useLocalStorage(`${storeKey}.isOpenLeft`, false);
  const [isOpenRightStore, setIsOpenRightStore] = useLocalStorage(`${storeKey}.isOpenRight`, false);

  const isOpenLeft = isNullOrWhiteSpace(storeName) ? isOpenLeftLocal : isOpenLeftStore;
  const isOpenRight = isNullOrWhiteSpace(storeName) ? isOpenRightLocal : isOpenRightStore;

  const setIsOpenLeft = isNullOrWhiteSpace(storeName) ? setIsOpenLeftLocal : setIsOpenLeftStore;
  const setIsOpenRight = isNullOrWhiteSpace(storeName) ? setIsOpenRightLocal : setIsOpenRightStore;

  const [currentSizes, setCurrentSizes] = useState(() => getPanelSizes(isOpenLeft, isOpenRight, leftSidebarProps, rightSidebarProps, allowFullCollapse).sizes);

  const handleDragSizesChange = useCallback((sizes: number[]) => {
    setCurrentSizes(sizes);
  }, []);

  useEffect(() => {
    setCurrentSizes(getPanelSizes(isOpenLeft, isOpenRight, leftSidebarProps, rightSidebarProps, allowFullCollapse).sizes);
  }, [isOpenRight, isOpenLeft, leftSidebarProps, rightSidebarProps, allowFullCollapse]);

  const sizes = useMemo(() => getPanelSizes(isOpenLeft, isOpenRight, leftSidebarProps, rightSidebarProps, allowFullCollapse),
    [isOpenRight, leftSidebarProps, rightSidebarProps, allowFullCollapse, isOpenLeft],
  );

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
        // gutterSize={DEFAULT_OPTIONS.gutter}
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
            { 'both-open': leftSidebarProps?.open === true && rightSidebarProps?.open === true },
            { 'left-only-open': leftSidebarProps?.open === true && rightSidebarProps?.open !== true },
            { 'right-only-open': rightSidebarProps?.open === true && leftSidebarProps?.open !== true },
            { 'no-left-panel': !leftSidebarProps },
            { 'no-right-panel': !rightSidebarProps },
            { 'no-padding': noPadding },
            { 'allow-full-collapse': allowFullCollapse },
          )}
        >
          {children}
        </div>
        {renderSidebar('right')}
      </SizableColumns>
    </div>
  );
};
