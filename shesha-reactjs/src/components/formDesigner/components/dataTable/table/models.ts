import { IConfigurableFormComponent } from '../../../../../providers/form/models';
import { IConfigurableColumnsBase } from '../../../../../providers/datatableColumnsConfigurator/models';

export type RowDroppedMode = 'executeScript' | 'showDialog';

export interface ITableComponentBaseProps {
  items: IConfigurableColumnsBase[];
  useMultiselect?: boolean;
  allowRowDragAndDrop?: boolean;
  onRowDropped?: string;
  rowDroppedMode?: RowDroppedMode;

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
