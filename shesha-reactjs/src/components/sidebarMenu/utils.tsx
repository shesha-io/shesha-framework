import { QuestionOutlined } from '@ant-design/icons';
import { MenuProps } from 'antd';
import classNames from 'classnames';
import React, { ReactNode } from 'react';
import { ISidebarMenuItem } from '@/providers/sidebarMenu';
import ShaIcon, { IconType } from '@/components/shaIcon';
import { ISidebarButton, isSidebarButton, isSidebarGroup, SidebarItemType } from '@/interfaces/sidebar';

type MenuItem = Required<MenuProps>['items'][number];

interface IGetItemArgs {
  label: React.ReactNode;
  key: React.Key;
  icon?: React.ReactNode;
  children?: MenuItem[];
  isParent?: boolean;
  itemType: SidebarItemType;
  onClick?: () => void;
}

function getItem({ label, key, icon, children, isParent, itemType, onClick }: IGetItemArgs): MenuItem {
  const clickHandler = (event) => {
    event.stopPropagation();
    onClick();
  };

  const className = classNames('nav-links-renderer', { 'is-parent-menu': isParent });

  return {
    key,
    icon,
    children,
    label: Boolean(onClick)
      ? <a className={className} onClick={clickHandler}>{label}</a>
      : <span className={className}>{label}</span>,
    type: itemType === 'divider' ? 'divider' : undefined,
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
  onItemEvaluation?: (item: ISidebarMenuItem) => void;
}

// Note: Have to use function instead of react control. It's a known issue, you can only pass MenuItem or MenuGroup as Menu's children. See https://github.com/ant-design/ant-design/issues/4853
export const renderSidebarMenuItem = ({ item, isItemVisible, onButtonClick, isRootItem, onItemEvaluation }: IProps) => {
  const { id: key, title, icon, itemType } = item;

  if (typeof isItemVisible === 'function' && !isItemVisible(item)) return null;

  const children = isSidebarGroup(item)
    ? item.childItems?.map((item) => renderSidebarMenuItem({ item, onButtonClick, isItemVisible, onItemEvaluation }))
    : null;
  const hasChildren = Array.isArray(children) && children.length > 0;

  const itemEvaluationArguments: IGetItemArgs = {
    label: title,
    key,
    icon: getIcon(icon, hasChildren, isRootItem),
    children: children,
    isParent: hasChildren,
    itemType,
    onClick: isSidebarButton(item) ? () => onButtonClick(item) : undefined,
  };
  if (onItemEvaluation)
    onItemEvaluation(item);

  return getItem(itemEvaluationArguments);
};

export default renderSidebarMenuItem;