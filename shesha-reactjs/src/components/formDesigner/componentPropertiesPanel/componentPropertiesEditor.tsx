import React, { ReactNode, RefObject } from 'react';
import { IComponentSettingsFormFactoryArgs, IFormLayoutSettings, ISettingsFormFactory, ISettingsFormInstance, IToolboxComponent, SettingsFormMarkupFactory } from '@/interfaces';
import { useDebouncedCallback } from 'use-debounce';
import { FormMarkup } from '@/providers/form/models';
import GenericSettingsForm from '../genericSettingsForm';
import { IConfigurableFormComponent } from '@/providers';
import { useFormDesigner } from '@/providers/formDesigner';
import { useFormBuilderFactory } from '@/form-factory/hooks';
import { FormBuilderFactory } from '@/form-factory/interfaces';
import DefaultModelProvider from '@/designer-components/_settings/defaultModelProvider/defaultModelProvider';
import { isDefined } from '@/utils/nullables';

export interface IComponentPropertiesEditorProps<TModel extends IConfigurableFormComponent = IConfigurableFormComponent> {
  toolboxComponent: IToolboxComponent<TModel>;
  componentModel: TModel;
  onSave: (settings: TModel) => Promise<void>;
  readOnly: boolean;
  autoSave: boolean;
  formRef?: RefObject<ISettingsFormInstance | null>;
  propertyFilter?: ((name: string) => boolean) | undefined;
  layoutSettings?: IFormLayoutSettings | undefined;
  isInModal?: boolean | undefined;
}

const getDefaultFactory = <TModel extends IConfigurableFormComponent = IConfigurableFormComponent>(fbf: FormBuilderFactory, markup: FormMarkup | SettingsFormMarkupFactory, isInModal?: boolean): ISettingsFormFactory<TModel> => {
  const evaluatedMarkup = typeof markup === 'function'
    ? markup({ fbf })
    : markup;

  const result = <TModel extends IConfigurableFormComponent = IConfigurableFormComponent>({ readOnly, model, defaultConfig, onSave, onCancel, onValuesChange, toolboxComponent, formRef, propertyFilter, layoutSettings }: IComponentSettingsFormFactoryArgs<TModel>): ReactNode => {
    return isDefined(toolboxComponent)
      ? (
        <DefaultModelProvider<TModel> name="Basic component settings" model={model} defaultModel={defaultConfig}>
          <GenericSettingsForm<TModel>
            readOnly={readOnly}
            model={model}
            onSave={onSave}
            onCancel={onCancel}
            markup={evaluatedMarkup}
            onValuesChange={onValuesChange}
            toolboxComponent={toolboxComponent}
            formRef={formRef}
            propertyFilter={propertyFilter}
            layoutSettings={layoutSettings}
            isInModal={isInModal}
          />
        </DefaultModelProvider>
      )
      : undefined;
  };
  return result;
};

//
export const ComponentPropertiesEditor = <TModel extends IConfigurableFormComponent = IConfigurableFormComponent>(props: IComponentPropertiesEditorProps<TModel>): ReactNode => {
  const { componentModel, readOnly, toolboxComponent, isInModal } = props;

  const { getCachedComponentEditor } = useFormDesigner();
  const fbf = useFormBuilderFactory();

  const SettingsForm = getCachedComponentEditor<TModel>(componentModel.type, () => {
    return toolboxComponent.settingsFormFactory
      ? toolboxComponent.settingsFormFactory
      : toolboxComponent.settingsFormMarkup
        ? getDefaultFactory(fbf, toolboxComponent.settingsFormMarkup, isInModal)
        : undefined;
  });


  const { autoSave, onSave, formRef, propertyFilter, layoutSettings } = props;

  const debouncedSave = useDebouncedCallback(
    (values: TModel) => {
      return onSave(values);
    },
    // delay in ms
    150,
  );

  const onCancel = (): void => {
    // not used
  };

  return isDefined(SettingsForm)
    ? (
      <SettingsForm
        readOnly={readOnly}
        model={componentModel}
        onSave={onSave}
        onCancel={onCancel}
        onValuesChange={(_changedValues, values) => {
          if (autoSave && !readOnly)
            void debouncedSave(values);
        }}
        toolboxComponent={toolboxComponent}
        formRef={formRef}
        propertyFilter={propertyFilter}
        layoutSettings={layoutSettings}
        isInModal={isInModal}
      />
    )
    : null;
};
