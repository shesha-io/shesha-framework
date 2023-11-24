import { useDataContext } from '@/providers/dataContextProvider/index';
import { useEffect, useMemo, useState } from 'react';
import { IConfigurableFormComponent, useFormExpression, useSheshaApplication } from '../../../../';
import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { useForm } from '../../../../providers';
import { useConfigurableAction } from '@/providers/configurableActionsDispatcher';
import { IWizardComponentProps, IWizardStepProps } from './models';
import { getStepDescritpion, getWizardStep, isEmptyArgument } from './utils';

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
  const { formMode } = useForm();
  const dataContext = useDataContext();

  const { argumentsEvaluationContext, executeBooleanExpression, executeAction } =
    useFormExpression();

  const {
    propertyName: actionOwnerName,
    id: actionsOwnerId,
    steps: tabs,
    defaultActiveStep = 0,
    showStepStatus,
    sequence,
  } = (model as IWizardComponentProps) || {};

  const getDefaultStepIndex = (i) => {
    if (i) {
      const t = tabs[i] 
        ?? tabs?.find((item) => item?.id === i); // for backward compatibility
      return !!t ? tabs.indexOf(t) : 0;
    }
    return 0;
  };

  const [current, setCurrent] = useState(() => {
    return getDefaultStepIndex(defaultActiveStep);
  });

  const [components, setComponents] = useState<IConfigurableFormComponent[]>();

  //Remove every tab from the equation that isn't visible either by customVisibility or permissions
  const visibleSteps = useMemo(
    () =>
      tabs.filter(({ customVisibility, permissions }) => {
        const granted = anyOfPermissionsGranted(permissions || []);
        const isVisibleByCondition = executeBooleanExpression(customVisibility, true);

        return !((!granted || !isVisibleByCondition) && formMode !== 'designer');
      }),
    [tabs]
  );

  const currentStep = visibleSteps[current];

  useEffect(() => {
    setCurrent(getDefaultStepIndex(defaultActiveStep))
  }, [defaultActiveStep]);

  useEffect(() => {
    const actionConfiguration = currentStep?.onBeforeRenderActionConfiguration;

    if (!isEmptyArgument(actionConfiguration)) {
      executeAction({
        actionConfiguration: actionConfiguration,
        argumentsEvaluationContext
      });
    }
  }, [currentStep]);

  const actionDependencies = [actionOwnerName, actionsOwnerId, current];

  // #region configurable actions
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
  //#endregion

  const onAfterCallback = (callback: () => void, after?: (step: IWizardStepProps) => void) => {
    try {
      callback();
    } finally {
      if (after) after(currentStep);
    }
  };

  const successCallback = (type: 'back' | 'next') => {
    setTimeout(() => {
      const step = getWizardStep(visibleSteps, current, type);

      if (step >= 0 && step !== current) {
        setCurrent(step);
      }
      setComponents(currentStep?.components);
    }, 100); // It is necessary to have time to complete a request
  };

  /// NAVIGATION
  const executeActionIfConfigured = (
    beforeAccessor: (step: IWizardStepProps) => IConfigurableActionConfiguration,
    afterAccessor: (step: IWizardStepProps) => IConfigurableActionConfiguration,
    success?: (actionResponse: any) => void,
  ) => {
    const beforeAction = beforeAccessor(currentStep);

    const successFunc = (response: any) => {
      onAfterCallback(
        () => { 
          if (success) success(response);
        },
        () => {
          const afterAction = afterAccessor(currentStep);
          if (!isEmptyArgument(afterAction))
            executeAction({
              actionConfiguration: afterAction,
              argumentsEvaluationContext
            });
        }
      );
    };

    if (isEmptyArgument(beforeAction)) {
      successFunc(null);
      return;
    }

    executeAction({
      actionConfiguration: beforeAction,
      argumentsEvaluationContext,
      success: successFunc,
    });
  };

  const next = () => {
    if (current < tabs.length - 1)
      executeActionIfConfigured(
        (tab) => tab.beforeNextActionConfiguration,
        (tab) => tab.afterNextActionConfiguration,
        () => successCallback('next'),
      );
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

  const done = () =>
    executeActionIfConfigured(
      (tab) => tab.beforeDoneActionConfiguration,
      (tab) => tab.afterDoneActionConfiguration
    );


  const content = getStepDescritpion(showStepStatus, sequence, current);

  /* Data Context section */

  useEffect(() => {
    dataContext.setData({ current, visibleSteps });
  }, [current, visibleSteps]);

  dataContext.updateApi({ back, cancel, done, content, next }); // update context api to use relevant State

  /* Data Context section */

  return { back, components, current, currentStep, cancel, done, content, next, visibleSteps };
};
