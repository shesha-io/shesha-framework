import React, { DependencyList, FC, PropsWithChildren, useContext, useEffect, useRef } from 'react';
import {
  ConfigurableActionDispatcherActionsContext,
  IConfigurableActionDispatcherActionsContext,
  IExecuteActionPayload,
  IGetConfigurableActionPayload,
  IPrepareActionArgumentsPayload,
  IRegisterActionPayload,
  RegisterActionType,
} from './contexts';
import { IConfigurableActionGroupDictionary } from './models';
import {
  ConfigurableActionArgumentsMigrationContext,
  DynamicContextHook,
  EMPTY_DYNAMIC_CONTEXT_HOOK,
  IConfigurableActionConfiguration,
  IConfigurableActionDescriptor,
  IConfigurableActionIdentifier,
} from '@/interfaces/configurableAction';
import { genericActionArgumentsEvaluator } from '../form/utils';
import { ActionParametersDictionary, GenericDictionary } from '@/interfaces';
import { IHasVersion, Migrator } from '@/utils/fluentMigrator/migrator';
import { isDefined } from '@/utils/nullables';

const getActualActionArguments = <TArguments extends ActionParametersDictionary = ActionParametersDictionary>(action: IConfigurableActionDescriptor<TArguments>, actionArguments: TArguments): TArguments => {
  const { migrator } = action;
  if (!migrator)
    return actionArguments;

  const migratorInstance = new Migrator<unknown, TArguments, ConfigurableActionArgumentsMigrationContext>();
  const fluent = migrator(migratorInstance);
  const versionedValue = { ...actionArguments } as IHasVersion;
  if (versionedValue.version === undefined)
    versionedValue.version = -1;
  const model = fluent.migrator.upgrade(versionedValue, {});
  return model;
};

const useConfigurableActionDispatcherOrUndefined = (): IConfigurableActionDispatcherActionsContext | undefined => {
  return useContext(ConfigurableActionDispatcherActionsContext);
};

const useConfigurableActionDispatcher = (): IConfigurableActionDispatcherActionsContext => {
  const context = useConfigurableActionDispatcherOrUndefined();

  if (context === undefined) {
    throw new Error(
      'useConfigurableActionDispatcherActions must be used within a ConfigurableActionDispatcherProvider',
    );
  }

  return context;
};


const useConfigurableActionDispatcherProxy = (): FC<PropsWithChildren> => {
  const actionsContext = useConfigurableActionDispatcherOrUndefined();

  return actionsContext !== undefined
    ? ({ children }) => (
      <ConfigurableActionDispatcherActionsContext.Provider value={actionsContext}>
        {children}
      </ConfigurableActionDispatcherActionsContext.Provider>
    )
    : ({ children }) => (<>{children}</>);
};

const ConfigurableActionDispatcherProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const actions = useRef<IConfigurableActionGroupDictionary>({});

  const parent = useConfigurableActionDispatcherOrUndefined();

  const getConfigurableActionOrNull = <TArguments extends ActionParametersDictionary = ActionParametersDictionary>(payload: IGetConfigurableActionPayload): IConfigurableActionDescriptor<TArguments> | null => {
    const { owner, name } = payload;

    if (!owner || !name) return null;

    const actionsGroup = actions.current[owner];

    const action = actionsGroup?.actions
      ? actionsGroup.actions.find((a) => a.name === name)
      : null;

    return action
      ? action as unknown as IConfigurableActionDescriptor<TArguments>
      : parent?.getConfigurableActionOrNull(payload) ?? null;
  };

  const getConfigurableAction = <TArguments extends ActionParametersDictionary = ActionParametersDictionary>(payload: IGetConfigurableActionPayload): IConfigurableActionDescriptor<TArguments> => {
    const action = getConfigurableActionOrNull<TArguments>(payload);
    if (!action) throw `Action '${payload.name}' in the owner '${payload.owner}' not found.`;

    return action;
  };

  const getActions = (): IConfigurableActionGroupDictionary => {
    return { ...parent?.getActions(), ...actions.current };
  };

  const registerAction: RegisterActionType = (payload) => {
    const ownerActions = actions.current[payload.ownerUid] ?? { ownerName: payload.owner, actions: [] };

    const newActions = ownerActions.actions.filter((action) => action.name !== payload.name);
    newActions.push(payload);

    actions.current = {
      ...actions.current,
      [payload.ownerUid]: { ...ownerActions, actions: newActions },
    };
  };

  const unregisterAction = (payload: IConfigurableActionIdentifier): void => {
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

  const prepareArguments = <TArguments extends ActionParametersDictionary = ActionParametersDictionary>(payload: IPrepareActionArgumentsPayload<TArguments>): Promise<TArguments> => {
    const { actionConfiguration, argumentsEvaluationContext } = payload;
    const { actionOwner, actionName, actionArguments } = actionConfiguration;
    const action = getConfigurableAction<TArguments>({ owner: actionOwner, name: actionName });

    const argumentsEvaluator = action.evaluateArguments ?? genericActionArgumentsEvaluator;
    return actionArguments
      ? argumentsEvaluator(actionArguments, argumentsEvaluationContext)
      : Promise.resolve({} as TArguments);
  };

  const executeAction = (payload: IExecuteActionPayload): Promise<void> => {
    const { actionConfiguration, argumentsEvaluationContext } = payload;
    if (!isDefined(actionConfiguration))
      return Promise.reject('Action Configuration is mandatory');
    const { actionOwner, actionName, actionArguments, handleSuccess, onSuccess, handleFail, onFail } = actionConfiguration;
    if (!actionName) return Promise.reject('Action name is mandatory');

    const action = getConfigurableAction({ owner: actionOwner, name: actionName });

    // migrate arguments
    const actualArguments = action.hasArguments
      ? getActualActionArguments(action, actionArguments)
      : undefined;

    const argumentsEvaluator = action.evaluateArguments ?? genericActionArgumentsEvaluator;
    const executionContext = argumentsEvaluationContext;

    return argumentsEvaluator({ ...actualArguments }, argumentsEvaluationContext)
      .then((preparedActionArguments) => {
        return action
          .executer(preparedActionArguments, executionContext)
          .then(async (actionResponse) => {
            if (handleSuccess) {
              if (onSuccess) {
                const onSuccessContext = { ...argumentsEvaluationContext, actionResponse };
                await executeAction({
                  actionConfiguration: { ...onSuccess },
                  argumentsEvaluationContext: onSuccessContext,
                  success: payload.success,
                  fail: payload.fail,
                });
              } else {
                console.warn(`onSuccess handled is not defined for action '${actionOwner}:${actionName}'`);
              };
            } else {
              if (payload.success) payload.success(actionResponse);
            };
          })
          .catch(async (error: unknown) => {
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

  const getDynamicContextHook = (actionConfiguration: IConfigurableActionConfiguration | undefined): DynamicContextHook => {
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
    <ConfigurableActionDispatcherActionsContext.Provider value={configurableActionActions}>
      {children}
    </ConfigurableActionDispatcherActionsContext.Provider>
  );
};

const ConfigurableActionDispatcherConsumer = ConfigurableActionDispatcherActionsContext.Consumer;

/**
 * Register configurable action
 */
function useConfigurableAction<TArguments extends object = object, TResponse = unknown>(
  payload: IRegisterActionPayload<TArguments, TResponse>,
  deps?: DependencyList,
): void {
  const { registerAction, unregisterAction } = useConfigurableActionDispatcher();

  useEffect(() => {
    if (!payload.owner || !payload.ownerUid) return undefined;

    registerAction(payload);

    return !payload.isPermament
      ? () => {
        unregisterAction(payload);
      }
      : undefined;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export {
  ConfigurableActionDispatcherConsumer,
  ConfigurableActionDispatcherProvider,
  useConfigurableAction,
  useConfigurableActionDispatcher,
  useConfigurableActionDispatcherProxy,
  getActualActionArguments,
  type IConfigurableActionConfiguration,
};
