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
  className?: string;
  borderSize?: string | number;
  borderRadius?: number;
  borderType?: string;
  borderColor?: string;
  stylingBox?: string;
  height?: string | number;
  width?: string | number;
  backgroundColor?: string;
  hideBorder?: boolean;
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
          className={model?.className}
          style={{ ...getStyle(model?.style, formData), ...allStyles.fullStyle }}
          error="Validation Errors (visible in the runtime only)"
        />
      );

    return (
      <ValidationErrors
        className={model?.className}
        style={{ ...getStyle(model?.style, formData), ...allStyles.fullStyle }}
        error={validationErrors}
      />
    );
  },
  /** validationErrors should not have any settings and should be never in hidden mode and depends on permission */
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
  settingsFormMarkup: (data) => getSettings(data),
  migrator: (m) =>
    m.add<IValidationErrorsComponentProps>(0, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) })),
};

export default ValidationErrorsComponent;
