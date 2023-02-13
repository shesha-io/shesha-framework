import { QuestionOutlined } from '@ant-design/icons';
import { MenuProps } from 'antd';
import classNames from 'classnames';
import React, { ReactNode } from 'react';
import { ISidebarMenuItem } from '../../providers/sidebarMenu';
import ShaIcon, { IconType } from '../shaIcon';

type MenuItem = Required<MenuProps>['items'][number];

interface IGetItemArgs {
  label: React.ReactNode;
  target: string;
  key: React.Key;
  icon?: React.ReactNode;
  children?: MenuItem[];
  isParent?: boolean;
  navigate: (url: string) => void;
}

function getItem({ label, target, key, icon, children, isParent, navigate } : IGetItemArgs): MenuItem {
  const clickHandler = (event, url) => {
    event.stopPropagation();
    navigate(url);
  }
  return {
    key,
    icon,
    children,
    label: (
      <a className={classNames('nav-links-renderer', { 'is-parent-menu': isParent })} onClick={target ? e => clickHandler(e, target) : undefined}>
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

export interface IProps extends ISidebarMenuItem {
  isSubMenu?: boolean;
  isItemVisible: (item: ISidebarMenuItem) => boolean;
  navigate: (url: string) => void;
}

// Note: Have to use function instead of react control. It's a known issue, you can only pass MenuItem or MenuGroup as Menu's children. See https://github.com/ant-design/ant-design/issues/4853
export const renderSidebarMenuItem = (props: IProps) => {
  const { id: key, title, icon, childItems, target, isItemVisible, isRootItem } = props;

  if (typeof isItemVisible === 'function' && !isItemVisible(props)) return null;

  const hasChildren = childItems?.length > 0;

  return getItem({
    label: title,
    target,
    key,
    icon: getIcon(icon, hasChildren, isRootItem),
    children: hasChildren ? childItems?.map(item => renderSidebarMenuItem({ ...item, navigate: props.navigate, isItemVisible: props.isItemVisible })) : null,
    isParent: hasChildren,
    navigate: props.navigate
  });
};

export default renderSidebarMenuItem;
