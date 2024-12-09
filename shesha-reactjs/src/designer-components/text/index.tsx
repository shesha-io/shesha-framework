import { LineHeightOutlined } from '@ant-design/icons';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import React, { CSSProperties, useMemo } from 'react';
import { validateConfigurableComponentSettings } from '@/formDesignerUtils';
import { IToolboxComponent } from '@/interfaces/formDesigner';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { ITextTypographyProps } from './models';
import TypographyComponent from './typography';
import { legacyColor2Hex } from '@/designer-components/_common-migrations/migrateColor';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settingsForm';
import { getBorderStyle } from '../_settings/utils/border/utils';
import { getStyle, IInputStyles, pickStyleFromModel } from '@/index';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { defaultStyles } from '../textField/utils';
import { removeUndefinedProps } from '@/utils/object';
import { ConfigProvider, InputProps } from 'antd';
import { getFontStyle } from '../_settings/utils/font/utils';
import { getShadowStyle } from '../_settings/utils/shadow/utils';
import { getSizeStyle } from '../_settings/utils/dimensions/utils';

const TextComponent: IToolboxComponent<ITextTypographyProps> = {
  type: 'text',
  name: 'Text',
  icon: <LineHeightOutlined />,
  isOutput: true,
  isInput: false,
  tooltip: 'Complete Typography component that combines Text, Paragraph and Title',
  Factory: ({ model }) => {
    const data = model;
    const font = model?.font;
    const border = model?.border;
    const shadow = model?.shadow;
    const dimensions = model?.dimensions;
    const jsStyle = getStyle(model.style, data);
    
    const backgroundStyles = getStyle(model.backgroundColor, data);
    const dimensionsStyles = useMemo(() => getSizeStyle(dimensions), [dimensions]);
    const shadowStyles = useMemo(() => getShadowStyle(shadow), [shadow]);
    const fontStyles = useMemo(() => getFontStyle(font), [font]);
    const borderStyles = useMemo(() => getBorderStyle(border, jsStyle), [border]);
    const styling = JSON.parse(model.stylingBox || '{}');
    const stylingBoxAsCSS = pickStyleFromModel(styling);
    const additionalStyles: CSSProperties = removeUndefinedProps({
        ...stylingBoxAsCSS,
      ...borderStyles,
      ...fontStyles,
      ...backgroundStyles,
      ...shadowStyles,
      ...dimensionsStyles
    });
    const finalStyle = removeUndefinedProps({ ...additionalStyles, fontWeight: Number(model?.font?.weight?.split(' - ')[0]) || 400 });

    const inputProps: InputProps = removeUndefinedProps({ 
      variant: model?.border?.hideBorder ? 'borderless' : undefined,
      size: model.size,
      disabled: model.readOnly,
      readOnly: model.readOnly,
      style: { ...finalStyle, ...jsStyle },
      maxLength: model.validate?.maxLength,
      max: model.validate?.maxLength,
      minLength: model.validate?.minLength,
      datatype: model.dataType,
      content: model.content,
      font: model.font,
      textAlign: model.font.align,
    });

    
    return (
      <ConfigurableFormItem model={{ ...model, hideLabel: true }}>
        {(value) => (
          <ConfigProvider
          theme={{
            components: {
              Input: {
                fontFamily: model?.font?.type,
                fontSize: model?.font?.size,
                fontWeightStrong: Number(fontStyles.fontWeight)
              },
            },
          }}
        >
          <TypographyComponent
            {...inputProps}
            contentDisplay={model?.contentDisplay}
            textType={model?.textType}
            value={model?.contentDisplay === 'name' ? value : model?.content}
          />
        </ConfigProvider>
        )}
      </ConfigurableFormItem>
    );
    
  }

  ,
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
  initModel: model => ({
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
  migrator: (m) => m
    .add<ITextTypographyProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)) as ITextTypographyProps)
    .add<ITextTypographyProps>(1, (prev) => ({ ...prev, color: legacyColor2Hex(prev.color), backgroundColor: legacyColor2Hex(prev.backgroundColor)}))
    .add<ITextTypographyProps>(2, (prev) => ({...migrateFormApi.properties(prev)}))
    .add<ITextTypographyProps>(5, (prev) => {
      const styles: IInputStyles = {
        size: prev.size,
        hideBorder: prev.hideBorder,
        borderSize: prev.borderSize,
        borderRadius: prev.borderRadius,
        borderColor: prev.borderColor,
        fontSize: prev.fontSize,
        fontColor: prev.fontColor,
        backgroundColor: prev.backgroundColor,
        stylingBox: prev.stylingBox,
      };
      return { ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles } };
    })
    .add<ITextTypographyProps>(6, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) }))
  ,
};

export default TextComponent;
