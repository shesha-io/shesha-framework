import { CheckCircleOutlined } from '@ant-design/icons';
import React from 'react';
import { useForm } from '../../../..';
import { IToolboxComponent } from '../../../../interfaces';
import { DataTypes } from '../../../../interfaces/dataTypes';
import { FormMarkup } from '../../../../providers/form/models';
import { getStyle, validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import { getLegacyReferenceListIdentifier } from '../../../../utils/referenceList';
import ConfigurableFormItem from '../formItem';
import RadioGroup from './radioGroup';
import settingsFormJson from './settingsForm.json';
import { IRadioProps } from './utils';

const settingsForm = settingsFormJson as FormMarkup;

interface IEnhancedRadioProps extends Omit<IRadioProps, 'style'> {
  style?: string;
}

const Radio: IToolboxComponent<IEnhancedRadioProps> = {
  type: 'radio',
  name: 'Radio',
  icon: <CheckCircleOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.array,
  factory: ({ style, ...model }: IEnhancedRadioProps) => {
    const { formData } = useForm();

    return (
      <ConfigurableFormItem model={model}>
        <RadioGroup {...model} style={getStyle(style, formData)} />
      </ConfigurableFormItem>
    );
  },

  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  migrator: m => m.add<IEnhancedRadioProps>(0, prev => (
    {
      ...prev,
      dataSourceType: prev['dataSourceType'] ?? 'values',
      direction: prev['direction'] ?? 'horizontal'
    }
  )).add<IEnhancedRadioProps>(1, prev => {
    return {...prev, referenceListId: getLegacyReferenceListIdentifier(prev.referenceListNamespace, prev.referenceListName) };
  }),
};

export default Radio;
