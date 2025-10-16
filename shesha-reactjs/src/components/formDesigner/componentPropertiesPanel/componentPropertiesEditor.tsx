import React, { FC, MutableRefObject } from 'react';
import { IFormLayoutSettings, ISettingsFormFactory, ISettingsFormInstance, IToolboxComponent } from '@/interfaces';
import { useDebouncedCallback } from 'use-debounce';
import { FormMarkup } from '@/providers/form/models';
import GenericSettingsForm from '../genericSettingsForm';
import { IConfigurableFormComponent } from '@/providers';
import { useFormDesignerActions } from '@/providers/formDesigner';
import { wrapDisplayName } from '@/utils/react';

export interface IComponentPropertiesEditorProps {
  toolboxComponent: IToolboxComponent;
  componentModel: IConfigurableFormComponent;
  onSave: (settings: IConfigurableFormComponent) => void;
  readOnly: boolean;
  autoSave: boolean;
  formRef?: MutableRefObject<ISettingsFormInstance | null>;
  propertyFilter?: (name: string) => boolean;
  layoutSettings?: IFormLayoutSettings;
  isInModal?: boolean;
}

const getDefaultFactory = (markup: FormMarkup, isInModal?: boolean): ISettingsFormFactory => {
  const evaluatedMarkup = typeof markup === 'function'
    ? markup({})
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

  const { getCachedComponentEditor } = useFormDesignerActions();

  const SettingsForm = getCachedComponentEditor(componentModel.type, () => {
    return toolboxComponent?.settingsFormFactory
      ? toolboxComponent.settingsFormFactory
      : toolboxComponent?.settingsFormMarkup
        ? getDefaultFactory(toolboxComponent.settingsFormMarkup, isInModal)
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
