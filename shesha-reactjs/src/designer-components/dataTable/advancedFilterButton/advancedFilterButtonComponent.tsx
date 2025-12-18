import { migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migratePrevStyles } from '@/designer-components/_common-migrations/migrateStyles';
import { IButtonComponentProps } from '@/designer-components/button/interfaces';
import { IToolboxComponent } from '@/interfaces';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { FilterOutlined, InfoCircleFilled } from '@ant-design/icons';
import { Popover } from 'antd';
import React from 'react';
import { AdvancedFilterButton } from './advancedFilterButton';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';
import { useDataTableStore } from '@/providers';
import { useStyles } from '@/designer-components/dataTable/tableContext/styles';

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
      ...(['primary', 'default', 'dashed'].includes(model.buttonType) && model.allStyles.shadowStyles),
      ...model.allStyles.stylingBoxAsCSS,
      ...model.allStyles.jsStyle,
    };

    if (!store) {
      return (
        <div className={styles.hintContainer}>
          <div className={styles.disabledComponentWrapper}>
            <div className={styles.filterButtonMockup}>
              <FilterOutlined style={{ color: '#8c8c8c', marginRight: '8px' }} />
              Table Filter
            </div>
          </div>
          <Popover
            placement="right"
            title="Hint:"
            rootClassName={styles.tablePagerHintPopover}
            classNames={{
              body: styles.tablePagerHintPopover,
            }}
            content={(
              <p>The Table Filter component must be<br />
                placed inside of a Data Table Context<br />
                component to be fully functional.
                <br />
                <br />
                <a
                  href="https://docs.shesha.io/docs/front-end-basics/form-components/tables-lists/table-filter"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  See component documentation
                </a><br />
                for setup and usage.
              </p>
            )}
          >
            <InfoCircleFilled style={{ color: '#faad14', cursor: 'help', fontSize: '16px' }} />
          </Popover>
        </div>
      );
    }

    return model.hidden ? null : <AdvancedFilterButton {...model} styles={finalStyle} />;
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
