import { migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migratePrevStyles } from '@/designer-components/_common-migrations/migrateStyles';
import { IButtonComponentProps } from '@/designer-components/button/interfaces';
import { IToolboxComponent } from '@/interfaces';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { FilterOutlined } from '@ant-design/icons';
import React from 'react';
import { AdvancedFilterButton } from './advancedFilterButton';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';
import { useDataTableStore } from '@/providers';
import { useStyles } from '@/designer-components/dataTable/tableContext/styles';
import { ErrorIconPopover } from '@/components';

const AdvancedFilterButtonComponent: IToolboxComponent<IButtonComponentProps> = {
  type: 'datatable.filter',
  isInput: false,
  name: 'Table Filter',
  icon: <FilterOutlined />,
  Factory: ({ model }) => {
    const store = useDataTableStore(false);
    const { styles } = useStyles();

    const finalStyle = {
      ...model.allStyles.dimensionsStyles,
      ...(['primary', 'default'].includes(model.buttonType) && model.allStyles.borderStyles),
      ...model.allStyles.fontStyles,
      ...(['dashed', 'default'].includes(model.buttonType) && model.allStyles.backgroundStyles),
      ...(['primary', 'default'].includes(model.buttonType) && model.allStyles.shadowStyles),
      ...model.allStyles.stylingBoxAsCSS,
      ...model.allStyles.jsStyle,
    };

    if (model.hidden) return null;

    if (!store) {
      const mockContent = (
        <div className={styles.hintContainer}>
          <div className={styles.disabledComponentWrapper}>
            <div className={styles.filterButtonMockup}>
              <FilterOutlined style={{ color: '#8c8c8c', marginRight: '8px' }} />
              Table Filter
            </div>
          </div>
        </div>
      );

      return (
        <ErrorIconPopover
          mode="message"
          message="The Table Filter component must be placed inside of a Data Table Context component to be fully functional."
          type="info"
          position="top-right"
        >
          {mockContent}
        </ErrorIconPopover>
      );
    }

    return <AdvancedFilterButton {...model} styles={finalStyle} />;
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
      .add<IButtonComponentProps>(3, (prev) => migrateReadOnly(prev, 'inherited'))
      .add<IButtonComponentProps>(4, (prev) => ({ ...migratePrevStyles(prev, defaultStyles(prev)) }))
      .add<IButtonComponentProps>(5, (prev, context) => ({
        ...prev,
        editMode: (context.isNew ? 'editable' : prev.editMode),
      })),
};

export default AdvancedFilterButtonComponent;
