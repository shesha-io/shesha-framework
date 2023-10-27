import React, { createContext, PropsWithChildren, useContext, useState } from 'react';
import { Form } from "antd";
import { DEFAULT_FORM_LAYOUT_SETTINGS, ISettingsFormFactoryArgs } from "interfaces";

interface SettingsFormState<TModel> {
    model?: TModel;
}

interface ISettingsFormActions<TModel> {
    getFieldsValue: () => TModel;
    propertyFilter: (name: string) => boolean;
    onValuesChange?: (changedValues: any) => void;
}

/** initial state */
export const DATA_SOURCES_PROVIDER_CONTEXT_INITIAL_STATE: SettingsFormState<any> = {
};

export const SettingsFormStateContext = createContext<SettingsFormState<any>>(DATA_SOURCES_PROVIDER_CONTEXT_INITIAL_STATE);

export const SettingsFormActionsContext = createContext<ISettingsFormActions<any>>(undefined);

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
    const [state, setState] = useState<SettingsFormState<TModel>>({model});
  
    if (formRef)
        formRef.current = {
            submit: () => form.submit(),
            reset: () => form.resetFields(),
        };

    const getFieldsValue = () => (state.model);

    const valuesChange = (changedValues) => {
        const incomingState = { ...state.model, ...changedValues };
        setState({model: incomingState});
        onValuesChange(changedValues, incomingState);
        form.setFieldsValue(incomingState);
    };

    const SettingsFormActions = {
        getFieldsValue,
        propertyFilter,
        onValuesChange: valuesChange
    };

    return (
        <SettingsFormStateContext.Provider value={state}>
            <SettingsFormActionsContext.Provider value={SettingsFormActions}>
                <Form
                    form={form}
                    onFinish={onSave}
                    {...layoutSettings}
                    onValuesChange={valuesChange}
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