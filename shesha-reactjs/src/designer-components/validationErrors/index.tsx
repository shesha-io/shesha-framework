import { IToolboxComponent } from '@/interfaces';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { WarningOutlined } from '@ant-design/icons';
import { getSettings } from './settingsForm';

import { IStyleValue } from '@/providers';
import ValidationErrors from '@/components/validationErrors';
import { useShaFormValidationErrors } from '@/providers/form/providers/shaFormProvider';
import { defaultStyles } from './utils';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import classNames from 'classnames';
import { useStyles } from './styles';
import { useEvents } from '@/components/formDesigner/components/eventsAndApiValueProcessor';
import { getComponentEvents } from '../_common/events';
import { EMPTY_STYLE } from '@/styles/variables';
import { migratePermissionsToVisiblePermissions } from '../_common-migrations/migratePermissionsToVisiblePermissions';
import { migrateHiddenToVisible, migrateStylingBoxToJson } from '../_common-migrations';

export interface IValidationErrorsComponentProps extends IConfigurableFormComponent, IStyleValue {
  className?: string | undefined;
  /** @deprecated */
  borderSize?: string | number | undefined;
  /** @deprecated */
  borderRadius?: number | undefined;
  /** @deprecated */
  borderType?: string | undefined;
  /** @deprecated */
  borderColor?: string | undefined;
  /** @deprecated */
  stylingBox?: string | undefined;
  /** @deprecated */
  height?: string | number | undefined;
  /** @deprecated */
  width?: string | number | undefined;
  /** @deprecated */
  backgroundColor?: string | undefined;
  /** @deprecated */
  hideBorder?: boolean | undefined;
}

const ValidationErrorsComponent: IToolboxComponent<IValidationErrorsComponentProps> = {
  allowInherit: true,
  type: 'validationErrors',
  isInput: false,
  name: 'Validation Errors',
  icon: <WarningOutlined />,
  getWrapperStyle: (model) => ({ style: { styleCss: {}, dimensions: model.dimensions } }),
  Factory: ({ model, form }) => {
    const handleEvent = useEvents<void>(model.componentName);
    const { styles } = useStyles(model);
    const validationErrors = useShaFormValidationErrors();
    return (
      <ValidationErrors
        style={model.styleCss ?? EMPTY_STYLE}
        error={form.formMode === 'designer' ? 'Validation Errors (visible in the designer only)' : validationErrors}
        renderMode="alert"
        className={classNames(styles.shaValidationErrors, model.className)}
        additionalDomProperties={getComponentEvents<void, IValidationErrorsComponentProps>(model, ['onClick', 'onDoubleClick', 'onMouseEnter', 'onMouseMove', 'onMouseLeave'], { handleEvent })}
      />
    );
  },
  /** validationErrors is never hidden and depends on permission */

  getDefaultStyles: defaultStyles,
  settingsFormMarkup: getSettings,
  migrator: (m) => m
    .add<IValidationErrorsComponentProps>(0, (prev, ctx) => ctx.isNew === true ? prev : { ...migratePrevStyles(prev, defaultStyles()) })
    .add<IValidationErrorsComponentProps>(1, (prev) => migratePermissionsToVisiblePermissions(migrateHiddenToVisible(migrateStylingBoxToJson(prev)))),
};

export default ValidationErrorsComponent;
