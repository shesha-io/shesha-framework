import {
  FORM_PERSISTER_CONTEXT_INITIAL_STATE,
  IFormPersisterStateContext,
  ILoadRequestPayload,
} from './contexts';
import { FormPersisterActionEnums } from './actions';
import { handleActions } from 'redux-actions';
import { IFormSettings } from '../form/models';
import { IPersistedFormProps } from './models';
import { IErrorInfo } from '../../interfaces/errorInfo';

const reducer = handleActions<IFormPersisterStateContext, any>(
  {
    [FormPersisterActionEnums.LoadRequest]: (state: IFormPersisterStateContext, action: ReduxActions.Action<ILoadRequestPayload>) => {
      const { payload } = action;

      return {
        ...state,
        formId: payload.formId,
        loading: true,
        loadError: null,
      };
    },

    [FormPersisterActionEnums.LoadSuccess]: (state: IFormPersisterStateContext, action: ReduxActions.Action<IPersistedFormProps>) => {
      const { payload } = action;

      return {
        ...state,
        formProps: {
          id: payload.id,
          module: payload.module,
          name: payload.name,
          label: payload.label,
          description: payload.description,
          versionNo: payload.versionNo,
          versionStatus: payload.versionStatus,
          isLastVersion: payload.isLastVersion,
        },
        markup: payload.markup,
        formSettings: payload.formSettings,
        loaded: true,
        loading: false,
        loadError: null,
      };
    },

    [FormPersisterActionEnums.LoadError]: (state: IFormPersisterStateContext, action: ReduxActions.Action<IErrorInfo>) => {
      const { payload } = action;

      return {
        ...state,
        loading: false,
        loaded: false,
        loadError: payload,
      };
    },

    [FormPersisterActionEnums.UpdateFormSettings]: (state: IFormPersisterStateContext, action: ReduxActions.Action<IFormSettings>) => {
      const { payload } = action;

      return {
        ...state,
        formSettings: payload,
      };
    },

    [FormPersisterActionEnums.SaveRequest]: (state: IFormPersisterStateContext, _action: ReduxActions.Action<void>) => {
      return {
        ...state,
        saving: true,
        saved: false,
        saveError: null,
      };
    },
    [FormPersisterActionEnums.SaveSuccess]: (state: IFormPersisterStateContext, _action: ReduxActions.Action<void>) => {
      return {
        ...state,
        saving: false,
        saved: true,
        saveError: null,
      };
    },
    [FormPersisterActionEnums.SaveError]: (state: IFormPersisterStateContext, action: ReduxActions.Action<IErrorInfo>) => {
      const { payload } = action;

      return {
        ...state,
        saving: false,
        saveError: payload,
      };
    },
  },

  FORM_PERSISTER_CONTEXT_INITIAL_STATE
);

export default reducer;
