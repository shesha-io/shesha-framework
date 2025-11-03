import { componentsTreeToFlatStructure, useAvailableConstantsData } from '@/providers/form/utils';
import { getStepDescritpion, getWizardStep } from './utils';
import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { IConfigurableFormComponent, useForm, useSheshaApplication } from '@/providers';
import { IWizardComponentProps, IWizardStepProps } from './models';
import { useConfigurableAction } from '@/providers/configurableActionsDispatcher';
import { useEffect, useMemo, useState } from 'react';
import { useFormExpression } from '@/hooks';
import { useFormDesignerComponents } from '@/providers/form/hooks';
import { useValidator } from '@/providers/validateProvider';

interface IWizardComponent {
  back: () => void;
  components: IConfigurableFormComponent[];
  current: number;
  currentStep: IWizardStepProps;
  cancel: () => void;
  done: () => void;
  content: (description: string, index: number) => string;
  next: () => void;
  setStep: (stepIndex) => void;
  visibleSteps: IWizardStepProps[];
}

export const useWizard = (model: Omit<IWizardComponentProps, 'size'>): IWizardComponent => {
  const { anyOfPermissionsGranted } = useSheshaApplication();
  const allData = useAvailableConstantsData();
  const toolbox = useFormDesignerComponents();
  const validator = useValidator(false);

  const formMode = useForm(false).formMode;

  const { executeBooleanExpression, executeActionViaPayload } = useFormExpression();

  const {
    componentName: actionOwnerName,
    id: actionsOwnerId,
    steps: tabs,
    defaultActiveStep = 0,
    showStepStatus,
    sequence,
  } = (model as IWizardComponentProps) || {};

  const getDefaultStepIndex = (i): number => {
    if (i) {
      const t = tabs[i] ??
        tabs?.find((item) => item?.id === i); // for backward compatibility
      return !!t ? tabs.indexOf(t) : 0;
    }
    return 0;
  };

  const [current, setCurrent] = useState(() => {
    return getDefaultStepIndex(defaultActiveStep);
  });

  // Remove every tab from the equation that isn't visible either by customVisibility or permissions
  const visibleSteps = useMemo(
    () =>
      tabs
        .filter(({ customVisibility, permissions }) => {
          const granted = anyOfPermissionsGranted(permissions || []);
          const isVisibleByCondition = executeBooleanExpression(customVisibility, true);

          return !((!granted || !isVisibleByCondition) && allData.form?.formMode !== 'designer');
        }),
    [tabs],
  );

  const currentStep = visibleSteps[current];
  const components = currentStep?.components;
  const componentsNames = useMemo(() => {
    if (!components) return null;
    const flat = componentsTreeToFlatStructure(toolbox, components);
    const properties = [];
    for (const comp in flat.allComponents)
      if (Object.hasOwn(flat.allComponents, comp)) {
        const component = flat.allComponents[comp];
        if (component.propertyName && !component.context)
          properties.push(component.propertyName.split("."));
      }
    return properties;
  }, [currentStep]);

  useEffect(() => {
    if (validator)
      validator.registerValidator({
        id: model.id,
        validate: () => {
          var formInstance = allData?.form?.formInstance;
          return formInstance?.validateFields(componentsNames, { recursive: false })
            .catch((e) => {
              if (e.errorFields?.length > 0)
                throw e;
              return null;
            });
        },
      });
  }, [componentsNames]);

  const argumentsEvaluationContext = { ...allData, fieldsToValidate: componentsNames, validate: validator?.validate };

  useEffect(() => {
    setCurrent(getDefaultStepIndex(defaultActiveStep));
  }, [defaultActiveStep]);

  useEffect(() => {
    const actionConfiguration = currentStep?.onBeforeRenderActionConfiguration;

    if (!!actionConfiguration?.actionName) {
      executeActionViaPayload({
        actionConfiguration: actionConfiguration,
        argumentsEvaluationContext,
      });
    }
  }, [current]);

  const onAfterCallback = (callback: () => void, after?: (step: IWizardStepProps) => void): void => {
    try {
      callback();
    } finally {
      if (after) after(currentStep);
    }
  };

  const successCallback = (type: 'back' | 'next' | 'reset'): void => {
    setTimeout(() => {
      const step = getWizardStep(visibleSteps, current, type);

      if (step >= 0 && step !== current) {
        setCurrent(step);
      }
    }, 100); // It is necessary to have time to complete a request
  };

  /// NAVIGATION
  const executeActionIfConfigured = (
    beforeAccessor: (step: IWizardStepProps) => IConfigurableActionConfiguration,
    afterAccessor: (step: IWizardStepProps) => IConfigurableActionConfiguration,
    success?: (actionResponse: any) => void,
  ): void => {
    if (!formMode || formMode === 'designer') {
      if (success) success(null);
      return;
    }

    const beforeAction = beforeAccessor(currentStep);

    const successFunc = (response: any): void => {
      onAfterCallback(
        () => {
          if (success) success(response);
        },
        () => {
          const afterAction = afterAccessor(currentStep);
          if (!!afterAction?.actionName)
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

  const cancel = (): void =>
    executeActionIfConfigured(
      (tab) => tab.beforeCancelActionConfiguration,
      (tab) => tab.afterCancelActionConfiguration,
    );

  const done = (): void => {
    try {
      executeActionIfConfigured(
        (tab) => tab.beforeDoneActionConfiguration,
        (tab) => tab.afterDoneActionConfiguration,
      );
    } catch (errInfo) {
      console.error("Couldn't Proceed", errInfo);
    }
  };

  const setStep = (stepIndex): void => {
    if (stepIndex < 0 || stepIndex >= visibleSteps.length)
      throw `Step with index ${stepIndex} is not available`;
    setCurrent(stepIndex);
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

  useConfigurableAction(
    {
      name: 'Validate',
      description: 'Validate the Wizard step data and show validation errors if any',
      owner: actionOwnerName,
      ownerUid: actionsOwnerId,
      hasArguments: false,
      executer: (_, actionContext) => {
        if (actionContext?.validate) {
          return actionContext.validate();
        }
        return Promise.resolve();
      },
    },
    actionDependencies,
  );
  //#endregion

  const content = getStepDescritpion(showStepStatus, sequence, current);

  return { components, current, currentStep, visibleSteps, back, cancel, done, content, next, setStep };
};
