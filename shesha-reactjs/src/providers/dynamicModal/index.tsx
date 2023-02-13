import React, { FC, useReducer, useContext, PropsWithChildren } from 'react';
import DynamicModalReducer from './reducer';
import {
  DynamicModalActionsContext,
  DynamicModalInstanceContext,
  DynamicModalStateContext,
  DYNAMIC_MODAL_CONTEXT_INITIAL_STATE,
} from './contexts';
import {
  openAction,
  toggleAction,
  createModalAction,
  removeModalAction,
  /* NEW_ACTION_IMPORT_GOES_HERE */
} from './actions';
import { IModalProps } from './models';
import { DynamicModal } from '../../components/dynamicModal';
import { useConfigurableAction } from '../configurableActionsDispatcher';
import { dialogArgumentsForm, IShowModalActionArguments } from './configurable-actions/show-dialog-arguments';
import {
  IShowConfigrmationArguments,
  showConfirmationArgumentsForm,
} from './configurable-actions/show-confirmation-arguments';
import { nanoid } from 'nanoid/non-secure';
import { evaluateKeyValuesToObject } from '../form/utils';
import { Modal } from 'antd';
import { SheshaActionOwners } from '../configurableActionsDispatcher/models';

export interface IDynamicModalProviderProps { }

const DynamicModalProvider: FC<PropsWithChildren<IDynamicModalProviderProps>> = ({ children }) => {
  const [state, dispatch] = useReducer(DynamicModalReducer, {
    ...DYNAMIC_MODAL_CONTEXT_INITIAL_STATE,
  });

  const actionDependencies = [state];
  useConfigurableAction<IShowConfigrmationArguments>(
    {
      name: 'Show Confirmation Dialog',
      owner: 'Common',
      ownerUid: SheshaActionOwners.Common,
      hasArguments: true,
      executer: (actionArgs, _context) => {
        return new Promise((resolve, _reject) => {
          Modal.confirm({
            title: actionArgs.title,
            content: actionArgs.content,
            okText: actionArgs.okText ?? 'Yes',
            cancelText: actionArgs.cancelText ?? 'No',
            okButtonProps: {
              type: 'primary',
              danger: true,
            },
            onOk: () => {
              resolve(true);
            },
          });
        });
      },
      argumentsFormMarkup: showConfirmationArgumentsForm,
    },
    actionDependencies
  );

  useConfigurableAction<IShowModalActionArguments>(
    {
      name: 'Show Dialog',
      owner: 'Common',
      ownerUid: SheshaActionOwners.Common,
      hasArguments: true,
      executer: (actionArgs, context) => {
        const modalId = nanoid();

        const initialValues = evaluateKeyValuesToObject(actionArgs.additionalProperties, context ?? {});
        const parentFormValues = context?.data ?? {};

        const { modalWidth, customWidth, widthUnits } = actionArgs;

        //console.log('modal initial values', initialValues);

        return new Promise((resolve, _reject) => {
          const modalProps: IModalProps = {
            ...actionArgs,
            id: modalId,
            title: actionArgs.modalTitle,
            width: modalWidth === 'custom' && customWidth ? `${customWidth}${widthUnits}` : modalWidth,
            initialValues: initialValues,
            parentFormValues: parentFormValues,
            isVisible: true,
            onSubmitted: values => {
              removeModal(modalId);

              console.log('dialog success:', { values });
              resolve(values); // todo: return result e.g. we may need to handle created entity id and navigate to edit/details page
            },
          };

          createModal({ ...modalProps, isVisible: true });
        });
      },
      argumentsFormMarkup: dialogArgumentsForm,
    },
    actionDependencies
  );

  /* NEW_ACTION_DECLARATION_GOES_HERE */

  const toggle = (id: string, isVisible: boolean) => {
    dispatch(toggleAction({ id, isVisible }));
  };
  const show = (id: string) => {
    toggle(id, true);
  };
  const hide = (id: string) => {
    toggle(id, false);
  };

  const open = (modalProps: IModalProps) => {
    dispatch(openAction(modalProps));
  };

  const createModal = (modalProps: IModalProps) => {
    dispatch(createModalAction({ modalProps }));
  };

  const removeModal = (id: string) => {
    dispatch(removeModalAction(id));
  };

  const modalExists = (id: string) => {
    return Boolean(state.instances[id]);
  };

  const renderInstances = () => {
    const rendered = [];
    for (const id in state.instances) {
      if (state.instances.hasOwnProperty(id)) {
        const instance = state.instances[id];

        const instanceProps = instance.props;
        rendered.push(
          <DynamicModalInstanceContext.Provider
            key={instance.id}
            value={{
              instance,
              show: () => show(instance.id),
              hide: () => hide(instance.id),
              close: () => removeModal(instance.id),
            }}
          >
            <DynamicModal {...instanceProps} key={instance.id} id={instance.id} isVisible={instance.isVisible} />
          </DynamicModalInstanceContext.Provider>
        );
      }
    }
    return rendered;
  };

  return (
    <DynamicModalStateContext.Provider value={state}>
      <DynamicModalActionsContext.Provider
        value={{
          toggle,
          show,
          hide,
          open,
          createModal,
          removeModal,
          modalExists,
          /* NEW_ACTION_GOES_HERE */
        }}
      >
        {renderInstances()}
        {children}
      </DynamicModalActionsContext.Provider>
    </DynamicModalStateContext.Provider>
  );
};

function useDynamicModalState() {
  const context = useContext(DynamicModalStateContext);

  if (context === undefined) {
    throw new Error('useDynamicModalState must be used within a DynamicModalProvider');
  }

  return context;
}

function useDynamicModalActions() {
  const context = useContext(DynamicModalActionsContext);

  if (context === undefined) {
    throw new Error('useDynamicModalActions must be used within a DynamicModalProvider');
  }

  return context;
}

function useDynamicModals() {
  return { ...useDynamicModalState(), ...useDynamicModalActions() };
}

function useModal(modalProps: IModalProps) {
  const context = useDynamicModals();

  if (!modalProps) return null;

  const instance = {
    open: () => {
      if (!context.modalExists(modalProps.id)) context.createModal({ ...modalProps, isVisible: true });
      else context.show(modalProps.id);
    },
    close: () => {
      context.removeModal(modalProps.id);
    },
    show: () => context.show(modalProps.id),
    hide: () => context.hide(modalProps.id),
  };

  return instance;
}

function useClosestModal() {
  const context = useContext(DynamicModalInstanceContext);
  return context;
}

export { DynamicModalProvider, useDynamicModals, useModal, useClosestModal };
