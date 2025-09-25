import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import React, { useMemo } from 'react';
import settingsFormJson from './settingsForm.json';
import { ApartmentOutlined } from '@ant-design/icons';
import { FormMarkup } from '@/providers/form/models';
import { executeScriptSync, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { IToolboxComponent } from '@/interfaces';
import { IMetadataEditorComponentProps } from './interfaces';
import { MetadataEditor } from './metadataEditor';
import { IPropertyMetadata } from '@/interfaces/metadata';
import { useFormData } from '@/providers';
import { useMetadataBuilderFactory } from '@/utils/metadata/hooks';

const settingsForm = settingsFormJson as FormMarkup;

export const MetadataEditorComponent: IToolboxComponent<IMetadataEditorComponentProps> = {
  type: 'metadataEditor',
  isInput: true,
  isOutput: true,
  canBeJsSetting: false,
  name: 'Metadata editor',
  icon: <ApartmentOutlined />,
  Factory: ({ model }) => {
    const initialValue = model?.defaultValue ? { initialValue: model.defaultValue } : {};

    const { data: formData } = useFormData();
    const metadataBuilderFactory = useMetadataBuilderFactory();

    const baseProperties = useMemo<IPropertyMetadata[]>(() => {
      if (!model.baseProperties)
        return [];

      const metadataBuilder = metadataBuilderFactory();
      const result = executeScriptSync<IPropertyMetadata[]>(model.baseProperties, { data: formData, metadataBuilder });
      return result;
    }, [model.baseProperties, formData]);

    return (
      <ConfigurableFormItem model={model} {...initialValue}>
        {(value, onChange) => {
          return (
            <MetadataEditor
              {...model}
              value={value}
              onChange={onChange}
              readOnly={model.readOnly}
              baseProperties={baseProperties}
            />
          );
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
};
