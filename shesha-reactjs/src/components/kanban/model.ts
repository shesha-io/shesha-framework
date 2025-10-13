import { IConfigurableFormComponent } from '@/providers/form/models';
import { IButtonGroupItem, IButtonItem, IStyleType } from '@/providers';
import { CSSProperties } from 'styled-components';

export type RefListGroupItemProps = IRefListItemFormModel | IRefListItemGroup;

export interface IRefListGroupItemBase extends IButtonItem {
  referenceList?: any;
  item?: string;
}

export type IRefListItemFormModel = IRefListGroupItemBase;

export interface IRefListItemGroup extends IRefListGroupItemBase {
  childItems?: RefListGroupItemProps[];
}

export interface IKanbanButton extends IButtonGroupItem {
  itemValue: number;
  item: string;
}
export interface IKanbanProps extends IConfigurableFormComponent, IStyleType {
  items?: IKanbanButton[];
  referenceList?: any;
  fontColor?: string;
  showIcons?: boolean;
  fontSize?: number;
  entityType?: string;
  allowNewRecord?: boolean;
  readonly?: boolean;
  collapsible?: boolean;
  gap?: number;
  headerStyles?: CSSProperties | string;
  columnStyle?: CSSProperties | string;
  groupingProperty?: string;
  modalFormId?: string;
  createFormId?: string;
  actionConfiguration?: any;
  kanbanReadonly?: boolean;
  componentName?: string;
  editFormId?: string;
  allowEdit?: boolean;
  allowDelete?: boolean;
  columnStyles?: IStyleType;
}
