import React from 'react';
import { IToolboxComponent } from 'interfaces';
import { FormMarkup, IConfigurableFormComponent } from 'providers/form/models';
import { WarningOutlined } from '@ant-design/icons';
import settingsFormJson from './settingsForm.json';
import { validateConfigurableComponentSettings } from 'providers/form/utils';
import { useForm } from 'providers';
import ValidationErrors from '../../../validationErrors';

export interface IValidationErrorsComponentProps extends IConfigurableFormComponent {
}

const settingsForm = settingsFormJson as FormMarkup;

const ValidationErrorsComponent: IToolboxComponent<IValidationErrorsComponentProps> = {
  type: 'validationErrors',
  name: 'Validation Errors',
  icon: <WarningOutlined />,
  Factory: () => {
    const { validationErrors, formMode } = useForm();
    if (formMode === 'designer')
      return (
        <ValidationErrors error="Validation Errors (visible in the runtime only)"/>
      );

    return <ValidationErrors error={validationErrors}/>;
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
};

export default ValidationErrorsComponent;
