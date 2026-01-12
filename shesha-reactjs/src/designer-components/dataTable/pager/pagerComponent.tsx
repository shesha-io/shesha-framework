import { TablePager } from '@/components';
import { migrateFormApi } from '@/designer-components/_common-migrations/migrateFormApi1';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migratePrevStyles } from '@/designer-components/_common-migrations/migrateStyles';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { removeUndefinedProps } from '@/utils/object';
import { ControlOutlined } from '@ant-design/icons';
import React, { CSSProperties, useMemo } from 'react';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';
import { IPagerComponentProps, PagerComponentDefinition } from './interfaces';
import { useDataTableStore, useForm } from '@/providers';
import ErrorIconPopover from '@/components/componentErrors/errorIconPopover';
import { IModelValidation } from '@/utils/errors';

const PagerComponent: PagerComponentDefinition = {
  type: 'datatable.pager',
  isInput: false,
  name: 'Table Pager',
  icon: <ControlOutlined />,
  Factory: ({ model }) => {
    const { allStyles } = model;
    const jsStyle = allStyles?.jsStyle;
    const fontStyles = allStyles?.fontStyles;
    const stylingBoxAsCSS = allStyles?.stylingBoxAsCSS;
    const store = useDataTableStore(false);
    const { formMode } = useForm();

    const additionalStyles: CSSProperties = removeUndefinedProps({
      ...stylingBoxAsCSS,
      ...fontStyles,
      ...jsStyle,
    });

    const validationResult = useMemo((): IModelValidation | undefined => {
      if (!store) {
        return {
          hasErrors: true,
          componentId: model.id,
          componentName: model.componentName,
          componentType: 'datatable.pager',
          errors: [{
            propertyName: 'No ancestor Data Context component is set',
            error: '\nPlace this component inside a Data Context component to connect it to data',
          }],
        };
      }
      return undefined;
    }, [store, model.id, model.componentName]);

    if (model.hidden) return null;

    const content = <TablePager {...model} style={additionalStyles} />;

    return validationResult?.hasErrors && formMode === 'designer' ? (
      <ErrorIconPopover mode="validation" validationResult={validationResult} type="warning" isDesignerMode={true}>
        {content}
      </ErrorIconPopover>
    ) : content;
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

  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
};

export default PagerComponent;
