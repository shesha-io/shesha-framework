import { ButtonProps } from 'antd';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { CSSProperties, ReactNode } from 'react';
import { IAnyObject, IEntityReferenceDto } from '@/interfaces';
import { IConfigurableColumnsProps } from '@/providers/datatableColumnsConfigurator/models';
import { FormIdentifier } from '@/providers/form/models';
import { ModalFooterButtons } from '@/providers/dynamicModal/models';
import { BorderStyle } from '@/designer-components/_settings/utils/border/interfaces';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';
import { ButtonGroupItemProps } from '@/providers/buttonGroupConfigurator/models';
import { ITableRowData, IStoredFilter } from '@/providers/dataTable/interfaces';

interface IWrappedEntityPickerProps {
  entityType?: string | IEntityTypeIdentifier;
  filters?: IStoredFilter[] | undefined;
  allowNewRecord?: boolean;
}

export interface ISelectedProps {
  id?: string;
  displayName?: string;
}

export interface IAddNewRecordProps {
  modalFormId?: FormIdentifier | undefined;
  modalTitle?: string | undefined;
  showModalFooter?: boolean | undefined;
  footerButtons?: ModalFooterButtons | undefined;
  modalWidth?: number | string | undefined;
  buttons?: ButtonGroupItemProps[] | undefined;
}

export type IncomeValueFunc = (value: string | IEntityReferenceDto | undefined, args: object) => string | null | undefined;
export type OutcomeValueFunc = (value: object | null | undefined, args: object) => string | IEntityReferenceDto | undefined;

export interface IEntityPickerState {
  showModal: boolean;
  selectedRowIndex?: number;
  selectedRow?: ITableRowData;
  globalStateKey?: string;
}

export interface IEntityPickerProps extends Omit<IWrappedEntityPickerProps, 'onDblClick'> {
  formId?: FormIdentifier | undefined;
  hideBorder?: boolean | undefined;
  onChange?: ((value: string | string[] | IEntityReferenceDto | IEntityReferenceDto[] | null, data: IAnyObject | null) => void) | undefined;
  onSelect?: ((data: ITableRowData) => void) | undefined;
  value?: string | string[] | IEntityReferenceDto | IEntityReferenceDto[] | undefined;
  displayEntityKey: string;
  width?: number | string | undefined;
  disabled?: boolean | undefined;
  loading?: boolean | undefined;
  name?: string | undefined;
  mode?: 'single' | 'multiple' | 'tags' | undefined;
  size?: SizeType | undefined;
  title?: string | undefined;
  useButtonPicker?: boolean | undefined;
  pickerButtonProps?: ButtonProps | undefined;
  entityFooter?: ReactNode;
  configurableColumns?: IConfigurableColumnsProps[] | undefined;
  addNewRecordsProps?: IAddNewRecordProps | undefined;
  style?: CSSProperties | undefined;
  readOnly?: boolean | undefined;
  placeholder?: string | undefined;
  incomeValueFunc: IncomeValueFunc;
  outcomeValueFunc: OutcomeValueFunc;
  dividerStyle?: BorderStyle | undefined;
}
