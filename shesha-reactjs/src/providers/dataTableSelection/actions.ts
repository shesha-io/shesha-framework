import { Row } from 'react-table';
import { createAction } from 'redux-actions';
import { ISelectionProps } from './models';

export enum DataTableSelectionActionEnums {
  SetSelectedRow = 'SET_SELECTED_ROW',
  SetMultiSelectedRow = 'SET_MULTI_SELECTED_ROW',
  /* NEW_ACTION_TYPE_GOES_HERE */
}

export const setSelectedRowAction = createAction<ISelectionProps, ISelectionProps>(
  DataTableSelectionActionEnums.SetSelectedRow,
  p => p
);

export const setMultiSelectedRowAction = createAction<Array<Row> | Row, Array<Row> | Row>(
  DataTableSelectionActionEnums.SetMultiSelectedRow,
  p => p
);

/* NEW_ACTION_GOES_HERE */
