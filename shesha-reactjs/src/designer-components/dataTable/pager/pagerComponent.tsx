import { ControlOutlined } from '@ant-design/icons';
import { ITablePagerProps, TablePager } from '@/components';
import React, { CSSProperties, useMemo } from 'react';
import { IToolboxComponent } from '@/interfaces';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { getSettings } from './settingsForm';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '@/designer-components/_common-migrations/migrateFormApi1';
import { getStyle, pickStyleFromModel, useDataTableStore } from '@/index';
import { Alert } from 'antd';
import { getFontStyle } from '@/designer-components/_settings/utils/font/utils';
import { removeUndefinedProps } from '@/utils/object';
import { migratePrevStyles } from '@/designer-components/_common-migrations/migrateStyles';
import { defaultStyles } from './utils';

export interface IPagerComponentProps extends Omit<ITablePagerProps, 'style'>, IConfigurableFormComponent { }

const PagerComponent: IToolboxComponent<IPagerComponentProps> = {
  type: 'datatable.pager',
  isInput: false,
  name: 'Table Pager',
  icon: <ControlOutlined />,
  Factory: ({ model }) => {
    const store = useDataTableStore(false);
    const font = model?.font;
    const jsStyle = getStyle(model.style, model);
    const fontStyles = useMemo(() => getFontStyle(font), [font]);
  
    if (model.hidden) return null;
  
    const styling = JSON.parse(model.stylingBox || '{}');
    const stylingBoxAsCSS = pickStyleFromModel(styling);
  
    const additionalStyles: CSSProperties = removeUndefinedProps({
      ...stylingBoxAsCSS,
      ...fontStyles,
      ...jsStyle,
    });
  
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
