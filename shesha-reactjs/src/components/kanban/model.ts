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
  
// export interface IKanbanComponentProps {
//     entityType?: string;
//     groupingProperty?: string;
//     modalFormId?: string; 
//     columnStyle?: CSSProperties;
//     gap?: string | number;
//     readonly?: boolean;
//     height?: string | number;
//     minHeight?: string | number;
//     maxHeight?: string | number;
//     fontSize?: string | number;
//     backgroundColor?: string;
//     color?: string;
//     headerStyle?: any;
//     formId?: FormIdentifier;
//     onChange?: (value: string | string[] | IEntityReferenceDto | IEntityReferenceDto[], data: IAnyObject) => void;
//     onSelect?: (data: IAnyObject) => void;
//     value?: string | string[] | IEntityReferenceDto | IEntityReferenceDto[] | any;
//     displayEntityKey?: string;
//     width?: number | string;
//     disabled?: boolean;
//     loading?: boolean;
//     name?: string;
//     mode?: 'single' | 'multiple' | 'tags';
//     size?: SizeType;
//     title?: string;
//     useButtonPicker?: boolean;
//     pickerButtonProps?: ButtonProps;
//     defaultValue?: string;
//     entityFooter?: ReactNode;
//     configurableColumns?: IConfigurableColumnsProps[]; // Type it later
//     addNewRecordsProps?: IAddNewRecordProps;
//     style?: CSSProperties;
//     readOnly?: boolean;
//     placeholder: string;
//     incomeValueFunc: IncomeValueFunc;
//     outcomeValueFunc: OutcomeValueFunc;
//     filters: any;
// }

//////

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
}

export interface IChevronControlProps extends IKanbanProps {
  value?: any;
}

export interface IKanbanButton extends IButtonGroupItem {
  itemValue: number;
  item: string;
}