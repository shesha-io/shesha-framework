import { IDataListBaseProps, InlineEditMode } from "@/components/dataList/models";
import { IConfigurableActionConfiguration } from "@/interfaces/configurableAction";
import { IConfigurableFormComponent, ITableColumn, UnwrapCodeEvaluators, YesNoInherit } from "@/interfaces";
import { DataTableFullInstance } from "@/providers/dataTable/contexts";
import { DeepDiff } from "@/interfaces/utilityTypes";

export interface IDataListComponentProps extends IDataListBaseProps, IDataListInlineEditableProps, IConfigurableFormComponent {
}

export interface IDataListWithDataSourceProps extends IDataListComponentProps {
  dataSourceInstance: DataTableFullInstance;
}

export type TestDiff = DeepDiff<DataTableFullInstance, UnwrapCodeEvaluators<DataTableFullInstance>>;
export type TestDiff2 = DeepDiff<DataTableFullInstance["columns"], UnwrapCodeEvaluators<DataTableFullInstance["columns"]>>;
export type TestDiff3 = DeepDiff<ITableColumn, UnwrapCodeEvaluators<ITableColumn>>;
export type BC = ITableColumn["backgroundColor"];


export interface IDataListInlineEditableProps {
  canDeleteInline?: YesNoInherit | undefined;
  customDeleteUrl?: string | undefined;
  canEditInline?: YesNoInherit | undefined;
  inlineEditMode?: InlineEditMode | undefined;
  customUpdateUrl?: string | undefined;
  canAddInline?: YesNoInherit | undefined;
  customCreateUrl?: string | undefined;
  onListItemSave?: string | undefined;
  onListItemSaveSuccessAction?: IConfigurableActionConfiguration | undefined;
  onRowDeleteSuccessAction?: IConfigurableActionConfiguration | undefined;
  modalWidth?: string | undefined;
  widthUnits?: string | undefined;
  customWidth?: number | undefined;
  showEditIcons?: boolean | undefined;
  noDataText?: string | undefined;
  noDataSecondaryText?: string | undefined;
  noDataIcon?: string | undefined;

  cardMinWidth?: string | undefined;
  cardMaxWidth?: string | undefined;
  cardHeight?: string | undefined;
  cardSpacing?: string | undefined;
  showBorder?: boolean | undefined;

  onListItemClick?: IConfigurableActionConfiguration | undefined;
  onListItemHover?: IConfigurableActionConfiguration | undefined;
  onListItemSelect?: IConfigurableActionConfiguration | undefined;
  onSelectionChange?: IConfigurableActionConfiguration | undefined;
}
