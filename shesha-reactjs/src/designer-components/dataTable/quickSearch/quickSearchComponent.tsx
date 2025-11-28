import React, { CSSProperties, useMemo } from 'react';
import { GlobalTableFilter } from '@/components';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { SearchOutlined, InfoCircleFilled } from '@ant-design/icons';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { getSettings } from './tabbedSettingsForm';
import { migrateFormApi } from '@/designer-components/_common-migrations/migrateFormApi1';
import { Popover } from 'antd';
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

    return hidden
      ? null
      : store
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
          <>
            <style>
              {styles.quickSearchPopoverArrowStyles}
            </style>
            <div className={styles.quickSearchContainer} style={finalStyle}>
              <Search
                size={size}
                disabled
              />
              <Popover
                placement="right"
                title="Hint:"
                rootClassName={styles.quickSearchHintPopover}
                classNames={{
                  body: styles.quickSearchHintPopover,
                }}
                content={(
                  <p>The Quick Search component must be<br /> placed inside of a Data Context<br /> component to be fully functional.
                    <br />
                    <br />
                    <a href="https://docs.shesha.io/docs/category/tables-and-lists" target="_blank" rel="noopener noreferrer">See component documentation</a><br />for setup and usage.
                  </p>
                )}
              >
                <InfoCircleFilled style={{ color: '#faad14', cursor: 'help', fontSize: '16px' }} />
              </Popover>
            </div>
          </>
        );
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
