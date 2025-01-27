import { headerType } from './../../components/panel/index';
import { IConfigurableFormComponent, IStyleType } from '@/providers/form/models';
import { ExpandIconPosition } from 'antd/lib/collapse/Collapse';
import { CollapsibleType } from 'antd/lib/collapse/CollapsePanel';

export interface ICollapsiblePanelContent {
  id: string;
  components?: IConfigurableFormComponent[];
}

export interface ICollapsiblePanelComponentProps extends IConfigurableFormComponent, IStyleType {
  collapsedByDefault?: boolean;
  expandIconPosition?: ExpandIconPosition | 'hide';
  header?: ICollapsiblePanelContent;
  content?: ICollapsiblePanelContent;
  collapsible?: CollapsibleType;
  ghost?: boolean;
  hideWhenEmpty?: boolean;
  className?: string;
  marginBottom?: string;
  marginTop?: string;
  headerColor?: string;
  bodyColor?: string;
  isSimpleDesign?: boolean;
  hideCollapseContent?: boolean;
  borderRadius?: number;
  hasCustomHeader?: boolean;
  customHeader?: ICollapsiblePanelContent;
  panelHeadType?: headerType;
  headerStyles?: IStyleType;
  desktop?: IStyleType;
  mobile?: IStyleType;
  tablet?: IStyleType;
};

export interface ICollapsiblePanelComponentPropsV0 extends IConfigurableFormComponent {
  collapsedByDefault?: boolean;
  expandIconPosition?: ExpandIconPosition;
  components?: IConfigurableFormComponent[];
}
