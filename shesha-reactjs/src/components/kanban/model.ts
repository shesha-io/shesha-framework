import { IConfigurableFormComponent } from '@/providers/form/models';
import { IButtonGroupItem, IConfigurableActionConfiguration, IStyleType } from '@/providers';
import { CSSProperties } from 'react';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';
import { IReferenceListIdentifier } from '@/interfaces';

export interface IKanbanButton extends IButtonGroupItem {
  itemValue: number;
  item: string;
}
export interface IKanbanProps extends IConfigurableFormComponent, IStyleType {
  items?: IKanbanButton[] | undefined;
  referenceList?: IReferenceListIdentifier | undefined;
  fontColor?: string | undefined;
  showIcons?: boolean | undefined;
  fontSize?: number | undefined;
  entityType?: string | IEntityTypeIdentifier | undefined;
  allowNewRecord?: boolean | undefined;
  collapsible?: boolean | undefined;
  gap?: number | undefined;
  headerStyles?: CSSProperties | string | undefined;
  columnStyle?: CSSProperties | string | undefined;
  groupingProperty?: string | undefined;
  modalFormId?: string | undefined;
  createFormId?: string | undefined;
  actionConfiguration?: IConfigurableActionConfiguration | undefined;
  kanbanReadonly?: boolean | undefined;
  componentName?: string | undefined;
  editFormId?: string | undefined;
  allowEdit?: boolean | undefined;
  allowDelete?: boolean | undefined;
  columnStyles?: IStyleType | undefined;
}
