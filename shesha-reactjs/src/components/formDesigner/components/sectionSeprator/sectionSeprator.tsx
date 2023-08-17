import { IToolboxComponent } from '../../../../interfaces';
import { FormMarkup } from '../../../../providers/form/models';
import { LineOutlined } from '@ant-design/icons';
import settingsFormJson from './settingsForm.json';
import React from 'react';
import { getStyle, validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import { useForm, useFormData } from '../../../../providers';
import SectionSeparator from '../../../sectionSeparator';
import { ISectionSeparatorComponentProps } from './interfaces';
import { migrateCustomFunctions, migratePropertyName } from 'designer-components/_common-migrations/migrateSettings';

const settingsForm = settingsFormJson as FormMarkup;

const SectionSeparatorComponent: IToolboxComponent<ISectionSeparatorComponentProps> = {
  type: 'sectionSeparator',
  name: 'Section Separator',
  icon: <LineOutlined />,
  factory: (model: ISectionSeparatorComponentProps) => {
    const { isComponentHidden } = useForm();
    const { data: formData } = useFormData();

    if (isComponentHidden(model)) return null;

    return (
      <SectionSeparator
        title={model.label}
        containerStyle={getStyle(model?.containerStyle, formData)}
        titleStyle={getStyle(model?.titleStyle, formData)}
      />
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  initModel: model => {
    return {
      ...model,
      label: 'Section',
    };
  },
  migrator: (m) => m
    .add<ISectionSeparatorComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
  ,

};

export default SectionSeparatorComponent;
