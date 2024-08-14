import React from 'react';
import { IToolboxComponent } from '@/interfaces';
import { FormMarkup, IConfigurableFormComponent } from '@/providers/form/models';
import { WarningOutlined } from '@ant-design/icons';
import settingsFormJson from './settingsForm.json';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import ValidationErrors from '@/components/validationErrors';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { useShaFormInstance } from '@/providers/form/newProvider/shaFormProvider';

export interface IValidationErrorsComponentProps extends IConfigurableFormComponent {
}

const settingsForm = settingsFormJson as FormMarkup;

const ValidationErrorsComponent: IToolboxComponent<IValidationErrorsComponentProps> = {
  type: 'validationErrors',
  isInput: false,
  name: 'Validation Errors',
  icon: <WarningOutlined />,
  Factory: () => {
    const { validationErrors, formMode } = useShaFormInstance();
    if (formMode === 'designer')
      return (
        <ValidationErrors error="Validation Errors (visible in the runtime only)"/>
      );

    return <ValidationErrors error={validationErrors}/>;
  },
  /** validationErrors should not have any settings and should be never in hidden mode and depends on permission */
  // settingsFormMarkup: settingsForm, 
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  migrator: (m) => m
    .add<IValidationErrorsComponentProps>(0, (prev) => ({...migrateFormApi.properties(prev)}))
  ,
};

export default ValidationErrorsComponent;
