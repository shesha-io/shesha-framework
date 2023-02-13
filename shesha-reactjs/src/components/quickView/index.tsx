import React, { FC, useEffect, useState } from 'react';
import { Popover, Button, Form, notification } from 'antd';
import { ConfigurableForm } from '../';
import { IFormSettings, useUi } from '../../providers';
import { useGet } from 'restful-react';
import ValidationErrors from '../validationErrors';
import { FormIdentifier } from '../../providers/form/models';
import { useFormConfiguration, UseFormConfigurationArgs } from '../../providers/form/api';
import { useConfigurationItemsLoader } from '../../providers/configurationItemsLoader';
import { useDeepCompareEffect } from 'react-use';

export interface IQuickViewProps {
    /**
     * The id or guid for the entity
     */
    entityId?: string;

    /**
     * Identifier of the form to display on the modal
     */
    formIdentifier?: FormIdentifier;

    /**
     * The Url that details of the entity are retreived
     */
    getEntityUrl?: string;

    /**
     * The property froom the data to use as the label and title for the popover
     */
    displayProperty: string;

    /**
     * The width of the quickview
     */
    width?: number;

    className?: string;
    formType?: string;
    displayName?: string;
}

export interface IGenericQuickViewProps {

}

export const GenericQuickView: FC<IQuickViewProps> = (props) => {

    const { getEntityFormId } = useConfigurationItemsLoader();
    const [ formConfig, setFormConfig ] = useState<UseFormConfigurationArgs>({ formId: null, lazy: true });
    const [ formSettings, setFormSettings ] = useState<IFormSettings>(null);

    const {
        refetch: fetchForm,
        //formConfiguration: fetchFormResponse,
        //loading: isFetchingForm,
        //error: fetchFormError,
    } = useFormConfiguration(formConfig);

    useDeepCompareEffect(() => {
        getEntityFormId(props.className, props.formType ?? 'Quickview', (formid) => {setFormConfig({formId: {name: formid.name, module: formid.module}, lazy: true});});
    }, [props.className, props.formType]);

    useDeepCompareEffect(() => {
        if (formConfig.formId)
            fetchForm().then(response => { setFormSettings(response.formSettings); });
    }, [formConfig.formId]);

    return (
        formSettings?.getUrl && formConfig?.formId 
        ? <QuickView getEntityUrl={formSettings.getUrl} formIdentifier={formConfig.formId} {...props} />
        : <Button type="link">{props.displayName ? props.displayName : "-"}</Button>
    );
}

const QuickView: FC<Omit<IQuickViewProps, 'children' | 'className' | 'formType'>> = ({
    entityId,
    formIdentifier,
    getEntityUrl,
    displayProperty,
    displayName,
    width = 450
}) => {
    const [formData, setFormData] = useState();
    const [formTitle, setFormTitle] = useState(displayName);

    const [form] = Form.useForm();
    const { formItemLayout } = useUi();
    const { refetch, loading, data, error: fetchEntityError } = useGet({
        path: getEntityUrl || '',
        queryParams: { id: entityId },
        lazy: true,
    });

    useEffect(() => {
        if (getEntityUrl && entityId) {
            refetch();
        }
    }, [entityId, getEntityUrl]);

    useEffect(() => {
        if (!loading && data) {
            setFormData(data.result);
            if (data.result[displayProperty])
                setFormTitle(data.result[displayProperty]);
        }
    }, [loading, data]);

    useEffect(() => {
        if (fetchEntityError) {
            notification.error({ message: <ValidationErrors error={fetchEntityError} renderMode="raw" /> });
        }
    }, [fetchEntityError]);

    const formContent = (
        <ConfigurableForm
            mode="readonly"
            {...formItemLayout}
            form={form}
            formId={formIdentifier}
            initialValues={formData} />
    );

    return (
        <Popover
            content={<div style={{ width }}>{formContent}</div>}
            title={formTitle ? formTitle : "Display Property Not Set in Forms Designer"}>
            <Button type="link">{formTitle ? formTitle : "Display Property Not Set in Forms Designer"}</Button>
        </Popover>
    );
};

export default QuickView;