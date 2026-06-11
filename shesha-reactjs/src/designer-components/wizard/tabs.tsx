import classNames from 'classnames';
import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import ConditionalWrap from '@/components/conditionalWrapper';
import ParentProvider from '@/providers/parentProvider/index';
import React, { FC, useEffect, useMemo } from 'react';
import { ShaIcon } from '@/components/shaIcon';
import { Button, Space, Steps } from 'antd';
import { isValidGuid } from '@/components/formDesigner/components/utils';
import { getWizardButtonStyle } from './utils';
import { IStepProps, IWizardComponentProps } from './models';
import { useStyles } from './styles';
import { useWizard } from './hooks';
import DataContextBinder from '@/providers/dataContextProvider/dataContextBinder';
import { wizardApiCode } from '@/publicJsApis';
import { useFormComponentStyles } from '@/hooks/formComponentHooks';
import { getOverflowStyle } from '../_settings/utils/overflow/util';
import { addPx } from '@/utils/style';
import { DataTypes } from '@/interfaces/dataTypes';
import { IObjectMetadata } from '@/interfaces/metadata';
import ValidationErrors from '@/components/validationErrors';
import { getStyle } from '@/providers/form/utils';
import { useDataContextManager } from '@/providers/dataContextManager/hooks';
import { useShaFormInstance } from '@/providers/form/providers/shaFormProvider';

export const Tabs: FC<IWizardComponentProps> = ({ form, ...model }) => {
  const contextMetadata = useMemo<Promise<IObjectMetadata>>(() => Promise.resolve({
    typeDefinitionLoader: () => Promise.resolve({ typeName: 'IWizardApi', files: [{ content: wizardApiCode, fileName: 'apis/wizard.ts' }] }),
    properties: [
      { path: 'current', dataType: DataTypes.number },
      { path: 'currentStep', dataType: DataTypes.object },
      { path: 'visibleSteps', dataType: DataTypes.array },
    ],
    dataType: DataTypes.object,
  } as IObjectMetadata), []);

  const { formMode } = useShaFormInstance();
  const onChangeContextData = useDataContextManager().onChangeContextData;

  const { components, current, currentStep, visibleSteps, back, cancel, close, content, done, executeBooleanExpression, next, reset, setStep } = useWizard(model);
  useEffect(() => onChangeContextData(), [onChangeContextData, current]);

  const contextData = useMemo(
    () => ({ current, currentStep, visibleSteps }),
    [current, currentStep, visibleSteps],
  );

  const {
    buttonsLayout = 'spaceBetween',
    direction,
    isDynamic,
    labelPlacement,
    wizardType = 'default',
    stepWidth,
  } = model;

  // Get or create footer container id for current step
  const currentStepFooterId = useMemo(() => {
    if (!currentStep) return undefined;

    // Use existing footer id if available
    if (currentStep.stepFooter?.id) {
      return currentStep.stepFooter.id;
    }

    // Fallback: generate footer id from step id if hasCustomFooter is true but stepFooter is missing
    if (currentStep.hasCustomFooter) {
      return `${currentStep.id}_footer`;
    }

    return undefined;
  }, [currentStep]);

  const { primaryTextColor, secondaryTextColor, primaryBgColor, secondaryBgColor } = model;
  const colors = { primaryBgColor, secondaryBgColor, primaryTextColor, secondaryTextColor };
  const activeStepStyle = useFormComponentStyles(visibleSteps[current] ?? {});
  const overflow = getOverflowStyle(true, false);
  const { styles } = useStyles({
    styles: { ...model.allStyles?.fullStyle, overflow: '' },
    colors,
    activeStepStyle: activeStepStyle.fullStyle,
    stepWidth: addPx(stepWidth),
    overflow,
  });

  const steps = visibleSteps.map<IStepProps>(({ id, title, subTitle, description, icon, customEnabled, status, style }, index) => {
    const isDisabledByCondition = !executeBooleanExpression(customEnabled, true) && formMode !== 'designer';
    const iconProps = icon ? { icon: <ShaIcon iconName={icon} /> } : {};

    const stepStyle = getStyle(style, visibleSteps[index]);

    const result: IStepProps = {
      title,
      subTitle,
      content: content(description, index),
      disabled: isDisabledByCondition,
      status: isDisabledByCondition ? "wait" : status ?? "wait",
      ...iconProps,
      style: stepStyle,
    };
    if (current === index)
      result.bodyContent = (
        <ParentProvider
          name="WizardStep"
          model={{ ...model, readOnly: isDisabledByCondition }}
        >
          <ComponentsContainer wrapperStyle={{ height: '100%', display: 'grid', ...getOverflowStyle(model.overflow ?? true, model.hideScrollBar ?? false) }} containerId={id} dynamicComponents={isDynamic ? components : []} />
        </ParentProvider>
      );
    return result;
  });

  const splitButtons = buttonsLayout === 'spaceBetween';

  if (model.background?.type === 'storedFile' && model.background.storedFile?.id && !isValidGuid(model.background.storedFile.id))
    return <ValidationErrors error="The provided StoredFileId is invalid" />;

  if (model.hidden) return null;
  const btnStyle = getWizardButtonStyle(buttonsLayout);

  return (
    <DataContextBinder
      id={'ctx_' + model.id}
      name={model.componentName ?? model.id}
      description={`Wizard context for ${model.componentName}`}
      type="control"
      metadata={contextMetadata}
      data={contextData}
      api={{ back, cancel, close, content, done, next, reset, setStep }}
    >
      <ParentProvider
        name="Wizard"
        model={model}
      >
        <div className={styles.shaWizard}>
          <div className={classNames(styles.shaWizardContainer, { vertical: direction === 'vertical' })}>
            <Steps
              type={wizardType}
              current={current}
              items={steps.map(({ bodyContent: _, ...step }) => ({ ...step, style: {} }))}
              {...(direction ? { orientation: direction } : {})}
              {...(labelPlacement ? { titlePlacement: labelPlacement } : {})}
              {...(model.size && model.size !== 'large' ? { size: model.size } : {})}
            />
            <div className={styles.shaStepsContent}>{steps[current]?.bodyContent}</div>
          </div>
          {currentStep?.hasCustomFooter && currentStepFooterId ? (
            <div className={styles.shaStepsContent}>
              <ComponentsContainer
                wrapperStyle={{ height: '100%' }}
                containerId={currentStepFooterId}
              />
            </div>
          ) : (
            <ConditionalWrap condition={buttonsLayout === 'left'} wrap={(children) => <Space>{children}</Space>}>
              <div
                className={classNames(styles.shaStepsButtonsContainer, {
                  split: splitButtons,
                  left: buttonsLayout === 'left',
                  right: buttonsLayout === 'right',
                })}
              >
                <ConditionalWrap
                  condition={splitButtons}
                  wrap={(children) => <Space><div className={styles.shaStepsButtons}>{children}</div></Space>}
                >
                  {currentStep && current > 0 && (currentStep.showBackButton ?? true) && (
                    <Button
                      style={btnStyle('back')}
                      onClick={back}
                      type="default"
                      disabled={!executeBooleanExpression(currentStep.backButtonCustomEnabled, true)}
                    >
                      {currentStep.backButtonText ? currentStep.backButtonText : 'Back'}
                    </Button>
                  )}
                  {currentStep && currentStep.allowCancel === true && (
                    <Button
                      style={btnStyle('cancel')}
                      onClick={cancel}
                      disabled={!executeBooleanExpression(currentStep.cancelButtonCustomEnabled, true)}
                    >
                      {currentStep.cancelButtonText ? currentStep.cancelButtonText : 'Cancel'}
                    </Button>
                  )}
                </ConditionalWrap>
                <ConditionalWrap
                  condition={splitButtons}
                  wrap={(children) => <Space><div className={styles.shaStepsButtons}>{children}</div></Space>}
                >
                  {currentStep && current < visibleSteps.length - 1 && (
                    <Button
                      type="primary"
                      style={btnStyle('next')}
                      onClick={next}
                      disabled={!executeBooleanExpression(currentStep.nextButtonCustomEnabled, true)}
                    >
                      {currentStep.nextButtonText ? currentStep.nextButtonText : 'Next'}
                    </Button>
                  )}
                  {currentStep && current === visibleSteps.length - 1 && (currentStep.showDoneButton ?? true) && (
                    <Button
                      type="primary"
                      style={btnStyle('next')}
                      onClick={done}
                      disabled={!executeBooleanExpression(currentStep.doneButtonCustomEnabled, true)}
                    >
                      {currentStep.doneButtonText ? currentStep.doneButtonText : 'Done'}
                    </Button>
                  )}
                </ConditionalWrap>
              </div>
            </ConditionalWrap>
          )}
        </div>
      </ParentProvider>
    </DataContextBinder>
  );
};
