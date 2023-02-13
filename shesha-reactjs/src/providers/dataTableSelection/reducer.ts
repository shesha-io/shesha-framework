import { Row } from 'react-table';
import { handleActions } from 'redux-actions';
import { DataTableSelectionActionEnums } from './actions';
import { DATATABLE_SELECTION_CONTEXT_INITIAL_STATE, IDataTableSelectionStateContext } from './contexts';
import { ISelectionProps } from './models';

export default handleActions<IDataTableSelectionStateContext, any>(
  {
    [DataTableSelectionActionEnums.SetSelectedRow]: (
      state: IDataTableSelectionStateContext,
      action: ReduxActions.Action<ISelectionProps>
    ) => {
      const { payload } = action;
      const selectedRow = state?.selectedRow?.id === payload?.id ? null : payload;

      return {
        ...state,
        selectedRow,
      };
    },

    [DataTableSelectionActionEnums.SetMultiSelectedRow]: (
      state: IDataTableSelectionStateContext,
      action: ReduxActions.Action<Row[] | Row>
    ) => {
      const { payload } = action;
      const { selectedRows: rows } = state;
      let selectedRows;

      if (Array.isArray(payload)) {
        selectedRows = payload?.filter(({ isSelected }) => isSelected).map(({ original }) => original);
      } else {
        const data = payload.original as any;
        const exists = rows.some(({ id }) => id === data?.id);
        const isSelected = payload.isSelected;

        if (exists && isSelected) {
          selectedRows = [...rows.filter(({ id }) => id !== data?.id), data];
        } else if (exists && !isSelected) {
          selectedRows = rows.filter(({ id }) => id !== data?.id);
        } else if (!exists && isSelected) {
          selectedRows = [...rows, data];
        }
      }

      return {
        ...state,
        selectedRows,
      };
    },
  },

  DATATABLE_SELECTION_CONTEXT_INITIAL_STATE
);
