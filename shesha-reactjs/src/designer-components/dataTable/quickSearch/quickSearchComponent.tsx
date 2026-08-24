import { GlobalTableFilter } from '@/components/globalTableFilter';
import { migrateCustomFunctions, migrateHiddenToVisible, migratePropertyName, migrateStylingBoxToJson } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { SearchOutlined } from '@ant-design/icons';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { getSettings } from './tabbedSettingsForm';
import { migrateFormApi } from '@/designer-components/_common-migrations/migrateFormApi1';
import Search from 'antd/lib/input/Search';
import { useStyles } from '../tableContext/styles';
import { migratePrevStyles } from '@/designer-components/_common-migrations/migrateStyles';
import { IQuickSearchComponentProps, QuickSearchComponentDefinition } from './interfaces';
import { useComponentValidation } from '@/providers/validationErrors';
import { validationError } from '../utils';
import { useDataTableStoreOrUndefined } from '@/providers/dataTable/hooks';
import { DEFAULT_DESIGNER_PADDING } from '@/components/formDesigner/utils/stylingUtils';
import { migratePermissionsToVisiblePermissions } from '@/designer-components/_common-migrations/migratePermissionsToVisiblePermissions';

const outsideContextValidationError = validationError('Quick Search');

const QuickSearchComponent: QuickSearchComponentDefinition = {
  allowInherit: true,
  type: 'datatable.quickSearch',
  isInput: false,
  name: 'Quick Search',
  icon: <SearchOutlined />,
  getWrapperStyle: (model) => ({
    style: { dimensions: { width: model.dimensions?.width, maxWidth: model.dimensions?.maxWidth, minWidth: model.dimensions?.minWidth } },
    designerStyle: DEFAULT_DESIGNER_PADDING,
  }),
  Factory: ({ model }) => {
    const { hidden, size: modelSize } = model;
    const store = useDataTableStoreOrUndefined();
    const { styles } = useStyles();

    useComponentValidation(() => !store ? outsideContextValidationError : undefined, [store]);

    if (hidden === true) return null;

    return store
      ? <GlobalTableFilter searchProps={{ size: modelSize }} />
      : <div className={styles.quickSearchContainer}><Search size={modelSize} disabled /></div>;
  },
  initModel: (model: IQuickSearchComponentProps) => ({ ...model, items: [], size: 'small' }),
  migrator: (m) => m
    .add(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IQuickSearchComponentProps>(1, (prev) => migrateVisibility(prev))
    .add<IQuickSearchComponentProps>(2, (prev) => ({ ...migrateFormApi.properties(prev) }))
    .add<IQuickSearchComponentProps>(3, (prev, ctx) => ctx.isNew === true ? prev : { ...migratePrevStyles(prev, { size: 'small' }) })
    .add<IQuickSearchComponentProps>(4, (prev) => migratePermissionsToVisiblePermissions(migrateHiddenToVisible(migrateStylingBoxToJson(prev)))),
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
};

export default QuickSearchComponent;
