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
import { useConfigurableFormSections } from '@/providers/form/sections';

export type ISectionProps = IConfigurableFormComponent;

const settingsForm = settingsFormJson as FormMarkup;

const SectionComponent: IToolboxComponent<ISectionProps> = {
  type: 'section',
  isInput: false,
  name: 'Section',
  icon: <BorderLeftOutlined />,
  isOutput: true,
  Factory: ({ model }) => {
    const { formMode } = useForm();
    const sections = useConfigurableFormSections(false) ?? {};
    const { data: formData } = useFormData();

    if (formMode === 'designer') {
      return <Alert message={model.propertyName} />;
    }

    const section = sections?.[model.propertyName];

    if (section) {
      return <Fragment>{section(formData)}</Fragment>;
    }

    return null;
  },
  settingsFormMarkup: settingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
  migrator: (m) => m
    .add<ISectionProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev))),
};

export default SectionComponent;
