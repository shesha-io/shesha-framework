import React from 'react';
import { IToolboxComponent } from '@/interfaces';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { WarningOutlined } from '@ant-design/icons';
import { getSettings } from './settingsForm';
import { getStyle, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { IStyleType, useFormData } from '@/providers';
import ValidationErrors from '@/components/validationErrors';
import { useShaFormInstance } from '@/providers/form/providers/shaFormProvider';
import { defaultStyles } from './utils';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';

export interface IValidationErrorsComponentProps extends IConfigurableFormComponent, IStyleType {
  className?: string | undefined;
  borderSize?: string | number | undefined;
  borderRadius?: number | undefined;
  borderType?: string | undefined;
  borderColor?: string | undefined;
  stylingBox?: string | undefined;
  height?: string | number | undefined;
  width?: string | number | undefined;
  backgroundColor?: string | undefined;
  hideBorder?: boolean | undefined;
}

const ValidationErrorsComponent: IToolboxComponent<IValidationErrorsComponentProps> = {
  type: 'validationErrors',
  isInput: false,
  name: 'Validation Errors',
  icon: <WarningOutlined />,
  Factory: ({ model }) => {
    const { allStyles } = model;
    const { validationErrors, formMode } = useShaFormInstance();
    const { data: formData } = useFormData();

    if (formMode === 'designer')
      return (
        <ValidationErrors
          style={{ ...getStyle(model.style, formData), ...allStyles?.fullStyle }}
          error="Validation Errors (visible in the runtime only)"
          renderMode="alert"
          {...(model.className ? { className: model.className } : {})}
        />
      );

    return (
      <ValidationErrors
        style={{ ...getStyle(model.style, formData), ...allStyles?.fullStyle }}
        error={validationErrors}
        renderMode="alert"
        {...(model.className ? { className: model.className } : {})}
      />
    );
  },
  /** validationErrors should not have any settings and should be never in hidden mode and depends on permission */
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  settingsFormMarkup: getSettings,
  migrator: (m) =>
    m.add<IValidationErrorsComponentProps>(0, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) })),
};

export default ValidationErrorsComponent;
