import { getActualModel, useAvailableConstantsData } from '@/providers/form/utils';
import { getStepDescritpion, getWizardStep } from './utils';
import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { IConfigurableFormComponent, useForm, useSheshaApplication } from '@/providers';
import { IWizardComponentProps, IWizardStepProps } from './models';
import { useConfigurableAction } from '@/providers/configurableActionsDispatcher';
import { useDataContext } from '@/providers/dataContextProvider/contexts';
import { useEffect, useMemo, useState } from 'react';
import { useFormExpression } from '@/hooks';
import { useDeepCompareEffect } from '@/hooks/useDeepCompareEffect';

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

  const formMode = useForm(false).formMode;

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
      tabs
        .filter(({ customVisibility, permissions }) => {
          const granted = anyOfPermissionsGranted(permissions || []);
          const isVisibleByCondition = executeBooleanExpression(customVisibility, true);

          return !((!granted || !isVisibleByCondition) && allData.formMode !== 'designer');
        })
        .map(item => getActualModel(item, allData) as IWizardStepProps),
    [tabs, allData.data, allData.globalState, allData.contexts.lastUpdate]
  );

  const currentStep = visibleSteps[current];

  useEffect(() => {
    setCurrent(getDefaultStepIndex(defaultActiveStep));
  }, [defaultActiveStep]);

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

  const setStep = (stepIndex) => {
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
