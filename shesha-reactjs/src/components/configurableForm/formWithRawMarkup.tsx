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
    //const [shaForm] = useShaForm({ form: props.shaForm });
    const [form] = Form.useForm(props.form);
    const [shaForm] = useShaForm({
        form: undefined,
        //antdForm: form,
        init: (shaForm) => {
            console.log('LOG: init form FormWithRawMarkup', { markup, cacheKey });

            shaForm.initByRawMarkup({
                rawMarkup: markup,
                cacheKey: cacheKey,
                formArguments: undefined,
                initialValues: restProps.initialValues,
            });
        }
    });
    /*
    const [shaForm] = useShaForm({
        form: undefined,
        antdForm: form,
        init: (shaForm) => {
          console.log('LOG: init form', { formSettings, formFlatMarkup });
    
          shaForm.initByMarkup({
            formSettings,
            formFlatMarkup,
            formArguments: undefined,
          });
        }
      });
    */
    const { markupLoadingState/*, dataLoadingState*/ } = shaForm;

    //const MarkupErrorRender = markupLoadingError ?? MarkupLoadingError;
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
        //         <FormWithFlatMarkupMemo
        //     shaForm={shaForm}
        //     {...restProps}
        //     formFlatMarkup={form.flatStructure}
        //     formSettings={form.settings}
        //     onMarkupUpdated={props.onMarkupUpdated}
        // />
            )}
        </>
    );
/*
    const { components, formSettings } = getComponentsAndSettings(markup);
    const { state, form } = useFormByMarkup({ markup: components, key: cacheKey, formSettings, isSettingsForm });

    return state === 'ready'
        ? (
            <FormWithFlatMarkupMemo
                shaForm={shaForm}
                {...restProps}
                formFlatMarkup={form.flatStructure}
                formSettings={form.settings}
                onMarkupUpdated={props.onMarkupUpdated}
            />
        )
        : state === 'loading'
            ? (
                <Skeleton loading={true} />
            )
            : state === 'error'
                ? <Alert message={state} type="error" />
                : null;
                */
};