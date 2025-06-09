import { MenuProps, Tooltip } from 'antd';
import classNames from 'classnames';
import React, { ReactNode } from 'react';
import ShaIcon, { IconType } from '@/components/shaIcon';
import { ISidebarMenuItem, isSidebarButton, isSidebarGroup, SidebarItemType } from '@/interfaces/sidebar';
import { IConfigurableActionConfiguration } from '@/providers/index';
import Link from 'next/link';
import { QuestionCircleOutlined } from '@ant-design/icons';

type MenuItem = Required<MenuProps>['items'][number];

interface IGetItemArgs {
  label: React.ReactNode;
  key: React.Key;
  icon?: React.ReactNode;
  children?: MenuItem[];
  isParent?: boolean;
  itemType: SidebarItemType;
  url?: string;
  navigationType?: string;
  onClick?: () => void;
  tooltip?: string | ReactNode;
}

function getItem({ label, key, icon, children, isParent, itemType, onClick, navigationType, url, tooltip }: IGetItemArgs): MenuItem {
  const clickHandler = (event) => {
    event.preventDefault();
    onClick();
  };

  const className = classNames('nav-links-renderer', { 'is-parent-menu': isParent });

  return {
    key,
    icon,
    children,
    label: (() => {
      const baseContent = onClick
        ? ((navigationType === 'url' || navigationType === 'form')
          ? <Link className={className} href={url} onClick={clickHandler}>{label}</Link>
          : <Link href={''} className={className} onClick={clickHandler}>{label}</Link>)
        : <span className={className}>{label}</span>;
      
      if (!tooltip) return baseContent;
      
      const tooltipText = typeof tooltip === 'string' ? tooltip : undefined;
      return (
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
            {baseContent}
            <Tooltip title={tooltipText} placement="right">
              <QuestionCircleOutlined style={{ marginLeft: 8, fontSize: '12px', opacity: 0.6, zIndex: 1000 }} />
            </Tooltip>
          </span>
      );
    })(),
    type: itemType === 'divider' ? 'divider' : undefined,
  } as MenuItem;
}

const getIcon = (icon: ReactNode, isParent?: boolean) => {
  if (typeof icon === 'string')
    return <ShaIcon iconName={icon as IconType} className={classNames({ 'is-parent-menu': isParent })} />;

  if (React.isValidElement(icon)) return icon;
  return null;
};

export interface IProps {
  item: ISidebarMenuItem;
  onButtonClick?: (itemId: string, actionConfiguration: IConfigurableActionConfiguration) => void;
  onItemEvaluation?: (item: ISidebarMenuItem) => void;
  getFormUrl: (args) => string;
  getUrl: (args) => string;
}

export const sidebarMenuItemToMenuItem = ({ item, onButtonClick, onItemEvaluation, getFormUrl, getUrl }: IProps): MenuItem => {
  const { id, title, icon, itemType } = item;

  const navigationType = item?.actionConfiguration?.actionArguments?.navigationType;

  if (item.hidden) return null;

  const children = isSidebarGroup(item)
    ? item.childItems?.map((item) => sidebarMenuItemToMenuItem({ item, onButtonClick, onItemEvaluation, getFormUrl, getUrl }))
    : null;
  const hasChildren = Array.isArray(children) && children.length > 0;

  const actionConfiguration = isSidebarButton(item) ? item.actionConfiguration : undefined;

  let url;
  if (navigationType === 'form') {
    url = getFormUrl(actionConfiguration);
  } else if (navigationType === 'url') {
    url = getUrl(actionConfiguration?.actionArguments?.url);
  }

  const itemEvaluationArguments: IGetItemArgs = {
    label: title,
    key: id,
    icon: getIcon(icon, hasChildren),
    children: children,
    isParent: hasChildren,
    itemType,
    url,
    navigationType,
    onClick: actionConfiguration ? () => onButtonClick(id, actionConfiguration) : undefined,
    tooltip: item.tooltip,
  };
  if (onItemEvaluation)
    onItemEvaluation(item);

  return getItem(itemEvaluationArguments);
};