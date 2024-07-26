import React, { PropsWithChildren, useContext, useState } from 'react';
import { Form } from "antd";
import { DEFAULT_FORM_LAYOUT_SETTINGS, ISettingsFormFactoryArgs } from "@/interfaces";
import { getValuesFromSettings, updateSettingsFromVlues } from './utils';
import { createNamedContext } from '@/utils/react';
import { merge } from 'lodash';

interface SettingsFormState<TModel> {
    model?: TModel;
    values?: TModel;
}

interface ISettingsFormActions {
    propertyFilter: (name: string) => boolean;
    onValuesChange?: (changedValues: any) => void;
}

/** initial state */
export const DATA_SOURCES_PROVIDER_CONTEXT_INITIAL_STATE: SettingsFormState<any> = {
};

export const SettingsFormStateContext = createNamedContext<SettingsFormState<any>>(DATA_SOURCES_PROVIDER_CONTEXT_INITIAL_STATE, "SettingsFormStateContext");

export const SettingsFormActionsContext = createNamedContext<ISettingsFormActions>(undefined, "SettingsFormActionsContext");

export interface SettingsFormProps<TModel> extends ISettingsFormFactoryArgs<TModel> {
}

const SettingsForm = <TModel,>(props: PropsWithChildren<SettingsFormProps<TModel>>) => {

    const {
        onSave,
        model,
        onValuesChange,
        propertyFilter,
        formRef,
        layoutSettings = DEFAULT_FORM_LAYOUT_SETTINGS
    } = props;

    const [form] = Form.useForm();
    const [state, setState] = useState<SettingsFormState<TModel>>({ model, values: getValuesFromSettings(model) });

    if (formRef)
        formRef.current = {
            submit: () => form.submit(),
            reset: () => form.resetFields(),
        };

    const valuesChange = (changedValues) => {
        const incomingState = updateSettingsFromVlues(state.model, changedValues);
        setState({ model: incomingState, values: getValuesFromSettings(incomingState) });
        onValuesChange(changedValues, incomingState);
        form.setFieldsValue(incomingState);
    };

    const settingsChange = (changedValues) => {
      const incomingState = merge({...state.model}, changedValues);
      setState({model: incomingState, values: getValuesFromSettings(incomingState)});
      onValuesChange(changedValues, incomingState);
      form.setFieldsValue(incomingState);
    };

    const onSaveInternal = () => {
        onSave(state.model);
    };

    const SettingsFormActions: ISettingsFormActions = {
        propertyFilter,
        onValuesChange: valuesChange,
    };

    return (
        <SettingsFormStateContext.Provider value={state}>
            <SettingsFormActionsContext.Provider value={SettingsFormActions}>
                <Form
                    form={form}
                    onFinish={onSaveInternal}
                    {...layoutSettings}
                    onValuesChange={settingsChange}
                    initialValues={model}
                >
                    {props.children}
                </Form>
            </SettingsFormActionsContext.Provider>
        </SettingsFormStateContext.Provider>
    );
};

export function useSettingsForm<TModel>(require: boolean = true) {
    const actionsContext = useContext(SettingsFormActionsContext);
    const stateContext = useContext<SettingsFormState<TModel>>(SettingsFormStateContext);

    if ((actionsContext === undefined || stateContext === undefined) && require) {
        throw new Error('useSettingsForm must be used within a SettingsForm');
    }
    return actionsContext !== undefined && stateContext !== undefined
        ? { ...actionsContext, ...stateContext }
        : undefined;
}

export default SettingsForm;