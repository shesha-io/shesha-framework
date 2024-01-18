import { Modal } from 'antd';
import { nanoid } from '@/utils/uuid';
import React, { FC, PropsWithChildren, useContext, useReducer } from 'react';
import { DynamicModal } from '@/components/dynamicModal';
import { useConfigurableAction } from '@/providers/configurableActionsDispatcher';
import { SheshaActionOwners } from '../configurableActionsDispatcher/models';
import { evaluateKeyValuesToObject } from '../form/utils';
import { createModalAction, openAction, removeModalAction } from './actions';
import {
  IShowConfirmationArguments,
  showConfirmationArgumentsForm,
} from './configurable-actions/show-confirmation-arguments';
import { IShowModalActionArguments, dialogArgumentsForm } from './configurable-actions/show-dialog-arguments';
import {
  DYNAMIC_MODAL_CONTEXT_INITIAL_STATE,
  DynamicModalActionsContext,
  DynamicModalInstanceContext,
  DynamicModalStateContext,
} from './contexts';
import { IModalProps } from './models';
import DynamicModalReducer from './reducer';

export interface IDynamicModalProviderProps {}

const DynamicModalProvider: FC<PropsWithChildren<IDynamicModalProviderProps>> = ({ children }) => {
  const [state, dispatch] = useReducer(DynamicModalReducer, {
    ...DYNAMIC_MODAL_CONTEXT_INITIAL_STATE,
  });

  const actionDependencies = [state];
  useConfigurableAction<IShowConfirmationArguments>(
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

        const { formMode, ...restArguments } = actionArgs;

        const initialValues = evaluateKeyValuesToObject(actionArgs.additionalProperties, context ?? {});
        const parentFormValues = context?.data ?? {};

        const { modalWidth, customWidth, widthUnits } = actionArgs;

        return new Promise((resolve, _reject) => {
          // fix wrong migration
          const verb = !restArguments.submitHttpVerb || !Array.isArray(restArguments.submitHttpVerb)
            ? restArguments.submitHttpVerb
            : restArguments.submitHttpVerb[0];

          const modalProps: IModalProps = {
            ...restArguments,
            mode: formMode,
            id: modalId,
            title: actionArgs.modalTitle,
            width: modalWidth === 'custom' && customWidth ? `${customWidth}${widthUnits}` : modalWidth,
            initialValues: initialValues,
            parentFormValues: parentFormValues,
            isVisible: true,
            submitHttpVerb: verb,
            onSubmitted: (values) => {
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

  //#region Close the latest Dialog
  useConfigurableAction<IShowModalActionArguments>(
    {
      name: 'Close Dialog',
      owner: 'Common',
      ownerUid: SheshaActionOwners.Common,
      hasArguments: false,
      executer: () => {
        return new Promise((resolve, reject) => {
          const latestInstance = getLatestVisibleInstance();

          if (latestInstance) {
            removeModal(latestInstance?.id);
            resolve({});
          } else {
            reject('There is no open dialog to close');
          }
        });
      },
      // argumentsFormMarkup: {},
    },
    actionDependencies
  );
  //#endregion

  const getLatestVisibleInstance = () => {
    const { instances = {} } = state;
    const keys = Object.keys(instances);
    let highestIndexKey = null;

    for (let i = 0; i < keys.length; i++) {
      if (
        instances[keys[i]]?.isVisible &&
        (highestIndexKey === null || instances[keys[i]]?.index > instances[highestIndexKey]?.index)
      ) {
        highestIndexKey = keys[i];
      }
    }

    return highestIndexKey ? instances[highestIndexKey] : null;
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
              // show: () => show(instance.id),
              // hide: () => hide(instance.id),
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
          open,
          createModal,
          removeModal,
          modalExists,
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
    },
    close: () => {
      context.removeModal(modalProps.id);
    },
  };

  return instance;
}

function useClosestModal() {
  const context = useContext(DynamicModalInstanceContext);
  return context;
}

export { DynamicModalProvider, useClosestModal, useDynamicModals, useModal };
