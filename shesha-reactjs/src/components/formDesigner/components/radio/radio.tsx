import { CheckCircleOutlined } from '@ant-design/icons';
import { migrateCustomFunctions, migratePropertyName } from 'designer-components/_common-migrations/migrateSettings';
import React from 'react';
import { useFormData } from '../../../..';
import { IToolboxComponent } from 'interfaces';
import { DataTypes } from 'interfaces/dataTypes';
import { FormMarkup } from 'providers/form/models';
import { getStyle, validateConfigurableComponentSettings } from 'providers/form/utils';
import { getLegacyReferenceListIdentifier } from 'utils/referenceList';
import ConfigurableFormItem from '../formItem';
import RadioGroup from './radioGroup';
import settingsFormJson from './settingsForm.json';
import { IRadioProps } from './utils';
import { migrateVisibility } from 'designer-components/_common-migrations/migrateVisibility';

const settingsForm = settingsFormJson as FormMarkup;

interface IEnhancedRadioProps extends Omit<IRadioProps, 'style'> {
  style?: string;
}

const Radio: IToolboxComponent<IEnhancedRadioProps> = {
  type: 'radio',
  name: 'Radio',
  icon: <CheckCircleOutlined />,
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
  ,
};

export default Radio;
