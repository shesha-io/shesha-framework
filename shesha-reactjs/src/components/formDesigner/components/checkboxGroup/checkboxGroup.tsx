import { ProfileOutlined } from '@ant-design/icons';
import React from 'react';
import { useForm } from '../../../..';
import { IToolboxComponent } from '../../../../interfaces';
import { DataTypes } from '../../../../interfaces/dataTypes';
import { FormMarkup } from '../../../../providers/form/models';
import { getStyle, validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import { IReferenceListIdentifier } from '../../../../providers/referenceListDispatcher/models';
import { getLegacyReferenceListIdentifier } from '../../../../utils/referenceList';
import ConfigurableFormItem from '../formItem';
import RefListCheckboxGroup from './refListCheckboxGroup';
import settingsFormJson from './settingsForm.json';
import { ICheckboxGroupProps } from './utils';

const settingsForm = settingsFormJson as FormMarkup;

interface IEnhancedICheckboxGoupProps extends Omit<ICheckboxGroupProps, 'style'> {
  style?: string;
}

const CheckboxGroupComponent: IToolboxComponent<IEnhancedICheckboxGoupProps> = {
  type: 'checkboxGroup',
  name: 'Checkbox group',
  icon: <ProfileOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.referenceListItem,
  factory: (model: IEnhancedICheckboxGoupProps) => {
    const { formData } = useForm();

    return (
      <ConfigurableFormItem model={model}>
        <RefListCheckboxGroup {...model} style={getStyle(model?.style, formData)} />
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  initModel: model => {
    const customProps: IEnhancedICheckboxGoupProps = {
      ...model,
      dataSourceType: 'values',
      direction: 'horizontal',
      mode: 'single',
    };
    return customProps;
  },
  migrator: m => m.add<IEnhancedICheckboxGoupProps>(0, prev => (
    {
      ...prev,
      dataSourceType: prev['dataSourceType'] ?? 'values',
      direction: prev['direction'] ?? 'horizontal',
      mode: prev['mode'] ?? 'single',
    }
  )).add<IEnhancedICheckboxGoupProps>(1, prev => {
    return {...prev, referenceListId: getLegacyReferenceListIdentifier(prev.referenceListNamespace, prev.referenceListName) };
  }),
  linkToModelMetadata: (model, metadata): IEnhancedICheckboxGoupProps => {
    const refListId: IReferenceListIdentifier = metadata.referenceListName
      ? { module: metadata.referenceListModule, name: metadata.referenceListName }
      : null;
    return {
      ...model,
      dataSourceType: metadata.dataType === DataTypes.referenceListItem ? 'referenceList' : 'values',
      referenceListId: refListId,
    };
  },
};

export default CheckboxGroupComponent;
