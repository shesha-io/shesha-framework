import { IToolboxComponent } from '@/interfaces';
import { LineOutlined } from '@ant-design/icons';
import React, { useMemo } from 'react';
import { getStyle, getLayoutStyle, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { useFormData, useGlobalState } from '@/providers';
import SectionSeparator from '@/components/sectionSeparator';
import { ISectionSeparatorComponentProps } from './interfaces';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settingsForm';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { getFontStyle } from '../_settings/utils/font/utils';
import { defaultStyles } from './utils';

const SectionSeparatorComponent: IToolboxComponent<ISectionSeparatorComponentProps> = {
  type: 'sectionSeparator',
  isInput: false,
  name: 'Section Separator',
  icon: <LineOutlined />,
  Factory: ({ model }) => {
    const { data: formData } = useFormData();
    const { globalState } = useGlobalState();
    const { lineFont, font } = model;
    const fontStyles = useMemo(() => getFontStyle(font), [font]);

    const inputProps = {
      ...model,
      lineThickness: lineFont?.size,
      lineColor: lineFont?.color,
    };
    if (model.hidden) return null;

    return (
      <SectionSeparator
        {...inputProps}
        title={!model.hideLabel && model.label}
        containerStyle={getLayoutStyle({ ...model, style: model?.containerStyle }, { data: formData, globalState })}
        titleStyle={{ ...fontStyles, ...getStyle(model?.titleStyle, formData) }}
        tooltip={model?.description}
      />
    );
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
  initModel: (model) => {
    return {
      ...model,
      label: 'Section',
      lineThickness: 2,
      labelAlign: 'left',
      orientation: 'horizontal',
    };
  },
  migrator: (m) =>
    m
      .add<ISectionSeparatorComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<ISectionSeparatorComponentProps>(1, (prev) => ({ ...migrateFormApi.properties(prev) }))
      .add<ISectionSeparatorComponentProps>(2, (prev) => ({ ...prev, labelAlign: 'left' }))
      .add<ISectionSeparatorComponentProps>(3, (prev) => ({ ...prev, titleMargin: prev['noMargin'] ? 0 : null }))
      .add<ISectionSeparatorComponentProps>(4, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) })),
};

export default SectionSeparatorComponent;
