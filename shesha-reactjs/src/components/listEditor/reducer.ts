import { handleActions, ReduxCompatibleReducer } from 'redux-actions';
import { ISwitchModeActionPayload, ListActionEnums } from './actions';
import { IListEditorStateContext } from './models';

const reducerFactory = <TItem extends any>(
  initialState: IListEditorStateContext<TItem>,
): ReduxCompatibleReducer<IListEditorStateContext<TItem>, any> =>
  handleActions<IListEditorStateContext<TItem>, any>(
    {
      [ListActionEnums.SwitchMode]: (
        state: IListEditorStateContext<TItem>,
        _action: ReduxActions.Action<ISwitchModeActionPayload>,
      ) => {
        return {
          ...state,
        };
      },

    },
    initialState,
  );

export default reducerFactory;
