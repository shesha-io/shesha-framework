import { Modal } from 'antd';
import React, { FC, PropsWithChildren, useContext, useReducer } from 'react';
import { DynamicModal } from '@/components/dynamicModal';
import { useConfigurableAction, useConfigurableActionDispatcherProxy } from '@/providers/configurableActionsDispatcher';
import { SheshaActionOwners } from '../configurableActionsDispatcher/models';
import { EvaluationContext, executeScript, recursiveEvaluator } from '../form/utils';
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
import { nanoid } from '@/utils/uuid';
import { migrateToV0 } from './migrations/ver0';

export interface IDynamicModalProviderProps { }

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
        return new Promise((resolve, reject) => {
          Modal.confirm({
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
    dispatch(createModalAction({ modalProps }));
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

          const { modalWidth, customWidth, widthUnits } = actionArgs;

          return new Promise((resolve, reject) => {
            const modalProps: IModalProps = {
              ...restArguments,
              mode: formMode,
              id: modalId,
              title: actionArgs.modalTitle,
              width: modalWidth === 'custom' && customWidth ? `${customWidth}${widthUnits}` : modalWidth,
              formArguments: dialogArguments,
              parentFormValues: parentFormValues,
              isVisible: true,
              onCancel: () => {
                reject();
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
      argumentsFormMarkup: dialogArgumentsForm,
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
    let highestIndexKey = null;

    for (let i = 0; i < keys.length; i++) {
      if (
        instances[keys[i]]?.isVisible &&
        (highestIndexKey === null || instances[keys[i]]?.index > instances[highestIndexKey]?.index)
      ) {
        highestIndexKey = keys[i];
      }
    };

    return highestIndexKey ? instances[highestIndexKey] : null;
  };

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
            latestInstance.onClose();
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

  const open = (modalProps: IModalProps) => {
    dispatch(openAction(modalProps));
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
              close: () => {
                removeModal(instance.id);
              }
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
