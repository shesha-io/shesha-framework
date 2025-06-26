import React, { CSSProperties, useMemo } from 'react';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { GlobalTableFilter } from '@/components';
import { IToolboxComponent } from '@/interfaces';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { SearchOutlined } from '@ant-design/icons';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { getSettings } from './tabbedSettingsForm';
import { migrateFormApi } from '@/designer-components/_common-migrations/migrateFormApi1';
import { Alert } from 'antd';
import { useDataTableStore } from '@/index';
import { getDimensionsStyle } from '@/designer-components/_settings/utils/dimensions/utils';
import { IDimensionsValue } from '@/designer-components/_settings/utils/dimensions/interfaces';
import { removeUndefinedProps } from '@/utils/object';
import { migratePrevStyles } from '@/designer-components/_common-migrations/migrateStyles';

export interface IQuickSearchComponentProps extends IConfigurableFormComponent {
  block?: boolean;
  dimensions?: IDimensionsValue;
}

const QuickSearchComponent: IToolboxComponent<IQuickSearchComponentProps> = {
  type: 'datatable.quickSearch',
  isInput: false,
  name: 'Quick Search',
  icon: <SearchOutlined />,
  Factory: ({ model: { block, hidden, dimensions, size: _size} }) => {
    const store = useDataTableStore(false);

    const size = useMemo(() => _size, [_size]);
    const dimensionsStyles = useMemo(() => getDimensionsStyle(dimensions), [dimensions]);
    
    const additionalStyles: CSSProperties = removeUndefinedProps({
      ...dimensionsStyles,
    });
    const finalStyle = removeUndefinedProps({ ...additionalStyles });

    return hidden 
      ? null 
      : store 
        ? <GlobalTableFilter block={block} style={finalStyle} searchProps={{
          size
        }} />
        : <Alert
          className="sha-designer-warning"
          message="Quick Search must be used within a Data Table Context"
          type="warning"
        />;
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
      .add<IQuickSearchComponentProps>(2, (prev) => ({...migrateFormApi.properties(prev)}))
      .add<IQuickSearchComponentProps>(3, (prev) => ({ ...migratePrevStyles(prev, { size: 'small' }) }))
  ,
  settingsFormMarkup: (context) => getSettings(context),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
};

export default QuickSearchComponent;
