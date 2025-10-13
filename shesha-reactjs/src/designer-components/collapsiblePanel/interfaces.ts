import { headerType } from './../../components/panel/index';
import { IConfigurableFormComponent, IStyleType } from '@/providers/form/models';
import { isDefined } from '@/utils/nullables';
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
  desktop?: any;
  mobile?: any;
  tablet?: any;
};

// TODO: implement generic guard on the component level
export const isCollapsiblePanel = (component: IConfigurableFormComponent): component is ICollapsiblePanelComponentProps => isDefined(component) && component.type === 'collapsiblePanel';

export interface ICollapsiblePanelComponentPropsV0 extends IConfigurableFormComponent {
  collapsedByDefault?: boolean;
  expandIconPosition?: ExpandIconPosition;
  components?: IConfigurableFormComponent[];
}
