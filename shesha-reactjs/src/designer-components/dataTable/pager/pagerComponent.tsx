import { ITablePagerProps, TablePager } from '@/components';
import { migrateFormApi } from '@/designer-components/_common-migrations/migrateFormApi1';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migratePrevStyles } from '@/designer-components/_common-migrations/migrateStyles';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { useDataTableStore } from '@/index';
import { IToolboxComponent } from '@/interfaces';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { removeUndefinedProps } from '@/utils/object';
import { ControlOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import React, { CSSProperties } from 'react';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';

export interface IPagerComponentProps extends Omit<ITablePagerProps, 'style'>, IConfigurableFormComponent {}

const PagerComponent: IToolboxComponent<IPagerComponentProps> = {
  type: 'datatable.pager',
  isInput: false,
  name: 'Table Pager',
  icon: <ControlOutlined />,
  Factory: ({ model }) => {
    const { allStyles } = model;
    const store = useDataTableStore(false);
    const jsStyle = allStyles?.jsStyle;
    const fontStyles = allStyles?.fontStyles;
    const stylingBoxAsCSS = allStyles?.stylingBoxAsCSS;

    const additionalStyles: CSSProperties = removeUndefinedProps({
      ...stylingBoxAsCSS,
      ...fontStyles,
      ...jsStyle,
    });

    if (model.hidden) return null;

    return store ? (
      <TablePager {...model} style={additionalStyles} />
    ) : (
      <Alert
        className="sha-designer-warning"
        message="Table Pager must be used within a Data Table Context"
        type="warning"
      />
    );
  },
  initModel: (model: IPagerComponentProps) => {
    return {
      ...model,
      showSizeChanger: true,
      showTotalItems: true,
      items: [],
    };
  },
  migrator: (m) =>
    m
      .add<IPagerComponentProps>(0, (prev) => ({ ...prev }) as IPagerComponentProps)
      .add<IPagerComponentProps>(1, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<IPagerComponentProps>(2, (prev) => migrateVisibility(prev))
      .add<IPagerComponentProps>(3, (prev) => ({ ...migrateFormApi.properties(prev) }))
      .add<IPagerComponentProps>(4, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) })),

  settingsFormMarkup: (context) => getSettings(context),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
};

export default PagerComponent;
