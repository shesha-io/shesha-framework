import React, { useMemo } from 'react';
import { FC } from 'react';
import { IDynamicActionsConfiguratorComponentProps } from './interfaces';
import { IDynamicActionsConfiguration } from './models';
import { ProviderSelector } from './providerSelector';
import { Form } from 'antd';
import { useDynamicActionsDispatcher, useForm } from '@/providers';
import { ProviderSettingsEditor } from './providerSettingsEditor';

export interface IDynamicActionsConfiguratorProps {
    value?: IDynamicActionsConfiguration;
    onChange?: (newValue: IDynamicActionsConfiguration) => void;
    editorConfig: IDynamicActionsConfiguratorComponentProps;
    readOnly?: boolean;
}

export const DynamicActionsConfigurator: FC<IDynamicActionsConfiguratorProps> = ({ value, onChange, readOnly }) => {
    const [form] = Form.useForm();
    const { formSettings } = useForm();

    const { getProvider } = useDynamicActionsDispatcher();

    const onValuesChange = (_value, values: IDynamicActionsConfiguration) => {
        if (onChange) {
            onChange(values);
        }
    };

    const providerUid = Form.useWatch('providerUid', form);
    const selectedProvider = useMemo(() => {
        return providerUid
            ? getProvider(providerUid)
            : null;
    }, [providerUid, getProvider]);

    return (
        <Form<IDynamicActionsConfiguration>
            component={false}
            form={form}
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            colon={formSettings.colon}
            onValuesChange={onValuesChange}
            initialValues={value}
        >
            <Form.Item name="providerUid" label="">
                <ProviderSelector readOnly={readOnly} />
            </Form.Item>
            {selectedProvider && selectedProvider.hasArguments && (
                <Form.Item name="settings" label={null}>
                    <ProviderSettingsEditor
                        provider={selectedProvider}
                        readOnly={readOnly}
                    />
                </Form.Item>
            )}
        </Form>
    );
};