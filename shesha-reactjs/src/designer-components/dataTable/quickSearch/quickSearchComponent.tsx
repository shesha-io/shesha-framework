import React, { CSSProperties, useMemo } from 'react';
import { GlobalTableFilter } from '@/components';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { SearchOutlined } from '@ant-design/icons';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { getSettings } from './tabbedSettingsForm';
import { migrateFormApi } from '@/designer-components/_common-migrations/migrateFormApi1';
import Search from 'antd/lib/input/Search';
import { useDataTableStore, useForm } from '@/index';
import { useStyles } from '../tableContext/styles';
import { getDimensionsStyle } from '@/designer-components/_settings/utils/dimensions/utils';
import { removeUndefinedProps } from '@/utils/object';
import { migratePrevStyles } from '@/designer-components/_common-migrations/migrateStyles';
import { IQuickSearchComponentProps, QuickSearchComponentDefinition } from './interfaces';
import ErrorIconPopover from '@/components/componentErrors/errorIconPopover';
import { IModelValidation } from '@/utils/errors';

const QuickSearchComponent: QuickSearchComponentDefinition = {
  type: 'datatable.quickSearch',
  isInput: false,
  name: 'Quick Search',
  icon: <SearchOutlined />,
  Factory: ({ model }) => {
    const { block, hidden, dimensions, size: modelSize, id, componentName } = model;
    const store = useDataTableStore(false);
    const { styles } = useStyles();
    const { formMode } = useForm();
    const dimensionsStyles = useMemo(() => getDimensionsStyle(dimensions), [dimensions]);

    const additionalStyles: CSSProperties = removeUndefinedProps({
      ...dimensionsStyles,
    });
    const finalStyle = removeUndefinedProps({
      ...additionalStyles,
      // Ensure consistent width when outside DataTableContext
      ...(store ? {} : { width: additionalStyles.width ?? '360px' }),
    });

    const validationResult = useMemo((): IModelValidation | undefined => {
      if (!store) {
        return {
          hasErrors: true,
          componentId: id,
          componentName: componentName,
          componentType: 'datatable.quickSearch',
          errors: [{
            propertyName: 'No ancestor Data Context component is set',
            error: '\nPlace this component inside a Data Context component to connect it to data',
          }],
        };
      }
      return undefined;
    }, [store, id, componentName]);

    if (hidden) return null;

    const content = store
      ? (
        <GlobalTableFilter
          block={block}
          style={finalStyle}
          searchProps={{
            size: modelSize,
          }}
        />
      )
      : (
        <div className={styles.quickSearchContainer} style={finalStyle}>
          <Search
            size={modelSize}
            disabled
          />
        </div>
      );

    return validationResult?.hasErrors && formMode === 'designer' ? (
      <ErrorIconPopover mode="validation" validationResult={validationResult} type="warning" isDesignerMode={true}>
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
