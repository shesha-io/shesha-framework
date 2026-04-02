import { nanoid } from '@/utils/uuid';
import { createModalAction, openAction, removeModalAction } from './actions';
import { DYNAMIC_MODAL_CONTEXT_INITIAL_STATE } from './contexts';
import { IModalInstance } from './models';
import { getLatestInstance } from './utils';
import { createReducer } from '@reduxjs/toolkit';
import { unwrapDraft } from '@/utils/object';

export const reducer = createReducer(DYNAMIC_MODAL_CONTEXT_INITIAL_STATE, (builder) => {
  builder
    .addCase(openAction, (state, { payload }) => {
      const instances = unwrapDraft(state.instances);
      const latest = getLatestInstance(instances, () => true);
      const instance: IModalInstance = {
        id: nanoid(),
        props: payload,
        isVisible: true,
        index: latest ? latest.index + 1 : 0,
      };

      return {
        ...state,
        instances: { ...instances, [instance.id]: instance },
      };
    })
    .addCase(createModalAction, (state, { payload }) => {
      const instances = unwrapDraft(state.instances);

      const latest = getLatestInstance(instances, () => true);
      const instance: IModalInstance = {
        id: payload.modalProps.id,
        props: payload.modalProps,
        isVisible: payload.modalProps.isVisible,
        index: latest ? latest.index + 1 : 0,
        onClose: payload.modalProps.onClose,
      };

      return {
        ...state,
        instances: { ...state.instances, [instance.id]: instance },
      };
    })
    .addCase(removeModalAction, (state, { payload }) => {
      const instances = unwrapDraft(state.instances);
      const newInstances = { ...instances };
      delete newInstances[payload];

      return {
        ...state,
        instances: { ...newInstances },
      };
    })
  ;
});
