import { nanoid } from '@/utils/uuid';
import { handleActions } from 'redux-actions';
import { DynamicModalActionEnums, ICreateModalPayload } from './actions';
import { DYNAMIC_MODAL_CONTEXT_INITIAL_STATE, IDynamicModalStateContext } from './contexts';
import { IModalInstance, IModalProps } from './models';

export default handleActions<IDynamicModalStateContext, any>(
  {
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
      action: ReduxActions.Action<ICreateModalPayload>,
    ) => {
      const { payload } = action;
      const { instances } = state;

      const instance: IModalInstance = {
        id: payload.modalProps.id,
        props: payload.modalProps,
        isVisible: payload.modalProps.isVisible,
        index: Object.keys(instances ?? {})?.length,
        onClose: payload.modalProps.onClose,
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

  DYNAMIC_MODAL_CONTEXT_INITIAL_STATE,
);
