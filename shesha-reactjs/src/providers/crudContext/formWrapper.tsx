import { Form, FormInstance, FormProps } from 'antd';
import React, { FC, PropsWithChildren } from 'react';
import { useForm } from '@/providers';
import { IFormSettings } from '@/providers/form/models';

interface FormWrapperProps {
    initialValues: object;
    onValuesChange: FormProps['onValuesChange'];
    form: FormInstance;
    formSettings?: IFormSettings;
}

export const FormWrapper: FC<PropsWithChildren<FormWrapperProps>> = ({ initialValues, onValuesChange, form, formSettings, children }) => {
    const { updateStateFormData: setFormData } = useForm();

    const onValuesChangeInternal = (changedValues: any, values: any) => {
        // recalculate components visibility
        setFormData({ values, mergeValues: true });

        if (onValuesChange) onValuesChange(changedValues, values);
    };

    return (
        <Form
            component={false}
            form={form}
            initialValues={initialValues}
            onValuesChange={onValuesChangeInternal}
            {...formSettings}
        >
            {children}
        </Form>
    );
};
