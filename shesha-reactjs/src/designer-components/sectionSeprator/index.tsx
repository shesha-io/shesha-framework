import SectionSeparator from '@/components/sectionSeparator';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { IToolboxComponent } from '@/interfaces';
import { useFormData } from '@/providers';
import { getStyle, pickStyleFromModel, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { LineOutlined } from '@ant-design/icons';
import React, { useMemo } from 'react';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { getFontStyle } from '../_settings/utils/font/utils';
import { ISectionSeparatorComponentProps } from './interfaces';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';

const SectionSeparatorComponent: IToolboxComponent<ISectionSeparatorComponentProps> = {
  type: 'sectionSeparator',
  isInput: false,
  name: 'Section Separator',
  icon: <LineOutlined />,
  Factory: ({ model }) => {
    const { data: formData } = useFormData();
    const { lineFont, font } = model;
    const fontStyles = useMemo(() => getFontStyle(font), [font]);

    const styling = JSON.parse(model.titleStylingBox || '{}');
    const stylingBoxAsCSS = pickStyleFromModel(styling);

    const titleAdditionalStyles = {
      ...stylingBoxAsCSS,
      ...fontStyles,
      ...getStyle(model?.titleStyle, formData),
    };

    const containerstyling = JSON.parse(model.containerStylingBox || '{}');
    const containerstylingBoxAsCSS = pickStyleFromModel(containerstyling);

    const containerAdditionalStyles = {
      ...containerstylingBoxAsCSS,
      ...getStyle(model?.containerStyle, formData),
    };

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
        containerStyle={containerAdditionalStyles}
        titleStyle={titleAdditionalStyles}
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
      .add<ISectionSeparatorComponentProps>(4, (prev) => ({
        ...prev,
        desktop: { ...prev.desktop, lineFont: { size: 2 }, lineWidth: '100%' },
      }))
      .add<ISectionSeparatorComponentProps>(5, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) })),
};

export default SectionSeparatorComponent;
