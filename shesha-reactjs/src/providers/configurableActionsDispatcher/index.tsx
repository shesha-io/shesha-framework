import React, { FC, PropsWithChildren, useContext, useEffect, useRef } from 'react';
import useThunkReducer from '@/hooks/thunkReducer';
import {
  CONFIGURABLE_ACTION_DISPATCHER_CONTEXT_INITIAL_STATE,
  ConfigurableActionDispatcherActionsContext,
  ConfigurableActionDispatcherStateContext,
  IConfigurableActionDispatcherActionsContext,
  IConfigurableActionDispatcherStateContext,
  IExecuteActionPayload,
  IGetConfigurableActionPayload,
  IRegisterActionPayload,
} from './contexts';
import { IConfigurableActionGroupDictionary } from './models';
import metadataReducer from './reducer';
import {
  DynamicContextHook,
  EMPTY_DYNAMIC_CONTEXT_HOOK,
  IConfigurableActionArguments,
  IConfigurableActionConfiguration,
  IConfigurableActionDescriptor,
  IConfigurableActionIdentifier,
} from '@/interfaces/configurableAction';
import { genericActionArgumentsEvaluator } from '../form/utils';
import { GenericDictionary } from '@/interfaces';

export interface IConfigurableActionDispatcherProviderProps { }

const ConfigurableActionDispatcherProvider: FC<PropsWithChildren<IConfigurableActionDispatcherProviderProps>> = ({
  children,
}) => {
  const initial: IConfigurableActionDispatcherStateContext = {
    ...CONFIGURABLE_ACTION_DISPATCHER_CONTEXT_INITIAL_STATE,
  };

  const actions = useRef<IConfigurableActionGroupDictionary>({});

  const [state] = useThunkReducer(metadataReducer, initial);

  const getConfigurableActionOrNull = (
    payload: IGetConfigurableActionPayload
  ): IConfigurableActionDescriptor | null => {
    const { owner, name } = payload;

    if (!owner || !name) return null;

    // todo: search action in the dictionary and return action
    const actionsGroup = actions.current[owner];
    if (!actionsGroup?.actions) return null;

    const action = actionsGroup.actions.find((a) => a.name === name);
    if (!action) return null;

    return action;
  };

  const getConfigurableAction = (payload: IGetConfigurableActionPayload): IConfigurableActionDescriptor => {
    const action = getConfigurableActionOrNull(payload);
    if (!action) throw `Action '${payload.name}' in the owner '${payload.owner}' not found.`;

    return action;
  };

  const getActions = () => {
    return actions.current;
  };

  const registerAction = (payload: IRegisterActionPayload) => {
    const ownerActions = actions.current[payload.ownerUid] ?? { ownerName: payload.owner, actions: [] };

    const newActions = ownerActions.actions.filter((action) => action.name !== payload.name);
    newActions.push(payload);

    actions.current = {
      ...actions.current,
      [payload.ownerUid]: { ...ownerActions, actions: newActions },
    };
  };

  const unregisterAction = (payload: IConfigurableActionIdentifier) => {
    if (!payload.ownerUid) return;
    const ownerActions = actions.current[payload.ownerUid];
    if (!ownerActions) return;

    const newActions = ownerActions.actions.filter((action) => action.name !== payload.name);
    if (newActions.length > 0) {
      actions.current = {
        ...actions.current,
        [payload.ownerUid]: { ...ownerActions, actions: newActions },
      };
    } else {
      delete actions.current[payload.ownerUid];
    }
  };

  const prepareArguments = (_actionArguments: any) => {
    // nop
  };

  const executeAction = (payload: IExecuteActionPayload) => {
    const { actionConfiguration, argumentsEvaluationContext } = payload;
    if (!actionConfiguration) return Promise.reject('Action configuration is mandatory');
    const { actionOwner, actionName, actionArguments, handleSuccess, onSuccess, handleFail, onFail } =
      actionConfiguration;
    if (!actionName) return Promise.reject('Action name is mandatory');

    const action = getConfigurableAction({ owner: actionOwner, name: actionName });

    if (!action) return Promise.reject(`Action '${actionOwner}:${actionName}' not found`);

    const argumentsEvaluator = action.evaluateArguments ?? genericActionArgumentsEvaluator;
    const executionContext = argumentsEvaluationContext;

    return argumentsEvaluator({ ...actionArguments }, argumentsEvaluationContext) //getFormActionArguments(actionArguments, argumentsEvaluationContext)
      .then((preparedActionArguments) => {
        return action
          .executer(preparedActionArguments, executionContext)
          .then(async (actionResponse) => {
            if (handleSuccess) {
              if (onSuccess) {
                const onSuccessContext = { ...argumentsEvaluationContext, actionResponse: actionResponse };
                await executeAction({
                  actionConfiguration: { ...onSuccess },
                  argumentsEvaluationContext: onSuccessContext,
                  success: payload.success,
                  fail: payload.fail
                });
              } else {
                console.warn(`onSuccess handled is not defined for action '${actionOwner}:${actionName}'`);
              };
            } else {
              if (payload.success) payload.success(actionResponse);
            };
          })
          .catch(async (error) => {
            console.error(`Failed to execute action '${actionOwner}:${actionName}', error:`, error);
            if (handleFail) {
              if (onFail) {
                const onFailContext = { ...argumentsEvaluationContext, actionError: error };
                await executeAction({
                  actionConfiguration: { ...onFail },
                  argumentsEvaluationContext: onFailContext,
                  success: payload.success,
                  fail: payload.fail,
                });
              } else {
                console.warn(`onFail handled is not defined for action '${actionOwner}:${actionName}'`);
              }
            } else {
              if (payload.fail) payload.fail(error);
            };
          });
      });
  };

  const getDynamicContextHook = (actionConfiguration: IConfigurableActionConfiguration): DynamicContextHook => {
    if (!actionConfiguration)
      return EMPTY_DYNAMIC_CONTEXT_HOOK;

    const { actionOwner, actionName } = actionConfiguration;
    if (!actionName)
      return EMPTY_DYNAMIC_CONTEXT_HOOK;

    const action = getConfigurableActionOrNull({ owner: actionOwner, name: actionName });
    if (!action)
      return EMPTY_DYNAMIC_CONTEXT_HOOK;

    return action.useDynamicContextHook ?? EMPTY_DYNAMIC_CONTEXT_HOOK;
  };

  const useActionDynamicContext = (actionConfiguration: IConfigurableActionConfiguration): GenericDictionary => {
    const useDynamicData = getDynamicContextHook(actionConfiguration);

    return useDynamicData();
  };

  const configurableActionActions: IConfigurableActionDispatcherActionsContext = {
    registerAction,
    unregisterAction,
    getConfigurableAction,
    getConfigurableActionOrNull,
    getActions,
    prepareArguments,
    executeAction,
    useActionDynamicContext,
  };


  return (
    <ConfigurableActionDispatcherStateContext.Provider value={state}>
      <ConfigurableActionDispatcherActionsContext.Provider value={configurableActionActions}>
        {children}
      </ConfigurableActionDispatcherActionsContext.Provider>
    </ConfigurableActionDispatcherStateContext.Provider>
  );
};

function useConfigurableActionDispatcherState(require: boolean) {
  const context = useContext(ConfigurableActionDispatcherStateContext);

  if (context === undefined && require) {
    throw new Error('useConfigurableActionDispatcherState must be used within a ConfigurableActionDispatcherProvider');
  }

  return context;
}

function useConfigurableActionDispatcherActions(require: boolean) {
  const context = useContext(ConfigurableActionDispatcherActionsContext);

  if (context === undefined && require) {
    throw new Error(
      'useConfigurableActionDispatcherActions must be used within a ConfigurableActionDispatcherProvider'
    );
  }

  return context;
}

function useConfigurableActionDispatcher(require: boolean = true) {
  const actionsContext = useConfigurableActionDispatcherActions(require);
  const stateContext = useConfigurableActionDispatcherState(require);

  // useContext() returns initial state when provider is missing
  // initial context state is useless especially when require == true
  // so we must return value only when both context are available
  return actionsContext !== undefined && stateContext !== undefined
    ? { ...actionsContext, ...stateContext }
    : undefined;
}

const ConfigurableActionDispatcherConsumer = ConfigurableActionDispatcherActionsContext.Consumer;

/**
 * Register configurable action
 */
function useConfigurableAction<TArguments = IConfigurableActionArguments, TResponse = any>(
  payload: IRegisterActionPayload<TArguments, TResponse>,
  deps?: ReadonlyArray<any>
): void {
  const { registerAction, unregisterAction } = useConfigurableActionDispatcher();

  useEffect(() => {
    if (!payload.owner || !payload.ownerUid) return undefined;

    registerAction(payload);
    return () => {
      unregisterAction(payload);
    };
  }, deps);
}

export {
  ConfigurableActionDispatcherConsumer,
  ConfigurableActionDispatcherProvider,
  useConfigurableAction,
  useConfigurableActionDispatcher,
  type IConfigurableActionConfiguration
};
