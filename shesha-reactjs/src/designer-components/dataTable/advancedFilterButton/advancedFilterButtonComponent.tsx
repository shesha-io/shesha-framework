import { migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migratePrevStyles } from '@/designer-components/_common-migrations/migrateStyles';
import { IToolboxComponent } from '@/interfaces';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { FilterOutlined } from '@ant-design/icons';
import React from 'react';
import { AdvancedFilterButton } from './advancedFilterButton';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';
import { useDataTableStore } from '@/providers';
import { useStyles } from '@/designer-components/dataTable/tableContext/styles';
import { IAdvancedFilterButtonComponentProps } from './types';
import { useComponentValidation } from '@/providers/validationErrors';
import { useForm } from '@/providers/form';
import { useIsInsideDataContext } from '@/utils/form/useComponentHierarchyCheck';
import { validationError } from '../utils';

const outsideContextValidationError = validationError('Table Filter');

const AdvancedFilterButtonComponent: IToolboxComponent<IAdvancedFilterButtonComponentProps> = {
  type: 'datatable.filter',
  isInput: false,
  name: 'Table Filter',
  icon: <FilterOutlined />,
  Factory: ({ model }) => {
    const store = useDataTableStore(false);
    const { styles } = useStyles();
    const { formMode } = useForm();

    const finalStyle = {
      ...model.allStyles.dimensionsStyles,
      ...(['primary', 'default'].includes(model.buttonType) && model.allStyles.borderStyles),
      ...model.allStyles.fontStyles,
      ...(['dashed', 'default'].includes(model.buttonType) && model.allStyles.backgroundStyles),
      ...(['primary', 'default', 'dashed'].includes(model.buttonType) && model.allStyles.shadowStyles),
      ...model.allStyles.stylingBoxAsCSS,
      ...model.allStyles.jsStyle,
    };

    // Use stable hook that only recomputes when actual hierarchy changes
    const isInsideDataContextInMarkup = useIsInsideDataContext(model.id);

    const shouldShowError = formMode === 'designer' && !isInsideDataContextInMarkup;

    useComponentValidation(
      () => shouldShowError ? outsideContextValidationError : undefined,
      [shouldShowError],
    );

    if (model.hidden) return null;

    return !store ? (
      <div className={styles.hintContainer}>
        <div className={styles.disabledComponentWrapper}>
          <div className={styles.filterButtonMockup}>
            <FilterOutlined style={{ color: '#8c8c8c', marginRight: '8px' }} />
            Table Filter
          </div>
        </div>
      </div>
    ) : (
      <AdvancedFilterButton {...model as IAdvancedFilterButtonComponentProps} styles={finalStyle} />
    );
  },
  initModel: (model) => {
    return {
      ...model,
      buttonType: 'link',
      label: '',
    };
  },
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  migrator: (m) =>
    m
      .add<IAdvancedFilterButtonComponentProps>(3, (prev) => migrateReadOnly(prev as IAdvancedFilterButtonComponentProps, 'inherited'))
      .add<IAdvancedFilterButtonComponentProps>(4, (prev) => {
        // Omit buttonType when calling defaultStyles as it expects Omit<IButtonComponentProps, 'buttonType'>
        const { buttonType, ...rest } = prev;
        return { ...migratePrevStyles(prev, defaultStyles(rest)), buttonType };
      })
      .add<IAdvancedFilterButtonComponentProps>(5, (prev, context) => ({
        ...prev,
        editMode: (context.isNew ? 'editable' : prev.editMode),
      })),
};

export default AdvancedFilterButtonComponent;
