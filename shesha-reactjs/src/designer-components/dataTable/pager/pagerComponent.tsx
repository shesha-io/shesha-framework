import { TablePager } from '@/components/tablePager';
import { migrateFormApi } from '@/designer-components/_common-migrations/migrateFormApi1';
import { migrateCustomFunctions, migrateHiddenToVisible, migratePropertyName, migrateStylingBoxToJson } from '@/designer-components/_common-migrations/migrateSettings';
import { migratePrevStyles } from '@/designer-components/_common-migrations/migrateStyles';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';

import { ControlOutlined } from '@ant-design/icons';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';
import { IPagerComponentProps, PagerComponentDefinition } from './interfaces';
import { EMPTY_STYLE } from '@/styles/variables';
import { DEFAULT_DESIGNER_PADDING } from '@/components/formDesigner/utils/stylingUtils';
import { migratePermissionsToVisiblePermissions } from '@/designer-components/_common-migrations/migratePermissionsToVisiblePermissions';

const PagerComponent: PagerComponentDefinition = {
  allowInherit: true,
  type: 'datatable.pager',
  isInput: false,
  name: 'Table Pager',
  icon: <ControlOutlined />,
  getWrapperStyle: () => ({ designerStyle: DEFAULT_DESIGNER_PADDING }),
  Factory: ({ model }) => {
    return model.hidden === true ? null : <TablePager {...model} style={model.styleCss ?? EMPTY_STYLE} />;
  },
  initModel: (model: IPagerComponentProps) => ({ ...model, showSizeChanger: true, showTotalItems: true, items: [] }),
  getDefaultStyles: defaultStyles,
  migrator: (m) => m
    .add<IPagerComponentProps>(0, (prev) => ({ ...prev } as IPagerComponentProps))
    .add<IPagerComponentProps>(1, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IPagerComponentProps>(2, (prev) => migrateVisibility(prev))
    .add<IPagerComponentProps>(3, (prev) => ({ ...migrateFormApi.properties(prev) }))
    .add<IPagerComponentProps>(4, (prev, ctx) => ctx.isNew === true ? prev : { ...migratePrevStyles(prev, defaultStyles()) })
    .add<IPagerComponentProps>(5, (prev) => migratePermissionsToVisiblePermissions(migrateHiddenToVisible(migrateStylingBoxToJson(prev)))),

  settingsFormMarkup: getSettings,

};

export default PagerComponent;
