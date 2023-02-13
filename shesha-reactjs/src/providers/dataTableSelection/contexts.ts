import { createContext } from 'react';
import { Row } from 'react-table';
import { ISelectionProps } from './models';

export interface IDataTableSelectionStateContext {
  selectedRow?: ISelectionProps;
  selectedRows?: { [key in string]: string }[];
}

export interface IDataTableSelectionActionsContext {
  setSelectedRow: (index: number, row: any) => void;
  setMultiSelectedRow: (rows: Row[] | Row) => void;

  /* NEW_ACTION_ACTION_DECLARATION_GOES_HERE */
}

export const DATATABLE_SELECTION_CONTEXT_INITIAL_STATE: IDataTableSelectionStateContext = {
  selectedRow: null,
  selectedRows: [],
};

export const DataTableSelectionStateContext = createContext<IDataTableSelectionStateContext>(
  DATATABLE_SELECTION_CONTEXT_INITIAL_STATE
);

export const DataTableSelectionActionsContext = createContext<IDataTableSelectionActionsContext>(undefined);
