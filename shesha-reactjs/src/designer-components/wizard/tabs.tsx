import classNames from 'classnames';
import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import ConditionalWrap from '@/components/conditionalWrapper';
import ParentProvider from '@/providers/parentProvider/index';
import React, { FC, useMemo } from 'react';
import ShaIcon from '@/components/shaIcon';
import { Button, Space, Steps } from 'antd';
import { getLayoutStyle } from '@/providers/form/utils';
import { getWizardButtonStyle } from './utils';
import { IStepProps, IWizardComponentProps } from './models';
import { useForm, useFormData, useGlobalState } from '@/providers';
import { useFormExpression } from '@/hooks/index';
import { useStyles } from './styles';
import { useWizard } from './hooks';

export const Tabs: FC<Omit<IWizardComponentProps, 'size'>> = ({ form, ...model }) => {
    const { styles } = useStyles();
    const { formMode } = useForm();
    const { executeBooleanExpression } = useFormExpression();
    const { data } = useFormData();
    const { globalState } = useGlobalState();

    const { back, components, cancel, content, current, currentStep, done, next, visibleSteps } = useWizard(model);

    const {
        buttonsLayout = 'spaceBetween',
        direction,
        isDynamic,
        labelPlacement,
        wizardType = 'default',
        showBackButton = true,
        showDoneButton = true,
        stepFooters = [],
    } = model;

    // Get or create footer container for current step
    const currentStepFooter = useMemo(() => {
        if (!currentStep) return undefined;

        // Try to find existing footer
        let footer = stepFooters.find(f => f.stepId === currentStep.id);

        // If customActions is enabled but no footer exists, create a temporary one
        if (!footer && currentStep.customActions) {
            footer = {
                id: currentStep.id + '_footer',
                stepId: currentStep.id,
                components: []
            };
        }

        return footer;
    }, [stepFooters, currentStep]);

    const steps = useMemo(() => {
        return visibleSteps?.map<IStepProps>(({ id, title, subTitle, description, icon, customEnabled, status }, index) => {
            const isDisabledByCondition = !executeBooleanExpression(customEnabled, true) && formMode !== 'designer';
            const iconProps = icon ? { icon: <ShaIcon iconName={icon as any} /> } : {};

            return {
                id,
                title,
                subTitle,
                description: content(description, index),
                disabled: isDisabledByCondition,
                status: isDisabledByCondition ? 'wait' : status,
                ...iconProps,
                // render only current step
                content: current === index
                    ? (
                        <ParentProvider model={{ ...model, readOnly: isDisabledByCondition }}>
                            <ComponentsContainer containerId={id} dynamicComponents={isDynamic ? components : []} />
                        </ParentProvider>
                    )
                    : undefined,
            };
        });
    }, [visibleSteps, current]);

    console.log("Current step :: ", currentStep, "Steps: : ", steps);
    const splitButtons = buttonsLayout === 'spaceBetween';

    if (model?.hidden) return null;
    const btnStyle = getWizardButtonStyle(buttonsLayout);

    return (
        <ParentProvider model={model}>
            <div className={styles.shaWizard} style={getLayoutStyle(model, { data, globalState })}>
                <div className={classNames(styles.shaWizardContainer, { vertical: direction === 'vertical' })}>
                    <Steps
                        type={wizardType}
                        current={current}
                        items={steps}
                        size={model['size']}
                        direction={direction}
                        labelPlacement={labelPlacement}
                    />
                    <div className={styles.shaStepsContent}>{steps[current]?.content}</div>
                </div>

                {currentStep?.customActions && currentStepFooter ? (
                    <div className={styles.shaStepsButtonsContainer}>
                        <ComponentsContainer
                            containerId={currentStepFooter.id}
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
                            wrap={(children) => (
                                <Space>
                                    <div className={styles.shaStepsButtons}>{children}</div>
                                </Space>
                            )}
                        >
                            {current > 0 && (currentStep?.showBackButton ?? showBackButton) && (
                                <Button
                                    style={btnStyle('back')}
                                    onClick={back}
                                    disabled={!executeBooleanExpression(currentStep?.backButtonCustomEnabled, true)}
                                >
                                    {currentStep.backButtonText ? currentStep.backButtonText : 'Back'}
                                </Button>
                            )}

                            {currentStep?.allowCancel === true && (
                                <Button
                                    style={btnStyle('cancel')}
                                    onClick={cancel}
                                    disabled={!executeBooleanExpression(currentStep?.cancelButtonCustomEnabled, true)}
                                >
                                    {currentStep.cancelButtonText ? currentStep.cancelButtonText : 'Cancel'}
                                </Button>
                            )}
                        </ConditionalWrap>

                        <ConditionalWrap
                            condition={splitButtons}
                            wrap={(children) => (
                                <Space>
                                    <div className={styles.shaStepsButtons}>{children}</div>
                                </Space>
                            )}
                        >
                            {current < visibleSteps.length - 1 && (
                                <Button
                                    type="primary"
                                    style={btnStyle('next')}
                                    onClick={next}
                                    disabled={!executeBooleanExpression(currentStep?.nextButtonCustomEnabled, true)}
                                >
                                    {currentStep.nextButtonText ? currentStep.nextButtonText : 'Next'}
                                </Button>
                            )}

                            {current === visibleSteps.length - 1 && (currentStep?.showDoneButton ?? showDoneButton) && (
                                <Button
                                    type="primary"
                                    style={btnStyle('next')}
                                    onClick={done}
                                    disabled={!executeBooleanExpression(currentStep?.doneButtonCustomEnabled, true)}
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
    );
};