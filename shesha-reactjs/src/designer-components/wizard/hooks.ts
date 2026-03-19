import { componentsTreeToFlatStructure, useAvailableConstantsData } from '@/providers/form/utils';
import {
  clearWizardState,
  getStepDescritpion,
  getWizardStep,
  loadWizardState,
  saveWizardState
} from './utils';
import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { IConfigurableFormComponent, useForm, useSheshaApplication, ShaForm } from '@/providers';
import { IWizardComponentProps, IWizardStepProps } from './models';
import { useConfigurableAction } from '@/providers/configurableActionsDispatcher';
import { useDataContext } from '@/providers/dataContextProvider/contexts';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFormExpression } from '@/hooks';
import { useDeepCompareEffect } from '@/hooks/useDeepCompareEffect';
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
  visibleSteps: IWizardStepProps[];
}

export const useWizard = (model: Omit<IWizardComponentProps, 'size'>): IWizardComponent => {
  const { anyOfPermissionsGranted } = useSheshaApplication();
  const allData = useAvailableConstantsData();
  const dataContext = useDataContext();
  const toolbox = useFormDesignerComponents();
  const validator = useValidator(false);

  const { formMode, formData: currentFormData, setFormData } = useForm(false);

  const { executeBooleanExpression, executeAction } = useFormExpression();

  const {
    componentName: actionOwnerName,
    id: actionsOwnerId,
    steps: tabs,
    defaultActiveStep = 0,
    showStepStatus,
    sequence,
    persistStep = true,
  } = (model as IWizardComponentProps) || {};

  const { componentRelations, allComponents } = ShaForm.useMarkup();

  //Remove every tab from the equation that isn't visible either by customVisibility or permissions
  //Also populate stepFooter components from form markup
  const visibleSteps = useMemo(
    () =>
      tabs
        .filter(({ customVisibility, permissions }) => {
          const granted = anyOfPermissionsGranted(permissions || []);
          const isVisibleByCondition = executeBooleanExpression(customVisibility, true);

          return !((!granted || !isVisibleByCondition) && allData.form?.formMode !== 'designer');
        })
        .map((step) => {
          if (step.hasCustomFooter && step.stepFooter?.id) {
            const footerComponentIds = componentRelations[step.stepFooter.id] || [];
            const footerComponents = footerComponentIds
              .map((id) => allComponents[id])
              .filter(Boolean);

            return {
              ...step,
              stepFooter: {
                ...step.stepFooter,
                components: footerComponents,
              },
            };
          }
          return step;
        }),
    [tabs, componentRelations, allComponents]
  );

  const getDefaultStepIndex = (value: string | number | undefined): number => {
    if (value === undefined || value === null || value === '') {
      return 0;
    }
    const t =
      typeof value === 'number'
        ? tabs[value]
        : tabs?.find((item) => item?.id === value); // for backward compatibility
    if (t) {
      const visibleIndex = visibleSteps.findIndex((step) => step.id === t.id);
      return visibleIndex !== -1 ? visibleIndex : 0;
    }
    return 0;
  };


  const getInitialStep = useMemo(() => {
    // If persistStep is enabled and we're not in designer mode, try to load from sessionStorage
    if (persistStep && formMode !== 'designer') {
      const savedState = loadWizardState(actionsOwnerId, actionOwnerName);
      if (savedState) {
        // Restore form data
        if (savedState.formData && setFormData) {
          setFormData({ values: savedState.formData, mergeValues: false });
        }
        // Find the index of the saved step in visibleSteps array
        const stepIndex = visibleSteps.findIndex(step => step.id === savedState.stepId);
        if (stepIndex !== -1) {
          return stepIndex;
        }
      }
      // When persistence is ON, always start at Step 1 (ignore defaultActiveStep)
      return 0;
    }
    // When persistence is OFF, use the configured defaultActiveStep
    return getDefaultStepIndex(defaultActiveStep);
  }, []); 

  const [current, setCurrent] = useState(getInitialStep);
  const [visitedSteps, setVisitedSteps] = useState<Set<string>>(() => {
    // Try to restore visited steps from persisted state
    if (persistStep && formMode !== 'designer') {
      const savedState = loadWizardState(actionsOwnerId, actionOwnerName);
      if (savedState?.visitedSteps) {
        return new Set(savedState.visitedSteps);
      }
    }
    return new Set();
  });

  const currentStep = visibleSteps[current];

  // Use refs to capture latest values without causing effect re-runs
  const currentFormDataRef = useRef(currentFormData);
  const visitedStepsRef = useRef(visitedSteps);

  useEffect(() => {
    currentFormDataRef.current = currentFormData;
    visitedStepsRef.current = visitedSteps;
  });

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
          return formInstance?.validateFields(componentsNames, {recursive: false})
            .catch(e => {
              if (e.errorFields?.length > 0)
                throw e;
              return null;
            });
        },
      });
  }, [componentsNames]);

  const argumentsEvaluationContext = { ...allData, fieldsToValidate: componentsNames, validate: validator?.validate };

  // Track visited steps
  useEffect(() => {
    if (currentStep?.id) {
      setVisitedSteps(prev => new Set(prev).add(currentStep.id));
    }
  }, [currentStep?.id]);

  // Persist complete wizard state (step + form data + visited steps) when step changes
  useEffect(() => {
    if (persistStep && formMode !== 'designer' && currentStep?.id) {
      saveWizardState(
        actionsOwnerId,
        currentStep.id,
        currentFormDataRef.current,
        actionOwnerName,
        Array.from(visitedStepsRef.current)
      );
    }
  }, [currentStep?.id, persistStep, actionsOwnerId, actionOwnerName, formMode]);

  // Save state before page unload (catch mid-step data)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (persistStep && formMode !== 'designer' && currentStep?.id) {
        saveWizardState(
          actionsOwnerId,
          currentStep.id,
          currentFormDataRef.current,
          actionOwnerName,
          Array.from(visitedStepsRef.current)
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [persistStep, formMode, currentStep?.id, actionsOwnerId, actionOwnerName]);

  useEffect(() => {
    const actionConfiguration = currentStep?.onBeforeRenderActionConfiguration;

    if (!!actionConfiguration?.actionName) {
      executeAction({
        actionConfiguration: actionConfiguration,
        argumentsEvaluationContext
      });
    }
  }, [current]);

  const onAfterCallback = (callback: () => void, after?: (step: IWizardStepProps) => void) => {
    try {
      callback();
    } finally {
      if (after) after(currentStep);
    }
  };

  const successCallback = (type: 'back' | 'next' | 'reset') => {
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
  ) => {

    if (!formMode || formMode === 'designer') {
      if (success) success(null);
      return;
    }

    const beforeAction = beforeAccessor(currentStep);

    const successFunc = (response: any) => {
      onAfterCallback(
        () => {
          if (success) success(response);
        },
        () => {
          const afterAction = afterAccessor(currentStep);
          if (!!afterAction?.actionName)
            executeAction({
              actionConfiguration: afterAction,
              argumentsEvaluationContext
            });
        }
      );
    };

    if (!beforeAction?.actionName) {
      successFunc(null);
      return;
    }

    executeAction({
      actionConfiguration: beforeAction,
      argumentsEvaluationContext,
      success: successFunc,
    });
  };

  const next = async () => {
    try {
      if (current < tabs.length - 1) {
        executeActionIfConfigured(
          (tab) => tab.beforeNextActionConfiguration,
          (tab) => tab.afterNextActionConfiguration,
          () => successCallback('next')
        );
      }
    } catch (errInfo) {
      console.error("Couldn't Proceed", errInfo);
    }
  };

  const back = () => {
    if (current > 0)
      executeActionIfConfigured(
        (tab) => tab.beforeBackActionConfiguration,
        (tab) => tab.afterBackActionConfiguration,
        () => successCallback('back'),
      );
  };

  const cancel = () =>
    executeActionIfConfigured(
      (tab) => tab.beforeCancelActionConfiguration,
      (tab) => tab.afterCancelActionConfiguration
    );

  const done = async () => {
    try {
      executeActionIfConfigured(
        (tab) => tab.beforeDoneActionConfiguration,
        (tab) => tab.afterDoneActionConfiguration,
        () => {
          // Clear persisted state when wizard is completed
          if (persistStep) {
            clearWizardState(actionsOwnerId, actionOwnerName);
          }
        }
      );
    } catch (errInfo) {
      console.error("Couldn't Proceed", errInfo);
    }
  };

  const setStep = (stepIndex: number): void => {
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
    actionDependencies
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
    actionDependencies
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
    actionDependencies
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
    actionDependencies
  );

  useConfigurableAction(
    {
      name: 'Reset Steps',
      owner: actionOwnerName,
      ownerUid: actionsOwnerId,
      hasArguments: false,
      executer: () => {
        // Clear persisted state when wizard is reset
        if (persistStep) {
          clearWizardState(actionsOwnerId, actionOwnerName);
        }
        // Clear visited steps
        setVisitedSteps(new Set());
        // Clear form data
        if (setFormData) {
          setFormData({ values: {}, mergeValues: false });
        }
        successCallback('reset');
        return Promise.resolve();
      },
    },
    actionDependencies
  );

  useConfigurableAction(
    {
      name: 'Validate',
      description: 'Validate the Wizard step data and show validation errors if any',
      owner: actionOwnerName,
      ownerUid: actionsOwnerId,
      hasArguments: false,
      executer: async (_, actionContext) => {
        if (actionContext?.validate) {
          return actionContext.validate();
        }
        return Promise.resolve();
      },
    },
    actionDependencies
  );
  //#endregion

  const content = getStepDescritpion(showStepStatus, sequence, current);

  /* Data Context section */

  useDeepCompareEffect(() => {
    dataContext.setData({ current, visibleSteps });
  }, [current, visibleSteps]);

  dataContext.updateApi({ back, cancel, done, content, next, setStep }); // update context api to use relevant State

  /* Data Context section */

  return { back, components, current, currentStep, cancel, done, content, next, visibleSteps };
};