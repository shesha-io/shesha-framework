import { ITableViewSelectorComponentProps, TableViewSelectorComponentDefinition } from './models';
import { migrateFilterMustacheExpressions } from '@/designer-components/_common-migrations/migrateUseExpression';
import { migrateHiddenToVisible, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { SelectOutlined } from '@ant-design/icons';
import { TableViewSelector } from './tableViewSelector';
import { getSettings } from './settingsForm';
import { useStyles } from '../tableContext/styles';
import { useComponentValidation } from '@/providers/validationErrors';
import { validationError } from '../utils';
import { useDataTableStoreOrUndefined } from '@/providers/dataTable/hooks';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { isNonEmptyArray } from '@/utils/array';
import { IStoredFilter } from '@/interfaces';
import { isDefined } from '@/utils/nullables';
import { migratePermissionsToVisiblePermissions } from '@/designer-components/_common-migrations/migratePermissionsToVisiblePermissions';

const outsideContextValidationError = validationError('Table View Selector');

const TableViewSelectorComponent: TableViewSelectorComponentDefinition = {
  allowInherit: true,
  type: 'tableViewSelector',
  isInput: false,
  name: 'Table View Selector',
  icon: <SelectOutlined />,
  getWrapperStyle: () => ({ style: { stylingBoxJson: { marginBottom: 0, marginTop: 0, marginLeft: 0, marginRight: 0, _type: 'styleBox' } } }),
  Factory: ({ model }) => {
    const store = useDataTableStoreOrUndefined();
    const { styles } = useStyles();

    useComponentValidation(() => !store ? outsideContextValidationError : undefined, [store]);

    return store
      ? <TableViewSelector {...model} />
      : <div className={styles.hintContainer}><div className={styles.viewSelectorMockup}>View: Default</div></div>;
  },
  actualModelPropertyFilter: (name) => name !== 'filters',
  initModel: (model: ITableViewSelectorComponentProps) => {
    // Ensure component always has at least 1 filter for WYSIWYG display
    const defaultFilters = isNonEmptyArray(model.filters)
      ? model.filters
      : [{
        id: 'default-all-records',
        name: 'Default',
        tooltip: 'Shows all records without any filtering',
        sortOrder: 0,
        expression: undefined, // No filter expression = show all
      } satisfies IStoredFilter];

    return {
      ...model,
      filters: defaultFilters,
      persistSelectedFilters: model.persistSelectedFilters ?? true,
    };
  },
  migrator: (m) => m
    .add<ITableViewSelectorComponentProps>(0, (prev) => {
      const prevTyped = prev as ITableViewSelectorComponentProps;
      return {
        ...prev,
        filters: isDefined(prevTyped.filters) && Array.isArray(prevTyped.filters)
          ? prevTyped.filters
          : [{
            id: 'default-all-records',
            name: 'Default',
            tooltip: 'Shows all records without any filtering',
            sortOrder: 0,
            expression: undefined,
          } satisfies IStoredFilter],
      };
    })
    .add<ITableViewSelectorComponentProps>(1, (prev) => ({ ...prev, filters: prev.filters.map((filter) => migrateFilterMustacheExpressions(filter)) }))
    .add<ITableViewSelectorComponentProps>(2, (prev) => migratePropertyName(prev))
    .add<ITableViewSelectorComponentProps>(7, (prev) => migratePermissionsToVisiblePermissions(migrateHiddenToVisible(prev))),

  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
};

export default TableViewSelectorComponent;
