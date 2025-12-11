import React, { CSSProperties, useMemo } from 'react';
import { GlobalTableFilter, ErrorIconPopover } from '@/components';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { SearchOutlined } from '@ant-design/icons';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { getSettings } from './tabbedSettingsForm';
import { migrateFormApi } from '@/designer-components/_common-migrations/migrateFormApi1';
import Search from 'antd/lib/input/Search';
import { useDataTableStore } from '@/index';
import { useStyles } from '../tableContext/styles';
import { getDimensionsStyle } from '@/designer-components/_settings/utils/dimensions/utils';
import { removeUndefinedProps } from '@/utils/object';
import { migratePrevStyles } from '@/designer-components/_common-migrations/migrateStyles';
import { IQuickSearchComponentProps, QuickSearchComponentDefinition } from './interfaces';

const QuickSearchComponent: QuickSearchComponentDefinition = {
  type: 'datatable.quickSearch',
  isInput: false,
  name: 'Quick Search',
  icon: <SearchOutlined />,
  Factory: ({ model: { block, hidden, dimensions, size: _size } }) => {
    const store = useDataTableStore(false);
    const { styles } = useStyles();
    const size = useMemo(() => _size, [_size]);
    const dimensionsStyles = useMemo(() => getDimensionsStyle(dimensions), [dimensions]);

    const additionalStyles: CSSProperties = removeUndefinedProps({
      ...dimensionsStyles,
    });
    const finalStyle = removeUndefinedProps({
      ...additionalStyles,
      // Ensure consistent width when outside DataTableContext
      ...(store ? {} : { width: additionalStyles.width ?? '360px' }),
    });

    if (hidden) return null;

    const content = store
      ? (
        <GlobalTableFilter
          block={block}
          style={finalStyle}
          searchProps={{
            size,
          }}
        />
      )
      : (
        <div className={styles.quickSearchContainer} style={finalStyle}>
          <Search
            size={size}
            disabled
          />
        </div>
      );

    // Wrap with ErrorIconPopover if not inside DataTableContext
    return !store ? (
      <ErrorIconPopover
        mode="message"
        message="The Quick Search component must be placed inside of a Data Context component to be fully functional."
        type="info"
        position="top-right"
      >
        {content}
      </ErrorIconPopover>
    ) : content;
  },
  initModel: (model: IQuickSearchComponentProps) => {
    return {
      ...model,
      items: [],
      size: 'small',
    };
  },
  migrator: (m) =>
    m
      .add(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<IQuickSearchComponentProps>(1, (prev) => migrateVisibility(prev))
      .add<IQuickSearchComponentProps>(2, (prev) => ({ ...migrateFormApi.properties(prev) }))
      .add<IQuickSearchComponentProps>(3, (prev) => ({ ...migratePrevStyles(prev, { size: 'small' }) })),
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
};

export default QuickSearchComponent;
