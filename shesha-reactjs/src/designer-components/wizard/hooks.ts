import { componentsTreeToFlatStructure, executeScriptSync, useAvailableConstantsData } from '@/providers/form/utils';
import { getStepDescritpion, getWizardStep } from './utils';
import { getInitialStepIndex, getDefaultStepIndex, isValidStepIndex, shouldPersistStep } from './stepSelection';
import { IActionExecutionContext, IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { IConfigurableFormComponent, isConfigurableFormComponent, useForm, useSheshaApplication, ShaForm } from '@/providers';
import { IWizardComponentProps, IWizardStepProps } from './models';
import { useConfigurableAction } from '@/providers/configurableActionsDispatcher';
import { useEffect, useMemo, useState } from 'react';
import { useDeepCompareMemo, useFormExpression, useSessionStorage } from '@/hooks';
import { useFormDesignerComponents } from '@/providers/form/hooks';
import { useValidator } from '@/providers/validateProvider';
import { useClosestModal } from '@/providers/dynamicModal';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { isNonEmptyArray } from '@/utils/array';
import { ValidateErrorEntity } from '../..';

interface IWizardComponent {
  back: () => void;
  close: () => void;
  components: IConfigurableFormComponent[] | undefined;
  current: number;
  currentStep: IWizardStepProps | undefined;
  cancel: () => void;
  done: () => void;
  content: (description: string, index: number) => string;
  executeBooleanExpression: (expression: string | undefined | null, returnBoolean?: boolean) => boolean;
  next: () => void;
  reset: () => void;
  setStep: (stepIndex: number) => void;
  visibleSteps: IWizardStepProps[];
}

type IValidatable = IActionExecutionContext & { validate: (() => Promise<void>) | undefined };

export const useWizard = (model: IWizardComponentProps): IWizardComponent => {
  const { anyOfPermissionsGranted } = useSheshaApplication();
  const allData = useAvailableConstantsData({ topContextId: 'ctx_' + model.id });
  const toolbox = useFormDesignerComponents();
  const validator = useValidator(false);
  const closestModal = useClosestModal();

  const formMode = useForm().formMode;

  const { executeActionViaPayload } = useFormExpression();

  const executeBooleanExpression = (expression: string | undefined | null, returnBoolean = true): boolean => {
    if (isNullOrWhiteSpace(expression)) return returnBoolean;
    const evaluated = executeScriptSync(expression, allData);
    return typeof evaluated === 'boolean' ? evaluated : true;
  };

  const {
    componentName,
    id: actionsOwnerId,
    steps: tabs,
    defaultActiveStep = 0,
    showStepStatus = false,
    sequence,
    persistCurrentStep = true,
  } = model;
  const actionOwnerName = componentName ?? "";

  // Persist the active step across page refresh (opt-in). Disabled in the designer and inside
  // modals, since a modal won't reopen on refresh and its stored step would apply out of context.
  // NOTE: useClosestModal() has a non-undefined default, so check `instance` to detect a real modal.
  const canPersist = shouldPersistStep(persistCurrentStep, formMode, !!closestModal?.instance);
  const stepStorageKey = `wizard-step:${actionsOwnerId}`;
  const [storedStep, setStoredStep] = useSessionStorage<number | undefined>(stepStorageKey);

  const [current, setCurrent] = useState(() => getInitialStepIndex(canPersist, storedStep, tabs, defaultActiveStep));

  const { componentRelations, allComponents } = ShaForm.useMarkup();

  const visibleSteps = useDeepCompareMemo(
    () =>
      tabs
        .filter(({ customVisibility, permissions }) => {
          const granted = anyOfPermissionsGranted(permissions || []);
          const isVisibleByCondition = executeBooleanExpression(customVisibility, true);

          return !((!granted || !isVisibleByCondition) && formMode !== 'designer');
        })
        .map((step) => {
          // Get footer id - use existing or generate fallback
          const footerId = step.stepFooter?.id ?? (step.hasCustomFooter ? `${step.id}_footer` : undefined);

          if (step.hasCustomFooter && footerId) {
            const footerComponentIds = componentRelations[footerId] || [];
            const footerComponents = footerComponentIds
              .map((id) => allComponents[id])
              .filter(isConfigurableFormComponent);

            return {
              ...step,
              stepFooter: {
                ...step.stepFooter,
                id: footerId,
                components: footerComponents,
              },
            };
          }
          return step;
        }),
    [tabs, formMode, componentRelations, allComponents],
  );

  const currentStep = visibleSteps[current];
  const components = currentStep?.components;
  const componentsNames = useMemo(() => {
    if (!components) return [];
    const flat = componentsTreeToFlatStructure(toolbox, components);
    const properties = [];
    for (const comp in flat.allComponents)
      if (Object.hasOwn(flat.allComponents, comp)) {
        const component = flat.allComponents[comp];
        if (isConfigurableFormComponent(component) && component.propertyName && !component.context)
          properties.push(component.propertyName.split("."));
      }
    return properties;
  }, [components, toolbox]);

  var formInstance = allData.form?.formInstance;
  useEffect(() => {
    if (validator)
      validator.registerValidator({
        id: model.id,
        validate: () => {
          return isDefined(formInstance)
            ? formInstance.validateFields(componentsNames, { recursive: false })
              .then(() => {

              })
              .catch((e: ValidateErrorEntity) => {
                if (isNonEmptyArray(e.errorFields))
                  throw e;
              })
            : Promise.resolve();
        },
      });
  }, [model.id, componentsNames, formInstance, validator]);

  const argumentsEvaluationContext = { ...allData, fieldsToValidate: componentsNames, validate: validator?.validate };

  useEffect(() => {
    // Don't clobber a valid persisted step on mount/tabs change when persistence is active.
    if (canPersist && isValidStepIndex(storedStep, tabs))
      return;
    setCurrent(getDefaultStepIndex(tabs, defaultActiveStep));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultActiveStep, tabs]);

  useEffect(() => {
    const actionConfiguration = currentStep?.onBeforeRenderActionConfiguration;

    if (actionConfiguration) {
      executeActionViaPayload({
        actionConfiguration: actionConfiguration,
        argumentsEvaluationContext,
      });
    }
    // TODO V1: move to event handlers
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  const onAfterCallback = (callback: () => void, after?: () => void): void => {
    try {
      callback();
    } finally {
      if (after) after();
    }
  };

  const applyStep = (stepIndex: number): void => {
    setCurrent(stepIndex);
    if (canPersist)
      setStoredStep(stepIndex);
  };

  const successCallback = (type: 'back' | 'next' | 'reset'): void => {
    setTimeout(() => {
      const step = getWizardStep(visibleSteps, current, type);

      if (step >= 0 && step !== current) {
        applyStep(step);
      }
    }, 100); // It is necessary to have time to complete a request
  };

  /// NAVIGATION
  const executeActionIfConfigured = (
    beforeAccessor: (step: IWizardStepProps) => IConfigurableActionConfiguration | undefined,
    afterAccessor: (step: IWizardStepProps) => IConfigurableActionConfiguration | undefined,
    success?: (actionResponse: unknown) => void,
  ): void => {
    if (isNullOrWhiteSpace(formMode) || formMode === 'designer') {
      if (success) success(null);
      return;
    }

    const beforeAction = isDefined(currentStep) ? beforeAccessor(currentStep) : undefined;

    const successFunc = (response: unknown): void => {
      onAfterCallback(
        () => {
          if (success) success(response);
        },
        () => {
          if (!currentStep)
            return;
          const afterAction = afterAccessor(currentStep);
          if (afterAction)
            executeActionViaPayload({
              actionConfiguration: afterAction,
              argumentsEvaluationContext,
            });
        },
      );
    };

    if (!beforeAction?.actionName) {
      successFunc(null);
      return;
    }

    executeActionViaPayload({
      actionConfiguration: beforeAction,
      argumentsEvaluationContext,
      success: successFunc,
    });
  };

  const next = (): void => {
    try {
      if (current < tabs.length - 1) {
        executeActionIfConfigured(
          (tab) => tab.beforeNextActionConfiguration,
          (tab) => tab.afterNextActionConfiguration,
          () => successCallback('next'),
        );
      }
    } catch (errInfo) {
      console.error("Couldn't Proceed", errInfo);
    }
  };

  const back = (): void => {
    if (current > 0)
      executeActionIfConfigured(
        (tab) => tab.beforeBackActionConfiguration,
        (tab) => tab.afterBackActionConfiguration,
        () => successCallback('back'),
      );
  };

  const close = (): void => {
    closestModal?.close();
  };

  const cancel = (): void =>
    executeActionIfConfigured(
      (tab) => tab.beforeCancelActionConfiguration,
      (tab) => tab.afterCancelActionConfiguration,
      () => close(),
    );

  const done = (): void => {
    try {
      executeActionIfConfigured(
        (tab) => tab.beforeDoneActionConfiguration,
        (tab) => tab.afterDoneActionConfiguration,
        () => {
          // Wizard finished - drop the persisted step so a later visit starts fresh.
          if (canPersist)
            setStoredStep(undefined);
        },
      );
    } catch (errInfo) {
      console.error("Couldn't Proceed", errInfo);
    }
  };

  const reset = (): void => {
    successCallback('reset');
  };

  const setStep = (stepIndex: number): void => {
    if (stepIndex < 0 || stepIndex >= visibleSteps.length)
      throw `Step with index ${stepIndex} is not available`;
    applyStep(stepIndex);
  };

  // #region configurable actions
  const actionDependencies = [actionOwnerName, actionsOwnerId, current];

  useConfigurableAction(
    {
      name: 'Back',
      owner: actionOwnerName,
      ownerUid: actionsOwnerId,
      hasArguments: false,
      executer: () => {
        back();
        return Promise.resolve();
      },
    },
    actionDependencies,
  );

  useConfigurableAction(
    {
      name: 'Next',
      owner: actionOwnerName,
      ownerUid: actionsOwnerId,
      hasArguments: false,
      executer: () => {
        next();
        return Promise.resolve();
      },
    },
    actionDependencies,
  );

  useConfigurableAction(
    {
      name: 'Cancel',
      owner: actionOwnerName,
      ownerUid: actionsOwnerId,
      hasArguments: false,
      executer: () => {
        cancel();
        return Promise.resolve();
      },
    },
    actionDependencies,
  );

  useConfigurableAction(
    {
      name: 'Close',
      owner: actionOwnerName,
      ownerUid: actionsOwnerId,
      hasArguments: false,
      executer: () => {
        close();
        return Promise.resolve();
      },
    },
    actionDependencies,
  );

  useConfigurableAction(
    {
      name: 'Done',
      owner: actionOwnerName,
      ownerUid: actionsOwnerId,
      hasArguments: false,
      executer: () => {
        done();
        return Promise.resolve();
      },
    },
    actionDependencies,
  );

  useConfigurableAction(
    {
      name: 'Reset Steps',
      owner: actionOwnerName,
      ownerUid: actionsOwnerId,
      hasArguments: false,
      executer: () => {
        successCallback('reset');
        return Promise.resolve();
      },
    },
    actionDependencies,
  );

  useConfigurableAction<object, unknown, IValidatable>(
    {
      name: 'Validate',
      description: 'Validate the Wizard step data and show validation errors if any',
      owner: actionOwnerName,
      ownerUid: actionsOwnerId,
      hasArguments: false,
      executer: (_, actionContext) => {
        if (actionContext.validate) {
          return actionContext.validate();
        }
        return Promise.resolve();
      },
    },
    actionDependencies,
  );
  //#endregion

  const content = getStepDescritpion(showStepStatus, sequence, current);

  return { components, current, currentStep, visibleSteps, back, cancel, close, done, content, executeBooleanExpression, next, reset, setStep };
};
