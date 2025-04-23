import classNames from 'classnames';
import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import ConditionalWrap from '@/components/conditionalWrapper';
import ParentProvider from '@/providers/parentProvider/index';
import React, { CSSProperties, FC, useEffect, useMemo, useState } from 'react';
import ShaIcon from '@/components/shaIcon';
import { Button, Space, Steps } from 'antd';
import { getStyle, pickStyleFromModel, ValidationErrors } from '@/index';
import { getDimensionsStyle } from '../_settings/utils/dimensions/utils';
import { getBorderStyle } from '../_settings/utils/border/utils';
import { getFontStyle } from '../_settings/utils/font/utils';
import { getShadowStyle } from '../_settings/utils/shadow/utils';
import { getBackgroundStyle } from '../_settings/utils/background/utils';
import { removeUndefinedProps } from '@/utils/object';
import { isValidGuid } from '@/components/formDesigner/components/utils';
import { getWizardButtonStyle } from './utils';
import { IStepProps, IWizardComponentProps } from './models';
import { useSheshaApplication, useForm, useFormData } from '@/providers';
import { useFormExpression } from '@/hooks/index';
import { useStyles } from './styles';
import { useWizard } from './hooks';

export const Tabs: FC<Omit<IWizardComponentProps, 'size'>> = ({ form, ...model }) => {
    const { formMode } = useForm();
    const { executeBooleanExpression } = useFormExpression();
    const { data } = useFormData();

    const { back, components, cancel, content, current, currentStep, done, next, visibleSteps } = useWizard(model);
    const {
        buttonsLayout = 'spaceBetween',
        direction,
        isDynamic,
        labelPlacement,
        wizardType = 'default',
    } = model;

    const { backendUrl, httpHeaders } = useSheshaApplication();

    const dimensions = model?.dimensions;
    const border = model?.border;
    const font = model?.font;
    const shadow = model?.shadow;
    const background = model?.background;
    const jsStyle = getStyle(model.style, data);

    const dimensionsStyles = useMemo(() => getDimensionsStyle(dimensions), [dimensions]);
    const borderStyles = useMemo(() => getBorderStyle(border, jsStyle), [border]);
    const fontStyles = useMemo(() => getFontStyle(font), [font]);
    const [backgroundStyles, setBackgroundStyles] = useState({});
    const shadowStyles = useMemo(() => getShadowStyle(shadow), [shadow]);

    useEffect(() => {

        const fetchStyles = async () => {
            const storedImageUrl = background?.storedFile?.id && background?.type === 'storedFile'
                ? await fetch(`${backendUrl}/api/StoredFile/Download?id=${background?.storedFile?.id}`,
                    { headers: { ...httpHeaders, "Content-Type": "application/octet-stream" } })
                    .then((response) => {
                        return response.blob();
                    })
                    .then((blob) => {
                        return URL.createObjectURL(blob);
                    }) : '';

            const style = await getBackgroundStyle(background, jsStyle, storedImageUrl);
            setBackgroundStyles(style);
        };

        fetchStyles();
    }, [background, background?.gradient?.colors, backendUrl, httpHeaders]);

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



    const styling = JSON.parse(model.stylingBox || '{}');
    const stylingBoxAsCSS = pickStyleFromModel(styling);

    const additionalStyles: CSSProperties = removeUndefinedProps({
        ...stylingBoxAsCSS,
        ...dimensionsStyles,
        ...borderStyles,
        ...fontStyles,
        ...backgroundStyles,
        ...shadowStyles,
        ...jsStyle
    });
    const { primaryTextColor, secondaryTextColor, primaryBgColor, secondaryBgColor } = model;

    const colors = { primaryBgColor, secondaryBgColor, primaryTextColor, secondaryTextColor };

    const { styles } = useStyles({ styles: additionalStyles, colors });

    const splitButtons = buttonsLayout === 'spaceBetween';

    if (model?.background?.type === 'storedFile' && model?.background.storedFile?.id && !isValidGuid(model?.background.storedFile.id)) {
        return <ValidationErrors error="The provided StoredFileId is invalid" />;
    }

    if (model?.hidden) return null;
    const btnStyle = getWizardButtonStyle(buttonsLayout);

    return (
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
                            wrap={(children) => (
                                <Space>
                                    <div className={styles.shaStepsButtons}>{children}</div>
                                </Space>
                            )}
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
    );
};