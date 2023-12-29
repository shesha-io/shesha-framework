import React, { FC, PropsWithChildren, ReactNode, useState } from 'react';
import classNames from 'classnames';
import { RightOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

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
}) => {
  const renderSidebar = (side: SidebarPanelPosition) => {
    const sidebarProps = side === 'left' ? leftSidebarProps : rightSidebarProps;
    return sidebarProps
      ? (<SidebarPanel {...sidebarProps} allowFullCollapse={allowFullCollapse} side={side}/>)
      : null;
  };

  return (
    <div className="sidebar-container">
      {header && <div className="sidebar-container-header">{typeof header === 'function' ? header() : header}</div>}

      <div className="sidebar-container-body">
        {renderSidebar('left')}

        <div
          className={classNames(
            'sidebar-container-main-area scroll scroll-x',
            { 'both-open': leftSidebarProps?.open && rightSidebarProps?.open },
            { 'left-only-open': leftSidebarProps?.open && !rightSidebarProps?.open },
            { 'right-only-open': rightSidebarProps?.open && !leftSidebarProps?.open },
            { 'no-left-panel': !leftSidebarProps },
            { 'no-right-panel': !rightSidebarProps },
            { 'allow-full-collapse': allowFullCollapse }
          )}
        >
          <div className="sidebar-container-main-area-body">{children}</div>
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
  const { side, allowFullCollapse } = props;

  const rotation = side === 'right' ? (props?.open ? 0 : 180) : props?.open ? 180 : 0;

  const { open, defaultOpen = true, onOpen, title, onClose, placeholder, content } = props;

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

  return (
    <div className={classNames(`sidebar-container-${side}`, { open: realOpen }, { 'allow-full-collapse': allowFullCollapse })}>
      <div className="sidebar-header">
        <div className={`sidebar-header-title ${side}`}>{typeof title === 'function' ? title() : title}</div>
        <div className={`sidebar-header-btn ${side}`} onClick={handleClick}>
          {props.placeholder ? (
            <Tooltip title={placeholder} placement={side === 'left' ? 'right' : 'left'}>
              <RightOutlined rotate={rotation} className="toggle-open-btn" />
            </Tooltip>
          ) : (
            <RightOutlined rotate={rotation} className="toggle-open-btn" />
          )}
        </div>
      </div>
      <div className="sidebar-body scroll scroll-y">
        <div className={classNames('sidebar-body-content', { open: realOpen })}>
          {typeof content === 'function' ? content() : content}
        </div>
        {!allowFullCollapse && <div className={classNames('sidebar-body-placeholder', { open: realOpen })} />}
      </div>
    </div>
  );
};

export default SidebarContainer;
