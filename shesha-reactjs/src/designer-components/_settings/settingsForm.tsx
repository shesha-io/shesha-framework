import React, { PropsWithChildren, ReactElement, useContext, useState } from 'react';
import { Form, FormProps } from "antd";
import { DEFAULT_FORM_LAYOUT_SETTINGS, IComponentSettingsFormFactoryArgs, IPropertyMetadata } from "@/interfaces";
import { getValuesFromSettings, updateSettingsFromValues } from './utils/utils';
import { createNamedContext } from '@/utils/react';
import { linkComponentToModelMetadata } from '@/providers/form/utils';
import { ConfigurableFormActionsProvider } from '@/providers/form/actions';
import { deepMergeValues } from '@/utils/object';
import { FormAction, IConfigurableFormComponent, useShaFormInstance } from '@/providers';
import { RecursivePartial } from '@/interfaces/entity';

interface SettingsFormState<TModel extends object = object> {
  model: TModel;
  values?: TModel;
}

interface ISettingsFormActions<TModel extends object = object> {
  propertyFilter: (name: string) => boolean;
  onValuesChange?: ((changedValues: Partial<TModel>) => void) | undefined;
}

/** initial state */
export const DATA_SOURCES_PROVIDER_CONTEXT_INITIAL_STATE: SettingsFormState<object> = {
  model: {},
};

export const SettingsFormStateContext = createNamedContext<SettingsFormState<object> | undefined>(DATA_SOURCES_PROVIDER_CONTEXT_INITIAL_STATE, "SettingsFormStateContext");

export const SettingsFormActionsContext = createNamedContext<ISettingsFormActions<object> | undefined>(undefined, "SettingsFormActionsContext");

export type SettingsFormProps<TModel extends IConfigurableFormComponent = IConfigurableFormComponent> = IComponentSettingsFormFactoryArgs<TModel>;

const SettingsForm = <TModel extends IConfigurableFormComponent = IConfigurableFormComponent>(props: PropsWithChildren<SettingsFormProps<TModel>>): ReactElement => {
  const {
    onSave,
    model,
    onValuesChange,
    propertyFilter,
    formRef,
    layoutSettings = DEFAULT_FORM_LAYOUT_SETTINGS,
    toolboxComponent,
  } = props;

  const [form] = Form.useForm<TModel>();
  const shaForm = useShaFormInstance<TModel>();
  const [state, setState] = useState<SettingsFormState<TModel>>({ model, values: getValuesFromSettings(model) });

  if (formRef)
    formRef.current = {
      submit: () => form.submit(),
      reset: () => form.resetFields(),
    };

  const valuesChange: ISettingsFormActions<TModel>['onValuesChange'] = (changedValues) => {
    const model = shaForm.formData as TModel;
    const incomingState = updateSettingsFromValues(model, changedValues);
    setState({ model: incomingState, values: getValuesFromSettings(incomingState) });
    onValuesChange?.(changedValues, incomingState);
    form.setFieldsValue(incomingState as RecursivePartial<TModel>);
  };

  const settingsChange: FormProps<TModel>["onValuesChange"] = (changedValues): void => {
    const incomingState = deepMergeValues(state.model, changedValues);
    setState({ model: incomingState, values: getValuesFromSettings(incomingState) });
    onValuesChange?.(changedValues, incomingState);
    form.setFieldsValue(incomingState as RecursivePartial<TModel>);
  };

  const onSaveInternal = (): void => {
    onSave(state.model);
  };

  const SettingsFormActions: ISettingsFormActions<TModel> = {
    propertyFilter: propertyFilter ?? (() => true),
    onValuesChange: valuesChange,
  };

  const linkToModelMetadata = (metadata: IPropertyMetadata): void => {
    if (!toolboxComponent) {
      console.warn(`toolboxComponent is undefined, cannot link to model metadata`);
      return;
    }
    const currentModel = shaForm.formData;
    if (!currentModel)
      return;
    const newModel = linkComponentToModelMetadata(toolboxComponent, currentModel, metadata) as TModel;

    if (toolboxComponent.initModelFromMetadata) {
      toolboxComponent.initModelFromMetadata(currentModel, newModel, metadata)
        .then((r) => valuesChange(r as TModel))
        .catch((error) => {
          console.error('Failed to initialize model from metadata:', error);
          valuesChange(newModel);
        });
    } else {
      valuesChange(newModel);
    }
  };

  return (
    <ConfigurableFormActionsProvider actions={{ linkToModelMetadata: linkToModelMetadata as FormAction }}>
      <SettingsFormStateContext.Provider value={state}>
        <SettingsFormActionsContext.Provider value={SettingsFormActions}>
          <Form<TModel>
            form={form}
            onFinish={onSaveInternal}
            {...layoutSettings}
            onValuesChange={settingsChange}
            initialValues={model}
            size="small"
          >
            {props.children}
          </Form>
        </SettingsFormActionsContext.Provider>
      </SettingsFormStateContext.Provider>
    </ConfigurableFormActionsProvider>
  );
};

export function useSettingsForm<TModel extends object = object>(): SettingsFormState<TModel> & ISettingsFormActions {
  const actionsContext = useContext(SettingsFormActionsContext) as ISettingsFormActions<object> | undefined;
  const stateContext = useContext(SettingsFormStateContext) as SettingsFormState<TModel> | undefined;

  if (actionsContext === undefined || stateContext === undefined)
    throw new Error('useSettingsForm must be used within a SettingsForm');

  return { ...actionsContext, ...stateContext };
}

export default SettingsForm;
