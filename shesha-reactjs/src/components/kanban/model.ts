import { ButtonProps } from 'antd';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { CSSProperties, ReactNode } from 'react';
import { IAnyObject, IEntityReferenceDto } from '@/interfaces';
import { IConfigurableColumnsProps } from '@/providers/datatableColumnsConfigurator/models';
import { FormIdentifier } from '@/providers/form/models';
import { ButtonGroupItemProps } from '@/providers';
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
  
export interface IKanbanComponentProps {
    entityType?: string;
    groupingProperty?: string;
    modalFormId?: string; 
    columnStyle?: CSSProperties;
    gap?: string | number;
    readonly?: boolean;
    height?: string | number;
    minHeight?: string | number;
    maxHeight?: string | number;
    fontSize?: string | number;
    backgroundColor?: string;
    color?: string;
    headerStyle?: any;
    formId?: FormIdentifier;
    onChange?: (value: string | string[] | IEntityReferenceDto | IEntityReferenceDto[], data: IAnyObject) => void;
    onSelect?: (data: IAnyObject) => void;
    value?: string | string[] | IEntityReferenceDto | IEntityReferenceDto[] | any;
    displayEntityKey?: string;
    width?: number | string;
    disabled?: boolean;
    loading?: boolean;
    name?: string;
    mode?: 'single' | 'multiple' | 'tags';
    size?: SizeType;
    title?: string;
    useButtonPicker?: boolean;
    pickerButtonProps?: ButtonProps;
    defaultValue?: string;
    entityFooter?: ReactNode;
    configurableColumns?: IConfigurableColumnsProps[]; // Type it later
    addNewRecordsProps?: IAddNewRecordProps;
    style?: CSSProperties;
    readOnly?: boolean;
    placeholder: string;
    incomeValueFunc: IncomeValueFunc;
    outcomeValueFunc: OutcomeValueFunc;
    filters: any;
}


