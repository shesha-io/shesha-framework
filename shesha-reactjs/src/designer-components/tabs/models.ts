import { TabPaneProps } from 'antd';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { ComponentDefinition, EditMode, IConfigurableFormComponent, IInputStyles, IStyleValue } from '@/interfaces';
import { CSSProperties } from 'react';

export interface ICardProps {
  card?: (IInputStyles & { activeStyle?: string | undefined }) | undefined;
}

/** @deprecated migrate to ITabPaneProps */
export interface ITabPanePropsV0 extends IStyleValue, Omit<TabPaneProps, 'children' | 'tab' | 'style' | 'tabKey' | 'disabled' | 'destroyInactiveTabPane'> {
  id: string;
  type?: string | undefined;
  icon?: string | undefined;
  key: string;
  title: string;
  components?: IConfigurableFormComponent[] | undefined;
  childItems?: ITabPanePropsV0[] | undefined;
  editMode?: EditMode | undefined;
  selectMode?: EditMode | undefined;
  readOnly?: boolean | undefined;
  style?: string | undefined;

  label?: string | undefined;
  name?: string | undefined;
  tooltip?: string | undefined;

  desktop?: IInputStyles | undefined;
  mobile?: IInputStyles | undefined;
  tablet?: IInputStyles | undefined;

  destroyInactiveTabPane?: boolean;
}

/** @deprecated migrate to ITabsComponentProps */
export interface ITabsComponentPropsV0 extends IConfigurableFormComponent, IStyleValue, ICardProps {
  tabs: ITabPanePropsV0[];
  size?: SizeType | undefined;
  defaultActiveKey?: string | undefined;
  tabType?: 'line' | 'card' | undefined;
  tabLineColor?: string | undefined;
  ghost?: boolean | undefined;
  customVisibility?: string | undefined;
  tabPosition?: 'left' | 'right' | 'top' | 'bottom' | undefined;
  desktop?: IInputStyles & ICardProps | undefined;
  mobile?: IInputStyles & ICardProps | undefined;
  tablet?: IInputStyles & ICardProps | undefined;
}

export interface ITabPaneProps extends IStyleValue, Omit<TabPaneProps, 'children' | 'tab' | 'style' | 'tabKey' | 'disabled' | 'destroyInactiveTabPane'> {
  id: string;
  type?: string | undefined;
  icon?: string | undefined;
  key: string;
  title: string;
  visible?: boolean | undefined;
  visiblePermissions?: string[] | undefined;
  components?: IConfigurableFormComponent[] | undefined;
  childItems?: ITabPaneProps[] | undefined;
  editMode?: EditMode | undefined;
  editModePermissions?: string[] | undefined;
  disabled?: boolean | undefined;
  readOnly?: boolean | undefined;
  style?: string | undefined;

  label?: string | undefined;
  name?: string | undefined;
  tooltip?: string | undefined;

  desktop?: IInputStyles | undefined;
  mobile?: IInputStyles | undefined;
  tablet?: IInputStyles | undefined;

  destroyInactiveTabPane?: boolean;
}

export interface ITabsComponentProps extends IConfigurableFormComponent, IStyleValue, ICardProps {
  tabs: ITabPaneProps[];
  size?: SizeType | undefined;
  defaultActiveKey?: string | undefined;
  tabType?: 'line' | 'card' | undefined;
  tabLineColor?: string | undefined;
  ghost?: boolean | undefined;
  customVisibility?: string | undefined;
  tabPosition?: 'left' | 'right' | 'top' | 'bottom' | undefined;
  desktop?: IInputStyles & ICardProps | undefined;
  mobile?: IInputStyles & ICardProps | undefined;
  tablet?: IInputStyles & ICardProps | undefined;
}

interface ITabsComponentCalculatedModel {
  cardStyleCss: CSSProperties;
  activeCardStyleCss: CSSProperties;
}

export type TabsComponentDefinition = ComponentDefinition<"tabs", ITabsComponentProps, ITabsComponentCalculatedModel>;
