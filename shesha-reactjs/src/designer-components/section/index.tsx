import React, { Fragment } from 'react';
import { IToolboxComponent } from '@/interfaces';
import { FormMarkup, IConfigurableFormComponent } from '@/providers/form/models';
import { BorderLeftOutlined } from '@ant-design/icons';
import settingsFormJson from './settingsForm.json';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import _ from 'lodash';
import { useForm, useFormData } from '@/providers';
import { Alert } from 'antd';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';

export interface ISectionProps extends IConfigurableFormComponent {
  // name: string;
}

const settingsForm = settingsFormJson as FormMarkup;

const SectionComponent: IToolboxComponent<ISectionProps> = {
  type: 'section',
  isInput: false,
  name: 'Section',
  icon: <BorderLeftOutlined />,
  Factory: ({ model }) => {
    const { getSection, formMode } = useForm();
    const { data: formData } = useFormData();

    if (formMode === 'designer') {
      return <Alert message={model.propertyName} />;
    }

    const section = getSection(model.propertyName);

    if (section) {
      return <Fragment>{section(formData)}</Fragment>;
    }

    return null;
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  migrator: (m) => m
    .add<ISectionProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
  ,
};

export default SectionComponent;
