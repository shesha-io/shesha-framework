import React, { Fragment } from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { FormMarkup, IConfigurableFormComponent } from '../../../../providers/form/models';
import { BorderLeftOutlined } from '@ant-design/icons';
import settingsFormJson from './settingsForm.json';
import { validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import _ from 'lodash';
import { useForm } from '../../../../providers';
import { Alert } from 'antd';

export interface ISectionProps extends IConfigurableFormComponent {
  // name: string;
}

const settingsForm = settingsFormJson as FormMarkup;

const SectionComponent: IToolboxComponent<ISectionProps> = {
  type: 'section',
  name: 'Section',
  icon: <BorderLeftOutlined />,
  factory: (model: ISectionProps) => {
    const { formData, getSection, formMode } = useForm();

    if (formMode === 'designer') {
      return <Alert message={model.name} />
    }

    const section = getSection(model.id, model.name)

    if (section) {
      return (
        <Fragment>{section(formData)}</Fragment>
      );
    }
          
    return null;
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
};

export default SectionComponent;
