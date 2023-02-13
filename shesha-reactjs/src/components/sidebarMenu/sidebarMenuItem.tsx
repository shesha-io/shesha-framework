import { Menu } from 'antd';
import React from 'react';
import { ISidebarMenuItem } from '../../providers/sidebarMenu';
import { ShaLink } from '../shaLink';
import classNames from 'classnames';
import ShaIcon, { IconType } from '../shaIcon';

const { SubMenu } = Menu;

export const getMenuItemKey = (title: string): string => {
  return title
    ?.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => (index === 0 ? word?.toLowerCase() : word?.toUpperCase()))
    .replace(/\s+/g, '');
};

export interface IProps extends ISidebarMenuItem {
  isSubMenu?: boolean;
  isItemVisible: (item: ISidebarMenuItem) => boolean;
}

// Note: Have to use function instead of react control. It's a known issue, you can only pass MenuItem or MenuGroup as Menu's children. See https://github.com/ant-design/ant-design/issues/4853
export const renderSidebarMenuItem = (props: IProps) => {
  const { id: key, title: title, icon, childItems, target: target, isSubMenu } = props;

  if (!props.isItemVisible(props)) return null;

  const renderedIcon = icon ? (
    typeof icon === 'string' ? (
      <ShaIcon iconName={icon as IconType} />
    ) : React.isValidElement(icon) ? (
      icon
    ) : null
  ) : null;

  if (childItems && childItems.length > 0)
    return (
      <SubMenu
        key={key}
        className="is-ant-menu-item"
        title={
          <span>
            {renderedIcon}
            <span>
              <a className="nav-links-renderer" href={target}>
                {title}
              </a>
            </span>
          </span>
        }
      >
        {childItems.map(child =>
          renderSidebarMenuItem({ ...child, isSubMenu: true, isItemVisible: props.isItemVisible })
        )}
      </SubMenu>
    );

  return (
    <Menu.Item
      key={key}
      className={classNames({
        'ant-menu-item-is-submenu': isSubMenu,
      })}
      title={title}
    >
      <ShaLink linkTo={target} icon={renderedIcon} displayName={title} />
    </Menu.Item>
  );
};

export default renderSidebarMenuItem;
