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
  collapsedByDefault?: boolean | undefined;
  expandIconPosition?: ExpandIconPlacement | 'hide' | undefined;
  header?: ICollapsiblePanelContent | undefined;
  content?: ICollapsiblePanelContent | undefined;
  collapsible?: CollapsibleType | undefined;
  ghost?: boolean | undefined;
  accentStyle?: boolean | undefined;
  hideWhenEmpty?: boolean | undefined;
  className?: string | undefined;
  marginBottom?: string | undefined;
  marginTop?: string | undefined;
  headerColor?: string | undefined;
  bodyColor?: string | undefined;
  isSimpleDesign?: boolean | undefined;
  hideCollapseContent?: boolean | undefined;
  borderRadius?: number | undefined;
  noMargin?: boolean | undefined;
  hasCustomHeader?: boolean | undefined;
  customHeader?: ICollapsiblePanelContent | undefined;
  panelHeadType?: headerType | undefined;
  headerStyles?: IStyleType | undefined;
};

// TODO: implement generic guard on the component level
export const isCollapsiblePanel = (component: IConfigurableFormComponent): component is ICollapsiblePanelComponentProps => isDefined(component) && component.type === 'collapsiblePanel';

type ExpandIconPositionLegacy = 'left' | 'right';

export interface ICollapsiblePanelComponentPropsV0 extends IConfigurableFormComponent {
  collapsedByDefault?: boolean | undefined;
  expandIconPosition?: ExpandIconPositionLegacy | undefined;
  components?: IConfigurableFormComponent[] | undefined;
}

export type CollapsiblePanelComponentDefinition = ComponentDefinition<"collapsiblePanel", ICollapsiblePanelComponentProps>;
