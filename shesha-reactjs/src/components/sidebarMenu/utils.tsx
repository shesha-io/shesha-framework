/* eslint @typescript-eslint/strict-boolean-expressions: "error" */
import { MenuProps, Tooltip } from 'antd';
import classNames from 'classnames';
import { ReactNode } from 'react';
import * as React from 'react';
import { ShaIcon, IconType } from '@/components/shaIcon';
import { ISidebarMenuItem, isSidebarButton, isSidebarGroup, SidebarItemType } from '@/interfaces/sidebar';
import { IConfigurableActionConfiguration, isNavigationActionConfiguration } from '@/providers/index';
import Link from 'next/link';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { isDefined, isNullOrWhiteSpace } from '@/utils';

type MenuItem = Required<MenuProps>['items'][number];

interface IGetItemArgs {
  label: React.ReactNode;
  key: React.Key;
  icon?: React.ReactNode;
  children?: MenuItem[] | undefined;
  isParent?: boolean | undefined;
  itemType: SidebarItemType;
  url?: string | undefined;
  navigationType?: string | undefined;
  onClick?: (() => void) | undefined;
  tooltip?: ReactNode;
}

function getItem({ label, key, icon, children, isParent, itemType, onClick, navigationType, url, tooltip }: IGetItemArgs): MenuItem {
  const clickHandler: React.MouseEventHandler = (event): void => {
    event.preventDefault();
    onClick?.();
  };

  const className = classNames('nav-links-renderer', { 'is-parent-menu': isParent });

  return {
    key,
    icon,
    children,
    label: (() => {
      const baseContent = onClick
        ? ((navigationType === 'url' || navigationType === 'form')
          ? (
            <Link
              className={className}
              href={url ?? ""}
              onClick={clickHandler}
            >
              {label}
            </Link>
          )
          : <span className={className} onClick={clickHandler}>{label}</span>)
        : <span className={className}>{label}</span>;

      const hasTooltip = isDefined(tooltip) && (typeof tooltip !== 'string' || !isNullOrWhiteSpace(tooltip));
      if (!hasTooltip) return baseContent;

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

const getIcon = (icon: ReactNode, isParent?: boolean): ReactNode => {
  if (typeof icon === 'string')
    return <ShaIcon iconName={icon as IconType} className={classNames({ 'is-parent-menu': isParent })} />;

  if (React.isValidElement(icon)) return icon;
  return null;
};

export interface IProps {
  item: ISidebarMenuItem;
  onButtonClick?: ((itemId: string, actionConfiguration: IConfigurableActionConfiguration) => void) | undefined;
  onItemEvaluation?: ((item: ISidebarMenuItem) => void) | undefined;
  getFormUrl: (args: IConfigurableActionConfiguration | undefined) => string;
  getUrl: (url: string) => string;
}

export const sidebarMenuItemToMenuItem = ({ item, onButtonClick, onItemEvaluation, getFormUrl, getUrl }: IProps): MenuItem => {
  const { id, title, icon, itemType } = item;

  if (item.hidden === true) return null;

  const children = isSidebarGroup(item)
    ? item.childItems?.map((item) => sidebarMenuItemToMenuItem({ item, onButtonClick, onItemEvaluation, getFormUrl, getUrl }))
    : null;
  const hasChildren = Array.isArray(children) && children.length > 0;

  const actionConfiguration = isSidebarButton(item) ? item.actionConfiguration : undefined;

  const navigationType = isNavigationActionConfiguration(actionConfiguration)
    ? actionConfiguration.actionArguments?.navigationType
    : undefined;

  const url = isNavigationActionConfiguration(actionConfiguration)
    ? navigationType === 'form'
      ? getFormUrl(actionConfiguration)
      : navigationType === 'url'
        ? getUrl(actionConfiguration.actionArguments?.url ?? "")
        : undefined
    : undefined;

  const itemEvaluationArguments: IGetItemArgs = {
    label: title,
    key: id,
    icon: getIcon(icon, hasChildren),
    children: children ?? undefined,
    isParent: hasChildren,
    itemType,
    url,
    navigationType,
    onClick: actionConfiguration && onButtonClick ? () => onButtonClick(id, actionConfiguration) : undefined,
    tooltip: item.tooltip,
  };
  if (onItemEvaluation)
    onItemEvaluation(item);

  return getItem(itemEvaluationArguments);
};
