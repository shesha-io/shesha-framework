import { IConfigurableFormComponent } from '../../../../providers/form/models';
import { ExpandIconPosition } from 'antd/lib/collapse/Collapse';

export interface ICollapsiblePanelComponentProps extends IConfigurableFormComponent {
    collapsedByDefault?: boolean;
    expandIconPosition?: ExpandIconPosition;
    components?: IConfigurableFormComponent[];
}