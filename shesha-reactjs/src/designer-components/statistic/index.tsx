import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import { ShaIcon, IconType } from '@/components/shaIcon';
import ShaStatistic from '@/components/statistic';
import { IToolboxComponent } from '@/interfaces';
import { IInputStyles } from '@/providers';
import { IConfigurableFormComponent } from '@/providers/form/models';
import {
  getStyle, validateConfigurableComponentSettings,
} from '@/providers/form/utils';
import { removeUndefinedProps } from '@/utils/object';
import { BarChartOutlined } from '@ant-design/icons';
import React, { useMemo } from 'react';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { IFontValue } from '../_settings/utils/font/interfaces';
import { getFontStyle } from '../_settings/utils/font/utils';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';

interface IStatisticComponentProps extends Omit<IInputStyles, 'font'>, IConfigurableFormComponent {
  value?: number | string | undefined;
  precision?: number | undefined;
  title?: string | number | undefined;
  placeholder?: string | undefined;
  valueStyle?: string | undefined;
  titleStyle?: string | undefined;
  prefix?: string | undefined;
  suffix?: string | undefined;
  prefixIcon?: string | undefined;
  suffixIcon?: string | undefined;
  titleFont?: IFontValue | undefined;
  valueFont?: IFontValue | undefined;
  onClick?: (() => void) | undefined;
  onDoubleClick?: (() => void) | undefined;
  borderSize?: string | number | undefined;
  borderRadius?: string | number | undefined;
  borderColor?: string | undefined;
}

const StatisticComponent: IToolboxComponent<IStatisticComponentProps> = {
  type: 'statistic',
  name: 'Statistic',
  icon: <BarChartOutlined />,
  isInput: true,
  isOutput: true,
  preserveDimensionsInDesigner: ["height"],
  Factory: ({ model: passedModel }) => {
    const { style, valueStyle, titleStyle, prefix, suffix, prefixIcon, suffixIcon, ...model } = passedModel;
    const { allStyles } = model;
    const valueFont = model.valueFont;
    const titleFont = model.titleFont;
    const valueStyles = getStyle(valueStyle);
    const titleStyles = getStyle(titleStyle);
    const valueFontStyles = useMemo(() => getFontStyle(valueFont), [valueFont]);
    const titleFontStyles = useMemo(() => getFontStyle(titleFont), [titleFont]);

    return (
      <ConfigurableFormItem<number | string>
        model={{ ...model, hideLabel: true }}
        valuePropName="checked"
      >
        {(value, _, __, ctx) => {
          return (
            <ShaStatistic
              value={(value || passedModel.value || passedModel.placeholder) ?? ""}
              {...(passedModel.precision ? { precision: passedModel.precision } : {})}
              title={<div style={removeUndefinedProps({ ...titleFontStyles, ...titleStyles })}>{passedModel.title}</div>}
              prefix={(
                <div>
                  {passedModel.prefixIcon && <ShaIcon iconName={prefixIcon as IconType} />}
                  <span style={{ marginLeft: 5 }}>{prefix ? prefix : null}</span>
                </div>
              )}
              suffix={(
                <div>
                  <span style={{ marginRight: 5 }}>
                    {suffix}
                    {suffixIcon && <ShaIcon iconName={suffixIcon} />}
                  </span>
                </div>
              )}
              style={removeUndefinedProps({ ...allStyles?.fullStyle })}
              styles={{
                content: removeUndefinedProps({
                  ...valueFontStyles,
                  ...valueStyles,
                  ...(!(value || passedModel.value) && { opacity: 0.5, color: '#999' }),
                }),
              }}
              onClick={(event) => {
                ctx?.handleEvent(event, undefined, model.onClickCustom);
              }}
            />
          );
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  migrator: (m) =>
    m
      .add<IStatisticComponentProps>(1, (prev) => ({ ...migrateFormApi.properties(prev) }))
      .add<IStatisticComponentProps>(2, (prev) => {
        const styles = {
          style: prev.style,
          valueFont: defaultStyles().valueFont,
          valueStyle: prev.valueStyle,
          titleFont: defaultStyles().titleFont,
          titleStyle: prev.titleStyle,
          hideBorder: prev.hideBorder,
          shadow: defaultStyles().shadow,
          border: {
            border: defaultStyles().border?.border,
          },
        };

        return {
          ...prev,
          placeholder: 'R 1,234.00',
          desktop: { ...styles },
          tablet: { ...styles },
          mobile: { ...styles },
        };
      })
      .add<IStatisticComponentProps>(3, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) })),
};

export default StatisticComponent;
