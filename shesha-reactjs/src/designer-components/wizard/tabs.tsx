import classNames from 'classnames';
import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import ConditionalWrap from '@/components/conditionalWrapper';
import ParentProvider from '@/providers/parentProvider/index';
import React, { FC, useEffect, useMemo } from 'react';
import ShaIcon from '@/components/shaIcon';
import { Button, Space, Steps } from 'antd';
import { DataTypes, IObjectMetadata, ValidationErrors, useDataContextManager, useShaFormInstance } from '@/index';
import { isValidGuid } from '@/components/formDesigner/components/utils';
import { getWizardButtonStyle } from './utils';
import { IStepProps, IWizardComponentProps } from './models';
import { useFormExpression } from '@/hooks/index';
import { useStyles } from './styles';
import { useWizard } from './hooks';
import DataContextBinder from '@/providers/dataContextProvider/dataContextBinder';
import { wizardApiCode } from '@/publicJsApis';

export const Tabs: FC<Omit<IWizardComponentProps, 'size'>> = ({ form, ...model }) => {
    const contextMetadata = useMemo<Promise<IObjectMetadata>>(() => Promise.resolve({
        typeDefinitionLoader: () => Promise.resolve({ typeName: 'IWizardApi', files: [{ content: wizardApiCode, fileName: 'apis/wizard.ts' }] }),
        properties: [{ path: 'current', dataType: DataTypes.number }],
        dataType: DataTypes.object
    } as IObjectMetadata), []);

    const { formMode } = useShaFormInstance();
    const { executeBooleanExpression } = useFormExpression();
    const onChangeContextData = useDataContextManager()?.onChangeContextData;

    const { components, current, currentStep, visibleSteps, back, cancel, content, done, next, setStep } = useWizard(model);
    useEffect(() => onChangeContextData(), [current]);

    const {
        buttonsLayout = 'spaceBetween',
        direction,
        isDynamic,
        labelPlacement,
        wizardType = 'default',
    } = model;

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
                    ? <ParentProvider model={{ ...model, readOnly: isDisabledByCondition }}>
                        <ComponentsContainer containerId={id} dynamicComponents={isDynamic ? components : []} />
                    </ParentProvider>
                    : undefined,
            };
        });
    }, [visibleSteps, current]);

    const { primaryTextColor, secondaryTextColor, primaryBgColor, secondaryBgColor } = model;
    const colors = { primaryBgColor, secondaryBgColor, primaryTextColor, secondaryTextColor };
    const { styles } = useStyles({ styles: model.allStyles.fullStyle, colors });

    const splitButtons = buttonsLayout === 'spaceBetween';

    if (model.background?.type === 'storedFile' && model.background.storedFile?.id && !isValidGuid(model.background.storedFile.id))
        return <ValidationErrors error="The provided StoredFileId is invalid" />;

    if (model.hidden) return null;
    const btnStyle = getWizardButtonStyle(buttonsLayout);

    return (
        <DataContextBinder
            id={'ctx_' + model.id}
            name={model.componentName}
            description={`Wizard context for ${model.componentName}`}
            type="control"
            metadata={contextMetadata}
            data={{ current, currentStep, visibleSteps }}
            api={{ back, cancel, content, done, next, setStep }}     
        >
            <ParentProvider model={model}>
                <div className={styles.shaWizard}>
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
                                {current > 0 && (
                                    <Button
                                        style={btnStyle('back')}
                                        onClick={back}
                                        type='default'
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
                                wrap={(children) => <Space><div className={styles.shaStepsButtons}>{children}</div></Space>}
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

                                {current === visibleSteps.length - 1 && (
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
                </div>
            </ParentProvider>
        </DataContextBinder>
    );
};