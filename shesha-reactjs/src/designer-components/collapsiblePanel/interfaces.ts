import { ComponentDefinition } from '@/interfaces';
import { headerType } from './../../components/panel/index';
import { IConfigurableFormComponent, IStyleType } from '@/providers/form/models';
import { isDefined } from '@/utils/nullables';
import { CollapsibleType } from 'antd/lib/collapse/CollapsePanel';
import { Collapse } from 'antd';
import { ComponentProps, ReactNode } from 'react';

type ExpandIconPlacement = ComponentProps<typeof Collapse>['expandIconPlacement'];

export interface ICollapsiblePanelContent {
  id: string;
  components?: IConfigurableFormComponent[];
}

export interface ICollapsiblePanelComponentProps extends IConfigurableFormComponent, IStyleType {
  label?: string | ReactNode;
  collapsedByDefault?: boolean;
  expandIconPosition?: ExpandIconPlacement | 'hide';
  header?: ICollapsiblePanelContent;
  content?: ICollapsiblePanelContent | undefined;
  collapsible?: CollapsibleType;
  ghost?: boolean;
  accentStyle?: boolean;
  hideWhenEmpty?: boolean;
  className?: string;
  marginBottom?: string;
  marginTop?: string;
  headerColor?: string;
  bodyColor?: string;
  isSimpleDesign?: boolean;
  hideCollapseContent?: boolean;
  borderRadius?: number;
  noMargin?: boolean;
  hasCustomHeader?: boolean;
  customHeader?: ICollapsiblePanelContent;
  panelHeadType?: headerType;
  headerStyles?: IStyleType;
};

// TODO: implement generic guard on the component level
export const isCollapsiblePanel = (component: IConfigurableFormComponent): component is ICollapsiblePanelComponentProps => isDefined(component) && component.type === 'collapsiblePanel';

type ExpandIconPositionLegacy = 'left' | 'right';

export interface ICollapsiblePanelComponentPropsV0 extends IConfigurableFormComponent {
  collapsedByDefault?: boolean;
  expandIconPosition?: ExpandIconPositionLegacy;
  components?: IConfigurableFormComponent[];
}

export type CollapsiblePanelComponentDefinition = ComponentDefinition<"collapsiblePanel", ICollapsiblePanelComponentProps>;
