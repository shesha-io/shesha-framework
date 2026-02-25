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
import DefaultModelProvider from '@/designer-components/_settings/defaultValuesProvider/defaultModelProvider';

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

  return wrapDisplayName(({ readOnly, model, defaultConfig, onSave, onCancel, onValuesChange, toolboxComponent, formRef, propertyFilter, layoutSettings }) => {
    return (
      <DefaultModelProvider name="Basic component settings" model={model} defaultModel={defaultConfig}>
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
      </DefaultModelProvider>
    );
  }, "ComponentDefaultSettings");
};

export const ComponentPropertiesEditor: FC<IComponentPropertiesEditorProps> = (props) => {
  const { componentModel, readOnly, toolboxComponent, isInModal } = props;

  const { getCachedComponentEditor } = useFormDesigner();
  const fbf = useFormBuilderFactory();

  /*
  const formSettings = useFormDesignerSettings();
  const metaDispatcher = useMetadataDispatcher();
  const designerModelType = formSettings?.modelType;

  const [metadataConfig, setMetadataConfig] = useState<IConfigurableFormComponent>(undefined);

  if (designerModelType)
    metaDispatcher.getMetadata({ modelType: designerModelType, dataType: 'entity' })
      .then((meta) => {
        const propertyName = toCamelCase(componentModel.propertyName);
        const propertyMetadata = isPropertiesArray(meta?.properties)
          ? meta?.properties?.find((p) => toCamelCase(p.path) === propertyName)
          : null;
        if (!propertyMetadata) return;
        setMetadataConfig(linkComponentToModelMetadata(toolboxComponent, { id: '', type: '' }, propertyMetadata));
      });
  else
    setMetadataConfig(linkComponentToModelMetadata(toolboxComponent, { id: '', type: '' }, { path: '', dataType: '' }));
  */

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

  return SettingsForm // && metadataConfig
    ? (
      <SettingsForm
        readOnly={readOnly}
        model={componentModel}
        // defaultConfig={metadataConfig}
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
