import React, { FC, PropsWithChildren, useContext, useReducer } from 'react';
import { Row } from 'react-table';
import { setMultiSelectedRowAction, setSelectedRowAction } from './actions';
import {
  DATATABLE_SELECTION_CONTEXT_INITIAL_STATE,
  DataTableSelectionActionsContext,
  DataTableSelectionStateContext,
} from './contexts';
import DataTableSelectionReducer from './reducer';

export interface IDataTableSelectionProviderProps {}

const DataTableSelectionProvider: FC<PropsWithChildren<IDataTableSelectionProviderProps>> = ({ children }) => {
  const [state, dispatch] = useReducer(DataTableSelectionReducer, {
    ...DATATABLE_SELECTION_CONTEXT_INITIAL_STATE,
  });

  const setSelectedRow = (index: number, row: any) => {
    const selectedId = state.selectedRow?.id;
    const currentId = row?.id;

    dispatch(setSelectedRowAction(selectedId !== currentId ? { index, row, id: row?.id } : null));
  };

  const setMultiSelectedRow = (rows: Row[] | Row) => {
    dispatch(setMultiSelectedRowAction(rows));
  };

  /* NEW_ACTION_DECLARATION_GOES_HERE */

  return (
    <DataTableSelectionStateContext.Provider value={state}>
      <DataTableSelectionActionsContext.Provider
        value={{
          setSelectedRow,
          setMultiSelectedRow,
          /* NEW_ACTION_GOES_HERE */
        }}
      >
        {children}
      </DataTableSelectionActionsContext.Provider>
    </DataTableSelectionStateContext.Provider>
  );
};

function useDataTableSelectionState(require: boolean = true) {
  const context = useContext(DataTableSelectionStateContext);

  if (require && context === undefined) {
    throw new Error('useDataTableSelection must be used within a DataTableSelectionProvider');
  }

  return context;
}

function useDataTableSelectionActions(require: boolean = true) {
  const context = useContext(DataTableSelectionActionsContext);

  if (require && context === undefined) {
    throw new Error('useDataTableSelectionActions must be used within a DataTableSelectionProvider');
  }

  return context;
}

function useDataTableSelection(require: boolean = true) {
  const actionsContext = useDataTableSelectionActions(require);
  const stateContext = useDataTableSelectionState(require);

  // useContext() returns initial state when provider is missing
  // initial context state is useless especially when require == true
  // so we must return value only when both context are available
  return actionsContext !== undefined && stateContext !== undefined
    ? { ...actionsContext, ...stateContext }
    : undefined;
}

export { DataTableSelectionProvider, useDataTableSelection, useDataTableSelectionActions, useDataTableSelectionState };
