import { QuestionOutlined } from '@ant-design/icons';
import { MenuProps } from 'antd';
import classNames from 'classnames';
import React, { ReactNode } from 'react';
import { ISidebarMenuItem } from '@/providers/sidebarMenu';
import ShaIcon, { IconType } from '@/components/shaIcon';
import { ISidebarButton, isSidebarButton, isSidebarGroup } from '@/interfaces/sidebar';

type MenuItem = Required<MenuProps>['items'][number];

interface IGetItemArgs {
  label: React.ReactNode;
  key: React.Key;
  icon?: React.ReactNode;
  children?: MenuItem[];
  isParent?: boolean;
  onClick?: () => void;
}

function getItem({ label, key, icon, children, isParent, onClick }: IGetItemArgs): MenuItem {
  const clickHandler = (event) => {
    event.stopPropagation();
    onClick();
  };
  return {
    key,
    icon,
    children,
    label: (
      <a
        className={classNames('nav-links-renderer', { 'is-parent-menu': isParent })}
        onClick={onClick ? (e) => clickHandler(e) : undefined}
      >
        {label}
      </a>
    ),
  } as MenuItem;
}

const getIcon = (icon: ReactNode, isParent?: boolean, isRootItem?: boolean) => {
  if (typeof icon === 'string')
    return <ShaIcon iconName={icon as IconType} className={classNames({ 'is-parent-menu': isParent })} />;

  if (React.isValidElement(icon)) return icon;
  return isRootItem ? <QuestionOutlined /> : null; // Make sure there's always an Icon on the root item menu, even when not specified
};

export interface IProps {
  item: ISidebarMenuItem;
  isItemVisible: (item: ISidebarMenuItem) => boolean;
  isRootItem?: boolean;
  onButtonClick?: (item: ISidebarButton) => void;
}

// Note: Have to use function instead of react control. It's a known issue, you can only pass MenuItem or MenuGroup as Menu's children. See https://github.com/ant-design/ant-design/issues/4853
export const renderSidebarMenuItem = ({ item, isItemVisible, onButtonClick, isRootItem }: IProps) => {
  const { id: key, title, icon } = item;

  if (typeof isItemVisible === 'function' && !isItemVisible(item)) return null;
  
  const children = isSidebarGroup(item)
    ? item.childItems?.map((item) => renderSidebarMenuItem({ item, onButtonClick, isItemVisible }))
    : null;
  const hasChildren = Array.isArray(children) && children.length > 0;

  return getItem({
    label: title,
    key,
    icon: getIcon(icon, hasChildren, isRootItem),
    children: children,
    isParent: hasChildren,
    onClick: isSidebarButton(item) ? () => onButtonClick(item) : undefined,
  });
};

export default renderSidebarMenuItem;
