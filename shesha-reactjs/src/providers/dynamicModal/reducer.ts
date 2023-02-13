import { DYNAMIC_MODAL_CONTEXT_INITIAL_STATE, IDynamicModalStateContext, IToggleModalPayload } from './contexts';
import { DynamicModalActionEnums, ICreateModalPayload } from './actions';
import { handleActions } from 'redux-actions';
import { IModalInstance, IModalProps } from './models';
import { nanoid } from 'nanoid/non-secure';

export default handleActions<IDynamicModalStateContext, any>(
  {
    [DynamicModalActionEnums.Toggle]: (
      state: IDynamicModalStateContext,
      action: ReduxActions.Action<IToggleModalPayload>
    ) => {
      const { payload } = action;

      const instance = state.instances[payload.id] as IModalInstance;
      if (!instance) {
        console.warn(`dynamic modal instance ${payload.id} not found`);
        return state;
      }

      const newInstance: IModalInstance = { ...instance, isVisible: payload.isVisible };

      /*
      const instances = [...state.instances];
      const instance = instances.find(inst => inst.id === payload.id);
      if (instance)
      {
        console.warn(`dynamic modal instance ${payload.id} not found`);
        return state;
      }
      */
      return {
        ...state,
        instances: { ...state.instances, [payload.id]: newInstance },
      };
    },

    [DynamicModalActionEnums.Open]: (state: IDynamicModalStateContext, action: ReduxActions.Action<IModalProps>) => {
      const { payload } = action;

      const instance: IModalInstance = {
        id: nanoid(),
        props: payload,
        isVisible: true,
      };

      return {
        ...state,
        instances: { ...state.instances, [instance.id]: instance },
      };
    },

    [DynamicModalActionEnums.CreateModal]: (
      state: IDynamicModalStateContext,
      action: ReduxActions.Action<ICreateModalPayload>
    ) => {
      const { payload } = action;

      const instance: IModalInstance = {
        id: payload.modalProps.id,
        props: payload.modalProps,
        isVisible: payload.modalProps.isVisible,
      };

      return {
        ...state,
        instances: { ...state.instances, [instance.id]: instance },
      };
    },

    [DynamicModalActionEnums.RemoveModal]: (state: IDynamicModalStateContext, action: ReduxActions.Action<string>) => {
      const { payload } = action;

      const newInstances = { ...state.instances };
      delete newInstances[payload];

      return {
        ...state,
        instances: { ...newInstances },
      };
    },
  },

  DYNAMIC_MODAL_CONTEXT_INITIAL_STATE
);
