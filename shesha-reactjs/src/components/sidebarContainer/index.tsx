import React, { FC, PropsWithChildren, ReactNode, useState } from 'react';
import classNames from 'classnames';
import { RightOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { useStyles } from './styles/styles';

interface ISidebarProps {
  /**
   * Whether it's open or not
   */
  open?: boolean;
  /**
   * Whether it's open or not by default. Is used for non-controlled mode
   */
  defaultOpen?: boolean;

  width?: number;

  /**
   * The title
   */
  title: ReactNode | (() => ReactNode);

  /**
   * The content
   */
  content: ReactNode | (() => ReactNode);

  /**
   * What should happen when the sidebar opens
   */
  onOpen?: () => void;

  /**
   * What should happen when the sidebar closes
   */
  onClose?: () => void;

  placeholder?: string;

  className?: string;

  /**
   * Whether there should no be padding
   */
   noPadding?: boolean;
}

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
  const renderSidebar = (side: SidebarPanelPosition) => {
    const sidebarProps = side === 'left' ? leftSidebarProps : rightSidebarProps;
    return sidebarProps
      ? (<SidebarPanel {...sidebarProps} allowFullCollapse={allowFullCollapse} side={side}/>)
      : null;
  };

  return (
    <div className={styles.sidebarContainer}>
      {header && <div className={styles.sidebarContainerHeader}>{typeof header === 'function' ? header() : header}</div>}

      <div className={styles.sidebarContainerBody}>
        {renderSidebar('left')}

        <div
          className={classNames(
            styles.sidebarContainerMainArea,
            'scroll scroll-x',
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
      </div>
    </div>
  );
};

type SidebarPanelPosition = 'left' | 'right';
interface SidebarPanelProps extends ISidebarProps {
  side: SidebarPanelPosition;
  allowFullCollapse: boolean;
}
const SidebarPanel: FC<SidebarPanelProps> = (props) => {
  const { styles } = useStyles();
  const { side, allowFullCollapse } = props;

  const rotation = side === 'right' ? (props?.open ? 0 : 180) : props?.open ? 180 : 0;

  const { open, defaultOpen = true, onOpen, title, onClose, placeholder, content, className } = props;

  const isControllable = open !== undefined;
  const [isOpen, setIsOpen] = useState(isControllable ? open : defaultOpen);
  const realOpen = isControllable ? open : isOpen;

  const handleClick = () => {
    const handler = realOpen ? onClose : onOpen;
    if (handler)
      handler();
    if (!isControllable)
      setIsOpen(!isOpen);
  };

  const sideClassName = side === 'right' ? styles.sidebarContainerRight : styles.sidebarContainerLeft;
  return (
    <div className={classNames(sideClassName, { open: realOpen }, { 'allow-full-collapse': allowFullCollapse }, className)}>
      <div className={styles.sidebarHeader}>
        <div className={`${styles.sidebarHeaderTitle} ${side}`}>{typeof title === 'function' ? title() : title}</div>
        <div className={`${styles.sidebarHeaderBtn} ${side}`} onClick={handleClick}>
          {props.placeholder ? (
            <Tooltip title={placeholder} placement={side === 'left' ? 'right' : 'left'}>
              <RightOutlined rotate={rotation} className="toggle-open-btn" />
            </Tooltip>
          ) : (
            <RightOutlined rotate={rotation} className="toggle-open-btn" />
          )}
        </div>
      </div>
      <div className={`${styles.sidebarBody} scroll scroll-y`}>
        <div className={classNames(styles.sidebarBodyContent, { open: realOpen })}>
          {typeof content === 'function' ? content() : content}
        </div>
        {!allowFullCollapse && <div className={classNames(styles.sidebarBodyPlaceholder, { open: realOpen })} />}
      </div>
    </div>
  );
};