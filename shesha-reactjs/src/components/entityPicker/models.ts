import { ButtonProps } from 'antd';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { CSSProperties, ReactNode } from 'react';
import { IAnyObject, IEntityReferenceDto } from '../../interfaces';
import { IConfigurableColumnsBase } from '../../providers/datatableColumnsConfigurator/models';
import { FormIdentifier } from '../../providers/form/models';
import { ITableViewProps } from '../../providers/tableViewSelectorConfigurator/models';

interface IWrappedEntityPickerProps {
  entityType?: string;
  filters?: ITableViewProps[];
  allowNewRecord?: boolean;
  parentEntityId?: string;
  onDblClick?: (data: any) => void;
}

export interface ISelectedProps {
  id?: string;
  displayName?: string;
}

interface IAddNewRecordProps {
  modalFormId?: FormIdentifier;
  modalTitle?: string;
  showModalFooter?: boolean;
  submitHttpVerb?: 'POST' | 'PUT';
  onSuccessRedirectUrl?: string;
  modalWidth?: number | string;
}

export interface IEntityPickerState {
  showModal?: boolean;
  selectedRowIndex?: number;
  // selectedValue?: string;
  selectedRow?: IAnyObject;
  globalStateKey?: string;
}

export interface IEntityPickerProps extends Omit<IWrappedEntityPickerProps, 'onDblClick'> {
  formId?: FormIdentifier;

  onChange?: (value: string | string[] | IEntityReferenceDto | IEntityReferenceDto[], data: IAnyObject) => void;
  onSelect?: (data: IAnyObject) => void;
  value?: string | string[] | IEntityReferenceDto | IEntityReferenceDto[];
  displayEntityKey?: string;
  width?: number | string;
  disabled?: boolean;
  loading?: boolean;
  name?: string;
  useRawValues?: boolean;
  mode?: 'single' | 'multiple' | 'tags';
  size?: SizeType;
  title?: string;
  useButtonPicker?: boolean;
  pickerButtonProps?: ButtonProps;
  defaultValue?: string;
  entityFooter?: ReactNode;
  configurableColumns?: IConfigurableColumnsBase[]; // Type it later
  addNewRecordsProps?: IAddNewRecordProps;
  style?: CSSProperties;
  readOnly?: boolean;
}
