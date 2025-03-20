import React, { FC } from 'react';
import { IConfigurableFormRuntimeProps, SheshaFormProps } from './models';
import { FormMarkup } from '@/interfaces';
import { FormWithFlatMarkupMemo } from './formWithFlatMarkup';
import { Form } from 'antd';
import { useShaForm } from '@/providers/form/store/shaFormInstance';

export type IFormWithRawMarkupProps = IConfigurableFormRuntimeProps & {
    markup: FormMarkup;
    cacheKey?: string;
    onMarkupUpdated?: () => void;
    isSettingsForm?: boolean;
} & SheshaFormProps;

export const FormWithRawMarkup: FC<IFormWithRawMarkupProps> = (props) => {
    const { markup, cacheKey, isSettingsForm, ...restProps } = props;
    const [form] = Form.useForm(props.form);
    const [shaForm] = useShaForm({
        form: undefined,
        init: (shaForm) => {
            shaForm.initByRawMarkup({
                rawMarkup: markup,
                cacheKey: cacheKey,
                formArguments: undefined,
                initialValues: restProps.initialValues,
            });
        }
    });
    
    const { markupLoadingState } = shaForm;

    return (
        <>
            {markupLoadingState.status === 'ready' && (
                <FormWithFlatMarkupMemo
                    {...restProps}
                    form={form}
                    initialValues={shaForm.initialValues}
                    formFlatMarkup={shaForm.flatStructure}
                    formSettings={shaForm.settings}
                    persistedFormProps={shaForm.form}
                    onMarkupUpdated={() => {
                        shaForm.reloadMarkup();
                    }}
                    shaForm={shaForm}
                />
            )}
        </>
    );
};