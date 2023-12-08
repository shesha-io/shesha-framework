import { IDataListBaseProps, InlineEditMode } from "@/components/dataList/models";
import { IConfigurableActionConfiguration, IConfigurableFormComponent, YesNoInherit } from "@/index";
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
  //newRowCapturePosition?: NewRowCapturePosition;
  //newRowInsertPosition?: NewRowCapturePosition;
  customCreateUrl?: string;
  onListItemSave?: string;
  onListItemSaveSuccessAction?: IConfigurableActionConfiguration;
}