import { migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migratePrevStyles } from '@/designer-components/_common-migrations/migrateStyles';
import { IToolboxComponent } from '@/interfaces';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { FilterOutlined } from '@ant-design/icons';
import React, { useMemo } from 'react';
import { AdvancedFilterButton } from './advancedFilterButton';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';
import { useDataTableStore, useForm } from '@/providers';
import { useStyles } from '@/designer-components/dataTable/tableContext/styles';
import { IAdvancedFilterButtonComponentProps } from './types';

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

    const validationResult = useMemo((): IModelValidation | undefined => {
      if (!store) {
        return {
          hasErrors: true,
          componentId: model.id,
          componentName: model.componentName,
          componentType: 'datatable.filter',
          errors: [{
            propertyName: 'No ancestor Data Context component is set',
            error: '\nPlace this component inside a Data Context component to connect it to data',
          }],
        };
      }
      return undefined;
    }, [store, model.id, model.componentName]);

    if (model.hidden) return null;

    if (!store) {
      return (
        <div className={styles.hintContainer}>
          <div className={styles.disabledComponentWrapper}>
            <div className={styles.filterButtonMockup}>
              <FilterOutlined style={{ color: '#8c8c8c', marginRight: '8px' }} />
              Table Filter
            </div>
          </div>
        </div>
      );
    }

    return <AdvancedFilterButton {...model as IAdvancedFilterButtonComponentProps} styles={finalStyle} />;
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
