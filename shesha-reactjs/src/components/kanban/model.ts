import { IEntityReferenceDto } from '@/interfaces';
import { FormIdentifier, IConfigurableFormComponent } from '@/providers/form/models';
import { ButtonGroupItemProps, IButtonGroupItem, IButtonItem } from '@/providers';
import { ModalFooterButtons } from '@/providers/dynamicModal/models';

export type IncomeValueFunc = (value: any, args: any) => string;
export type OutcomeValueFunc = (value: any, args: any) => string | string[] | IEntityReferenceDto | IEntityReferenceDto[] | any;

export interface IAddNewRecordProps {
    modalFormId?: FormIdentifier;
    modalTitle?: string;
    showModalFooter?: boolean;
    footerButtons?: ModalFooterButtons;
    modalWidth?: number | string;
    buttons?: ButtonGroupItemProps[];
  }
  


export type RefListGroupItemProps = IRefListItemFormModel | IRefListItemGroup;

export interface IRefListGroupItemBase extends IButtonItem{
  referenceList?: any;
  item?: string;
}

export interface IRefListItemFormModel extends IRefListGroupItemBase {
}

export interface IRefListItemGroup extends IRefListGroupItemBase {
  childItems?: RefListGroupItemProps[];
}

export interface IKanbanProps extends IConfigurableFormComponent {
  items?: IKanbanButton[];
  referenceList?: any;
  fontColor?: string;
  showIcons?: boolean;
  width?: number;
  height?: number;
  minHeight?: number;
  maxHeight?: number;
  fontSize?: number;
  entityType?: { id: string; name: string };
  allowNewRecord?: boolean;
  readonly?: boolean;
  collapsible?: boolean;
  gap?: number;
  headerStyle?: any;
  columnStyle?: any;
  groupingProperty?: string;
  modalFormId?: string;
  createFormId?: string;
  headerBackgroundColor: string;
  actionConfiguration: any;
}

export interface IChevronControlProps extends IKanbanProps {
  value?: any;
}

export interface IKanbanButton extends IButtonGroupItem {
  itemValue: number;
  item: string;
}