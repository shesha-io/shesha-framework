import { IConfigurableFormComponent } from 'providers/form/models';
import { IConfigurableActionConfiguration } from 'interfaces/configurableAction';
import { IConfigurableColumnsProps } from 'providers/datatableColumnsConfigurator/models';
import { IShaDataTableInlineEditableProps } from 'components/dataTable/interfaces';

export type RowDroppedMode = 'executeScript' | 'showDialog';

export interface ITableComponentBaseProps extends IShaDataTableInlineEditableProps {
  items: IConfigurableColumnsProps[];
  
  useMultiselect?: boolean;
  allowRowDragAndDrop?: boolean;
  onRowDropped?: string;
  rowDroppedMode?: RowDroppedMode;
  rowDroppedActionConfiguration?: IConfigurableActionConfiguration;

  //#region Dialog recheck!
  dialogTitle?: string;
  dialogForm?: string;
  dialogFormSkipFetchData?: boolean;
  dialogShowModalButtons?: boolean;
  dialogOnSuccessScript?: string;
  dialogOnErrorScript?: string;
  containerStyle?: string;
  tableStyle?: string;
  dialogSubmitHttpVerb?: 'POST' | 'PUT';
  //#endregion
}

/** Table component props */
export interface ITableComponentProps extends ITableComponentBaseProps, IConfigurableFormComponent {}
