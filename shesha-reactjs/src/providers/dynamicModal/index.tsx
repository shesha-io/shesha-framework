import { App } from 'antd';
import React, { FC, PropsWithChildren, useCallback, useContext, useMemo, useReducer } from 'react';
import { useConfigurableAction, useConfigurableActionDispatcherProxy } from '@/providers/configurableActionsDispatcher';
import { IActionExecutionContext } from '@/interfaces/configurableAction';
import { SheshaActionOwners } from '../configurableActionsDispatcher/models';
import { EvaluationContext, executeScript, recursiveEvaluator } from '../form/utils';
import { createModalAction, openAction, removeModalAction } from './actions';
import {
  IShowConfirmationArguments,
  getShowConfirmationArgumentsForm,
} from './configurable-actions/show-confirmation-arguments';
import { ICloseModalActionArguments, IShowModalActionArguments, closeDialogArgumentsForm } from './configurable-actions/dialog-arguments';
import {
  DYNAMIC_MODAL_CONTEXT_INITIAL_STATE,
  DynamicModalActionsContext,
  DynamicModalInstanceContext,
  DynamicModalStateContext,
  IDynamicModalActionsContext,
  IDynamicModalInstanceContext,
  IDynamicModalStateContext,
} from './contexts';
import { IModalProps } from './models';
import { reducer } from './reducer';
import { nanoid } from '@/utils/uuid';
import { migrateToV0 } from './migrations/ver0';
import { DynamicModalRenderer } from './renderer';
import { showDialogArgumentsFormFactory } from './configurable-actions/show-dialog-arguments';
import { throwError } from '@/utils/errors';
import { getLatestInstance } from './utils';
import { createModalApi, IModalApi, createFallbackModalApi } from './modalApi';

type IDynamicModalActionExecutionContext = IActionExecutionContext & {
  configurableActionsDispatcherProxy?: FC<PropsWithChildren>;
};


const DynamicModalProvider: FC<PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, {
    ...DYNAMIC_MODAL_CONTEXT_INITIAL_STATE,
  });
  const actionDependencies = [state];
  const { modal } = App.useApp();

  useConfigurableAction<IShowConfirmationArguments>(
    {
      name: 'Show Confirmation Dialog',
      owner: 'Common',
      ownerUid: SheshaActionOwners.Common,
      sortOrder: 7,
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
      argumentsFormMarkup: getShowConfirmationArgumentsForm,
    },
    actionDependencies,
  );

  const removeModal = useCallback((id: string): void => {
    dispatch(removeModalAction(id));
  }, []);

  const createModal = useCallback((modalProps: IModalProps): void => {
    dispatch(createModalAction({ modalProps: { ...modalProps, width: modalProps.width ?? '60%' } }));
  }, []);

  useConfigurableAction<IShowModalActionArguments, unknown, IDynamicModalActionExecutionContext>(
    {
      name: 'Show Dialog',
      owner: 'Common',
      ownerUid: SheshaActionOwners.Common,
      sortOrder: 3,
      hasArguments: true,
      executer: (actionArgs, context) => {
        const modalId = nanoid();

        const { formMode, ...restArguments } = actionArgs;

        const argumentsExpression = actionArgs.formArguments?.trim();
        const argumentsPromise = argumentsExpression
          ? executeScript<object>(argumentsExpression, context)
          : Promise.resolve(undefined);

        return argumentsPromise.then((dialogArguments) => {
          const parentFormValues = context.data ?? {};

          const { modalWidth, customWidth, widthUnits, showCloseIcon = true } = actionArgs;

          return new Promise((resolve, reject) => {
            const modalProps: IModalProps = {
              ...restArguments,
              mode: formMode === "edit" ? "edit" : "readonly",
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
      argumentsFormMarkup: showDialogArgumentsFormFactory,
      evaluateArguments: (argumentsConfiguration, evaluationData) => {
        const evaluationContext: EvaluationContext = {
          contextData: evaluationData,
          path: '',
          evaluationFilter: (context, _data) => context.path !== 'buttons',
        };
        return recursiveEvaluator(argumentsConfiguration, evaluationContext);
      },
      useDynamicContextHook: () => {
        const configurableActionsDispatcherProxy = useConfigurableActionDispatcherProxy();
        return { configurableActionsDispatcherProxy };
      },
      migrator: (m) => m.add<IShowModalActionArguments>(0, migrateToV0)
        .add<IShowModalActionArguments>(1, (prev) => ({
          ...prev,
          showCloseIcon: prev.showCloseIcon !== undefined ? prev.showCloseIcon : true,
        })),
    },
    actionDependencies,
  );

  //#region Close the latest Dialog
  useConfigurableAction<ICloseModalActionArguments>(
    {
      name: 'Close Dialog',
      owner: 'Common',
      ownerUid: SheshaActionOwners.Common,
      sortOrder: 4,
      hasArguments: true,
      executer: (actionArgs) => {
        return new Promise((resolve, reject) => {
          const latestInstance = getLatestInstance(state.instances, (inst) => inst.isVisible);

          if (latestInstance) {
            removeModal(latestInstance.id);
            latestInstance.onClose?.(actionArgs.showDialogResult === 'true');
            resolve({});
          } else {
            reject('There is no open dialog to close');
          }
        });
      },
      argumentsFormMarkup: closeDialogArgumentsForm,
    },
    actionDependencies,
  );
  //#endregion

  const open = (modalProps: IModalProps): void => {
    dispatch(openAction(modalProps));
  };

  const modalExists = (id: string): boolean => {
    return Boolean(state.instances[id]);
  };

  return (
    <DynamicModalStateContext.Provider value={state}>
      <DynamicModalActionsContext.Provider value={{ open, createModal, removeModal, modalExists }}>
        <DynamicModalRenderer id="root">
          {children}
        </DynamicModalRenderer>
      </DynamicModalActionsContext.Provider>
    </DynamicModalStateContext.Provider>
  );
};

const useDynamicModalState = (): IDynamicModalStateContext => useContext(DynamicModalStateContext) ?? throwError("useDynamicModalState must be used within a DynamicModalProvider");

function useDynamicModalStateOrUndefined(): IDynamicModalStateContext | undefined {
  return useContext(DynamicModalStateContext);
}

const useDynamicModalActions = (): IDynamicModalActionsContext => useContext(DynamicModalActionsContext) ?? throwError("useDynamicModalActions must be used within a DynamicModalProvider");

function useDynamicModalActionsOrUndefined(): IDynamicModalActionsContext | undefined {
  return useContext(DynamicModalActionsContext);
}

const useDynamicModals = (): IDynamicModalStateContext & IDynamicModalActionsContext => {
  return { ...useDynamicModalState(), ...useDynamicModalActions() };
};

function useDynamicModalsOrUndefined(): (IDynamicModalStateContext & IDynamicModalActionsContext) | undefined {
  const state = useDynamicModalStateOrUndefined();
  const actions = useDynamicModalActionsOrUndefined();

  if (!state || !actions) return undefined;

  return { ...state, ...actions };
}

interface SimpleModal {
  open: () => void;
  close: () => void;
}
const useModal = (modalProps: IModalProps): SimpleModal => {
  const context = useDynamicModals();

  const instance: SimpleModal = {
    open: () => {
      if (!context.modalExists(modalProps.id)) context.createModal({ ...modalProps, isVisible: true });
    },
    close: () => {
      context.removeModal(modalProps.id);
    },
  };

  return instance;
};

function useClosestModal(): IDynamicModalInstanceContext {
  const context = useContext(DynamicModalInstanceContext);
  return context;
}

/**
 * Hook to get the modal API for use in scripts and code
 * @returns Modal API instance with methods to show dialogs, forms, and confirmations
 * @example
 * const modalApi = useModalApi();
 *
 * // Show a form in a modal
 * const result = await modalApi.showForm({
 *   formId: { name: 'my-form', module: 'app' },
 *   title: 'Edit Record'
 * });
 *
 * // Show a confirmation
 * const confirmed = await modalApi.confirm({
 *   title: 'Delete',
 *   content: 'Are you sure?'
 * });
 */
function useModalApi(): IModalApi {
  const { createModal, removeModal } = useDynamicModals();
  const { modal: antModalApi } = App.useApp();

  // Memoize the modal API to prevent unnecessary re-creations
  const modalApi = useMemo(
    () => createModalApi(createModal, removeModal, antModalApi),
    [createModal, removeModal, antModalApi],
  );

  return modalApi;
}

/**
 * Hook to get the modal API with fallback if provider is not available
 * Use this in contexts where DynamicModalProvider may not be available
 * @returns Modal API instance with full functionality when provider is available,
 * or a fallback API with limited functionality (only static methods like confirm, warning, etc.) when provider is not available.
 * Note: This hook always returns an IModalApi object, never undefined.
 */
function useModalApiWithFallback(): IModalApi {
  const modals = useDynamicModalsOrUndefined();
  const { modal: antModalApi } = App.useApp();

  // Memoize the modal API to prevent unnecessary re-creations
  const modalApi = useMemo(() => {
    if (!modals) {
      // Return fallback API with only static methods when provider is not available
      return createFallbackModalApi(antModalApi);
    }

    return createModalApi(modals.createModal, modals.removeModal, antModalApi);
  }, [modals, antModalApi]);

  return modalApi;
}

export {
  DynamicModalProvider,
  useClosestModal,
  useDynamicModals,
  useDynamicModalsOrUndefined,
  useModal,
  useModalApi,
  useModalApiWithFallback,
};
export type { IModalApi };
