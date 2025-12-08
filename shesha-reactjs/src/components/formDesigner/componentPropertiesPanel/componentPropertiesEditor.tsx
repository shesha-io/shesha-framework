import React, { FC, MutableRefObject } from 'react';
import { IFormLayoutSettings, ISettingsFormFactory, ISettingsFormInstance, IToolboxComponentBase, SettingsFormMarkupFactory } from '@/interfaces';
import { useDebouncedCallback } from 'use-debounce';
import { FormMarkup } from '@/providers/form/models';
import GenericSettingsForm from '../genericSettingsForm';
import { IConfigurableFormComponent } from '@/providers';
import { useFormDesigner } from '@/providers/formDesigner';
import { wrapDisplayName } from '@/utils/react';
import { useFormBuilderFactory } from '@/form-factory/hooks';
import { FormBuilderFactory } from '@/form-factory/interfaces';

export interface IComponentPropertiesEditorProps {
  toolboxComponent: IToolboxComponentBase;
  componentModel: IConfigurableFormComponent;
  onSave: (settings: IConfigurableFormComponent) => void;
  readOnly: boolean;
  autoSave: boolean;
  formRef?: MutableRefObject<ISettingsFormInstance | null>;
  propertyFilter?: (name: string) => boolean;
  layoutSettings?: IFormLayoutSettings;
  isInModal?: boolean;
}

const getDefaultFactory = (fbf: FormBuilderFactory, markup: FormMarkup | SettingsFormMarkupFactory, isInModal?: boolean): ISettingsFormFactory => {
  const evaluatedMarkup = typeof markup === 'function'
    ? markup({ fbf })
    : markup;

  return wrapDisplayName(({ readOnly, model, onSave, onCancel, onValuesChange, toolboxComponent, formRef, propertyFilter, layoutSettings }) => {
    return (
      <GenericSettingsForm
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
    );
  }, "ComponentDefaultSettings");
};

export const ComponentPropertiesEditor: FC<IComponentPropertiesEditorProps> = (props) => {
  const { componentModel, readOnly, toolboxComponent, isInModal } = props;

  const { getCachedComponentEditor } = useFormDesigner();
  const fbf = useFormBuilderFactory();

  const SettingsForm = getCachedComponentEditor(componentModel.type, () => {
    return toolboxComponent.settingsFormFactory
      ? toolboxComponent.settingsFormFactory
      : toolboxComponent.settingsFormMarkup
        ? getDefaultFactory(fbf, toolboxComponent.settingsFormMarkup, isInModal)
        : null;
  });

  const { autoSave, onSave, formRef, propertyFilter, layoutSettings } = props;

  const debouncedSave = useDebouncedCallback(
    (values) => {
      onSave(values);
    },
    // delay in ms
    300,
  );

  const onValuesChange = (_changedValues, values): void => {
    if (autoSave && !readOnly)
      debouncedSave(values);
  };

  const onCancel = (): void => {
    // not used
  };

  return SettingsForm
    ? (
      <SettingsForm
        readOnly={readOnly}
        model={componentModel}
        onSave={onSave}
        onCancel={onCancel}
        onValuesChange={onValuesChange}
        toolboxComponent={toolboxComponent}
        formRef={formRef}
        propertyFilter={propertyFilter}
        layoutSettings={layoutSettings}
        isInModal={isInModal}
      />
    )
    : null;
};
