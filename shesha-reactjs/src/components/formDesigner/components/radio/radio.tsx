import ConfigurableFormItem from '../formItem';
import RadioGroup from './radioGroup';
import React from 'react';
import settingsFormJson from './settingsForm.json';
import { CheckCircleOutlined } from '@ant-design/icons';
import { DataTypes } from '@/interfaces/dataTypes';
import { FormMarkup } from '@/providers/form/models';
import { getLegacyReferenceListIdentifier } from '@/utils/referenceList';
import { getStyle, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { IRadioProps } from './utils';
import { IToolboxComponent } from '@/interfaces';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { useFormData } from '@/providers';

const settingsForm = settingsFormJson as FormMarkup;

interface IEnhancedRadioProps extends Omit<IRadioProps, 'style'> {
  style?: string;
}

const Radio: IToolboxComponent<IEnhancedRadioProps> = {
  type: 'radio',
  name: 'Radio',
  icon: <CheckCircleOutlined />,
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.array,
  Factory: ({ model }) => {
    const { style, ...restProps } = model;

    const { data: formData } = useFormData();

    return (
      <ConfigurableFormItem model={restProps}>
        {(value, onChange) => <RadioGroup {...restProps} style={getStyle(style, formData)} value={value} onChange={onChange} />}
      </ConfigurableFormItem>
    );
  },

  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  migrator: m => m
    .add<IEnhancedRadioProps>(0, prev => ({
      ...prev,
      dataSourceType: prev['dataSourceType'] ?? 'values',
      direction: prev['direction'] ?? 'horizontal',
    }))
    .add<IEnhancedRadioProps>(1, prev => {
      return {
        ...prev,
        referenceListId: getLegacyReferenceListIdentifier(prev.referenceListNamespace, prev.referenceListName),
      };
    })
    .add<IEnhancedRadioProps>(2, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IEnhancedRadioProps>(3, (prev) => migrateVisibility(prev))
    .add<IEnhancedRadioProps>(4, (prev) => migrateReadOnly(prev))
  ,
  linkToModelMetadata: (model, metadata): IEnhancedRadioProps => {
    const isRefList = metadata.dataType === DataTypes.referenceListItem;
    
    return {
      ...model,
      dataSourceType: isRefList ? 'referenceList' : 'values',
      referenceListId: isRefList
        ? {
          module: metadata.referenceListModule,
          name: metadata.referenceListName,
        }
        : null,
    };
  },
};

export default Radio;
