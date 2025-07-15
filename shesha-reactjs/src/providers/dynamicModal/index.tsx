import { App } from 'antd';
import React, { FC, PropsWithChildren, useContext, useReducer } from 'react';
import { useConfigurableAction, useConfigurableActionDispatcherProxy } from '@/providers/configurableActionsDispatcher';
import { SheshaActionOwners } from '../configurableActionsDispatcher/models';
import { EvaluationContext, executeScript, recursiveEvaluator } from '../form/utils';
import { createModalAction, openAction, removeModalAction } from './actions';
import {
  IShowConfirmationArguments,
  showConfirmationArgumentsForm,
} from './configurable-actions/show-confirmation-arguments';
import { ICloseModalActionArguments, IShowModalActionArguments, closeDialogArgumentsForm, showDialogArgumentsForm } from './configurable-actions/show-dialog-arguments';
import {
  DYNAMIC_MODAL_CONTEXT_INITIAL_STATE,
  DynamicModalActionsContext,
  DynamicModalInstanceContext,
  DynamicModalStateContext,
} from './contexts';
import { IModalInstance, IModalProps } from './models';
import DynamicModalReducer from './reducer';
import { nanoid } from '@/utils/uuid';
import { migrateToV0 } from './migrations/ver0';
import { DynamicModalRenderer } from './renderer';

export interface IDynamicModalProviderProps { }

const DynamicModalProvider: FC<PropsWithChildren<IDynamicModalProviderProps>> = ({ children }) => {
  const [state, dispatch] = useReducer(DynamicModalReducer, {
    ...DYNAMIC_MODAL_CONTEXT_INITIAL_STATE,
  });
  const actionDependencies = [state];
  const { modal } = App.useApp();

  useConfigurableAction<IShowConfirmationArguments>(
    {
      name: 'Show Confirmation Dialog',
      owner: 'Common',
      ownerUid: SheshaActionOwners.Common,
      hasArguments: true,
      executer: (actionArgs, _context) => {
        return new Promise((resolve, reject) => {
          modal.confirm({
            title: actionArgs.title,
            content: actionArgs.content,
            okText: actionArgs.okText ?? 'Yes',
            cancelText: actionArgs.cancelText ?? 'No',
            okButtonProps: {
              type: 'primary',
              danger: true,
            },
            onCancel: () => {
              reject();
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

  const removeModal = (id: string) => {
    dispatch(removeModalAction(id));
  };

  const createModal = (modalProps: IModalProps) => {
    dispatch(createModalAction({ modalProps: { ...modalProps, width: modalProps.width ?? '60%' } }));
  };

  useConfigurableAction<IShowModalActionArguments>(
    {
      name: 'Show Dialog',
      owner: 'Common',
      ownerUid: SheshaActionOwners.Common,
      hasArguments: true,
      executer: (actionArgs, context) => {

        const modalId = nanoid();

        const { formMode, ...restArguments } = actionArgs;

        const argumentsExpression = actionArgs.formArguments?.trim();
        const argumentsPromise = argumentsExpression
          ? executeScript(argumentsExpression, context)
          : Promise.resolve(undefined);

        return argumentsPromise.then(dialogArguments => {
          const parentFormValues = context?.data ?? {};

          const { modalWidth, customWidth, widthUnits, showCloseIcon = true } = actionArgs;

          return new Promise((resolve, reject) => {
            const modalProps: IModalProps = {
              ...restArguments,
              mode: formMode,
              id: modalId,
              title: actionArgs.modalTitle,
              showCloseIcon: showCloseIcon,
              width: modalWidth === 'custom' && customWidth ? `${customWidth}${widthUnits}` : modalWidth,
              formArguments: dialogArguments,
              parentFormValues: parentFormValues,
              isVisible: true,
              onCancel: () => {
                reject("Cancelled");
              },
              onSubmitted: (values) => {
                removeModal(modalId);
                resolve(values); // TODO: return result e.g. we may need to handle created entity id and navigate to edit/details page
              },
              onClose: (positive = false, result) => {
                if (positive)
                  resolve(result);
                else
                  reject(result);
              },
              wrapper: context.configurableActionsDispatcherProxy,
            };

            createModal({ ...modalProps });
          });
        });
      },
      argumentsFormMarkup: showDialogArgumentsForm,
      evaluateArguments: (argumentsConfiguration, evaluationData) => {
        const evaluationContext: EvaluationContext = {
          contextData: evaluationData,
          path: '',
          evaluationFilter: (context, _data) => context.path !== 'buttons'
        };
        return recursiveEvaluator(argumentsConfiguration, evaluationContext);
      },
      useDynamicContextHook: () => {
        const configurableActionsDispatcherProxy = useConfigurableActionDispatcherProxy(false);
        return { configurableActionsDispatcherProxy };
      },
      migrator: (m) => m.add<IShowModalActionArguments>(0, migrateToV0),
    },
    actionDependencies
  );

  const getLatestVisibleInstance = () => {
    const { instances = {} } = state;
    const keys = Object.keys(instances);
    let highestInstance: IModalInstance = null;

    for (let i = 0; i < keys.length; i++) {
      const instance = instances[keys[i]];
      if (instance?.isVisible && (highestInstance === null || instance?.index > highestInstance?.index))
        highestInstance = instance;
    };
    return highestInstance;
  };

  //#region Close the latest Dialog
  useConfigurableAction<ICloseModalActionArguments>(
    {
      name: 'Close Dialog',
      owner: 'Common',
      ownerUid: SheshaActionOwners.Common,
      hasArguments: true,
      executer: (actionArgs) => {
        return new Promise((resolve, reject) => {
          const latestInstance = getLatestVisibleInstance();

          if (latestInstance) {
            removeModal(latestInstance?.id);
            latestInstance.onClose(actionArgs.showDialogResult === 'true');
            resolve({});
          } else {
            reject('There is no open dialog to close');
          }
        });
      },
      argumentsFormMarkup: closeDialogArgumentsForm,
    },
    actionDependencies
  );
  //#endregion

  const open = (modalProps: IModalProps) => {
    dispatch(openAction(modalProps));
  };

  const modalExists = (id: string) => {
    return Boolean(state.instances[id]);
  };

  return (
    <DynamicModalStateContext.Provider value={state}>
      <DynamicModalActionsContext.Provider value={{ open, createModal, removeModal, modalExists }} >
        <DynamicModalRenderer id='root'>
          {children}
        </DynamicModalRenderer>
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
