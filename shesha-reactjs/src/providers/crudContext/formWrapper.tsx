import { Form, FormInstance, FormProps } from 'antd';
import React, { FC, MutableRefObject, PropsWithChildren } from 'react';
import { useForm } from '@/providers';
import { IFormSettings } from '@/providers/form/models';
import { useDeferredUpdate } from '../deferredUpdateProvider/index';
import { IDeferredUpdateGroup } from '../deferredUpdateProvider/models';

interface FormWrapperProps {
    initialValues: object;
    onValuesChange: FormProps['onValuesChange'];
    form: FormInstance;
    formSettings?: IFormSettings;
    deferredUpdate?: MutableRefObject<IDeferredUpdateGroup[]>;
}

export const FormWrapper: FC<PropsWithChildren<FormWrapperProps>> = ({ initialValues, onValuesChange, form, formSettings, deferredUpdate, children }) => {
    const { setFormData } = useForm();
    const { getPayload: getDeferredUpdate } = useDeferredUpdate(false) ?? {};

    if (deferredUpdate)
        deferredUpdate.current = getDeferredUpdate();

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
