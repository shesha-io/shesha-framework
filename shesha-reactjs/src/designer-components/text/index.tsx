import { LineHeightOutlined } from '@ant-design/icons';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import React, { CSSProperties } from 'react';
import { validateConfigurableComponentSettings } from '@/formDesignerUtils';
import { IToolboxComponent } from '@/interfaces/formDesigner';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { ITextTypographyProps } from './models';
import TypographyComponent from './typography';
import { legacyColor2Hex } from '@/designer-components/_common-migrations/migrateColor';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settingsForm';
import { removeUndefinedProps } from '@/utils/object';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { defaultStyles } from './utils';

const TextComponent: IToolboxComponent<ITextTypographyProps> = {
  type: 'text',
  name: 'Text',
  icon: <LineHeightOutlined />,
  isOutput: true,
  isInput: false,
  tooltip: 'Complete Typography component that combines Text, Paragraph and Title',
  Factory: ({ model }) => {
    const { allStyles } = model;
    const shadow = model?.shadow;
    const jsStyle = allStyles?.jsStyle;
    const stylingBoxAsCSS = allStyles?.stylingBoxAsCSS;
    const dimensionsStyles = allStyles?.dimensionsStyles;
    const borderStyles = allStyles?.borderStyles;
    const fontStyles = allStyles?.fontStyles;
    const backgroundStyles = allStyles?.backgroundStyles;

    const additionalStyles: CSSProperties = removeUndefinedProps({
      ...stylingBoxAsCSS,
      ...borderStyles,
      ...fontStyles,
      ...backgroundStyles,
      textShadow: `${shadow?.offsetX}px ${shadow?.offsetY}px ${shadow?.blurRadius}px ${shadow?.color}`,
      ...dimensionsStyles,
      ...jsStyle,
    });

    return (
      <ConfigurableFormItem model={{ ...model, hideLabel: true }}>
        {(value) => (
          <TypographyComponent
            {...model}
            styles={additionalStyles}
            value={model?.contentDisplay === 'name' ? value : model?.content}
          />
        )}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
  initModel: (model) => ({
    code: false,
    copyable: false,
    delete: false,
    ellipsis: false,
    mark: false,
    italic: false,
    underline: false,
    level: 1,
    textType: 'span',
    ...model,
  }),
  migrator: (m) =>
    m
      .add<ITextTypographyProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)) as ITextTypographyProps)
      .add<ITextTypographyProps>(1, (prev) => ({
        ...prev,
        color: legacyColor2Hex(prev.color),
        backgroundColor: legacyColor2Hex(prev.backgroundColor),
      }))
      .add<ITextTypographyProps>(2, (prev) => ({ ...migrateFormApi.properties(prev) }))
      .add<ITextTypographyProps>(3, (prev) => ({ ...migratePrevStyles(prev, defaultStyles(prev.textType)) })),
};

export default TextComponent;
