import { migrateHiddenToVisible, migrateReadOnly, migrateStylingBoxToJson } from '@/designer-components/_common-migrations/migrateSettings';
import { migratePrevStyles } from '@/designer-components/_common-migrations/migrateStyles';
import { IToolboxComponent } from '@/interfaces';

import { FilterOutlined } from '@ant-design/icons';
import { AdvancedFilterButton } from './advancedFilterButton';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';
import { useDataTableStoreOrUndefined } from '@/providers';
import { useStyles } from '@/designer-components/dataTable/tableContext/styles';
import { IAdvancedFilterButtonComponentProps } from './types';
import { useComponentValidation } from '@/providers/validationErrors';
import { validationError } from '../utils';
import { DEFAULT_DESIGNER_PADDING } from '@/components/formDesigner/utils/stylingUtils';
import { migratePermissionsToVisiblePermissions } from '@/designer-components/_common-migrations/migratePermissionsToVisiblePermissions';

const outsideContextValidationError = validationError('Table Filter');

const AdvancedFilterButtonComponent: IToolboxComponent<IAdvancedFilterButtonComponentProps> = {
  allowInherit: true,
  type: 'datatable.filter',
  isInput: false,
  name: 'Table Filter',
  icon: <FilterOutlined />,
  getWrapperStyle: () => ({ designerStyle: DEFAULT_DESIGNER_PADDING }),
  Factory: ({ model }) => {
    const store = useDataTableStoreOrUndefined();
    useComponentValidation(() => !store ? outsideContextValidationError : undefined, [store]);
    const { styles } = useStyles();

    if (model.hidden === true) return null;

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
      <AdvancedFilterButton {...model} styles={model.styleCss} />
    );
  },
  getDefaultStyles: defaultStyles,
  initModel: (model): IAdvancedFilterButtonComponentProps => ({ ...model, label: '' }),
  settingsFormMarkup: getSettings,

  migrator: (m) => m
    .add<IAdvancedFilterButtonComponentProps>(3, (prev) => migrateReadOnly(prev as IAdvancedFilterButtonComponentProps, 'inherited'))
    .add<IAdvancedFilterButtonComponentProps>(4, (prev, ctx) => ctx.isNew === true ? prev : { ...migratePrevStyles(prev, defaultStyles(prev)) })
    .add<IAdvancedFilterButtonComponentProps>(5, (prev) => prev) // this migration was changed because it configured editable mode and now it is not necessary
    .add<IAdvancedFilterButtonComponentProps>(6, (prev, ctx) => ctx.isNew === true ? prev : {
      ...prev,
      desktop: { ...prev.desktop, buttonType: prev.buttonType ?? 'link' },
      mobile: { ...prev.mobile, buttonType: prev.buttonType ?? 'link' },
      tablet: { ...prev.tablet, buttonType: prev.buttonType ?? 'link' },
    })
    .add<IAdvancedFilterButtonComponentProps>(7, (prev) => migratePermissionsToVisiblePermissions(migrateHiddenToVisible(migrateStylingBoxToJson(prev)))),
};

export default AdvancedFilterButtonComponent;
