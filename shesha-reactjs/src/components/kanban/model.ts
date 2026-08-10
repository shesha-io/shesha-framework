import { IConfigurableFormComponent } from '@/providers/form/models';
import { IButtonGroupItem, IConfigurableActionConfiguration, IStyleValue } from '@/providers';
import { CSSProperties } from 'react';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';
import { IReferenceListIdentifier } from '@/interfaces';
import { RefListGroupItemProps } from '@/components/refListSelectorDisplay/provider/models';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';

export interface IKanbanButton extends IButtonGroupItem {
  itemValue: number;
  item: string;
}

export const isKanbanColumn = (item: RefListGroupItemProps): item is RefListGroupItemProps & IKanbanButton =>
  isDefined(item.itemValue) && !isNullOrWhiteSpace(item.item);

/** A reference list cell is returned either as a raw value or as an object carrying `itemValue`. */
export const isRefListCellValue = (value: unknown): value is { itemValue: number } =>
  typeof value === 'object' && value !== null && 'itemValue' in value &&
  typeof (value as { itemValue: unknown }).itemValue === 'number';
export interface IKanbanProps extends IConfigurableFormComponent, IStyleValue {
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
  columnStyles?: IStyleValue | undefined;
}
