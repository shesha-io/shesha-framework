import { IDataListBaseProps, InlineEditMode } from "@/components/dataList/models";
import { IConfigurableActionConfiguration } from "@/interfaces/configurableAction";
import { IConfigurableFormComponent, YesNoInherit } from "@/interfaces";
import { DataTableFullInstance } from "@/providers/dataTable/contexts";

export interface IDataListComponentProps extends IDataListBaseProps, IDataListInlineEditableProps, IConfigurableFormComponent {
}

export interface IDataListWithDataSourceProps extends IDataListComponentProps {
  dataSourceInstance: DataTableFullInstance;
}
  
export interface IDataListInlineEditableProps {
  canDeleteInline?: YesNoInherit;
  customDeleteUrl?: string;
  canEditInline?: YesNoInherit;
  inlineEditMode?: InlineEditMode;
  customUpdateUrl?: string;
  canAddInline?: YesNoInherit;
  customCreateUrl?: string;
  onListItemSave?: string;
  onListItemSaveSuccessAction?: IConfigurableActionConfiguration;
  onRowDeleteSuccessAction?: IConfigurableActionConfiguration;
  modalWidth?: string;
  widthUnits?: string;
  customWidth?: number;

  noDataText?: string;
  noDataSecondaryText?: string;
  noDataIcon?: string;

  cardMinWidth?: string;
  cardMaxWidth?: string;
  cardHeight?: string;
  cardSpacing?: string;
  showBorder?: boolean;
}