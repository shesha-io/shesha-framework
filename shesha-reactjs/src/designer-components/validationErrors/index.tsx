import React from 'react';
import { IToolboxComponent } from '@/interfaces';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { WarningOutlined } from '@ant-design/icons';
import { getSettings } from './settingsForm';
import { getStyle, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { useFormData } from '@/providers';
import ValidationErrors from '@/components/validationErrors';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { useShaFormInstance } from '@/providers/form/newProvider/shaFormProvider';

export interface IValidationErrorsComponentProps extends IConfigurableFormComponent {
  className?: string;
}

const ValidationErrorsComponent: IToolboxComponent<IValidationErrorsComponentProps> = {
  type: 'validationErrors',
  isInput: false,
  name: 'Validation Errors',
  icon: <WarningOutlined />,
  Factory: ({ model }) => {
    const { validationErrors, formMode } = useShaFormInstance();
    const { data: formData } = useFormData();

    if (formMode === 'designer')
      return (
        <ValidationErrors
          className={model?.className}
          style={getStyle(model?.style, formData)}
          error="Validation Errors (visible in the runtime only)"
        />
      );

    return (
      <ValidationErrors
        className={model?.className}
        style={getStyle(model?.style, formData)}
        error={validationErrors}
      />
    );
  },
  /** validationErrors should not have any settings and should be never in hidden mode and depends on permission */
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
  settingsFormMarkup: (data) => getSettings(data),
  migrator: (m) => m.add<IValidationErrorsComponentProps>(0, (prev) => ({ ...migrateFormApi.properties(prev) })),
};

export default ValidationErrorsComponent;
