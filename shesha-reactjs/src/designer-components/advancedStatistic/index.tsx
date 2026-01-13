import { ConfigurableFormItem } from '@/components';
import { customOnClickEventHandler, getEventHandlers } from '@/components/formDesigner/components/utils';
import ShaAdvancedStatistic from '@/components/advancedStatistic';
import { IToolboxComponent } from '@/interfaces';
import { IInputStyles, useForm } from '@/providers';
import { IConfigurableFormComponent } from '@/providers/form/models';
import {
  getStyle,
  useAvailableConstantsData,
  validateConfigurableComponentSettings,
} from '@/providers/form/utils';
import { removeUndefinedProps } from '@/utils/object';
import { BarChartOutlined } from '@ant-design/icons';
import React, { useMemo, CSSProperties } from 'react';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { IFontValue } from '../_settings/utils/font/interfaces';
import { getFontStyle } from '../_settings/utils/font/utils';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';

interface IIconConfig {
  icon?: string;
  size?: number;
  color?: string;
  style?: string;
}

interface IPrefixSuffixConfig {
  text?: string;
  icon?: string;
  color?: string;
  iconSize?: number;
  style?: string;
}

interface IAdvancedStatisticComponentProps extends Omit<IInputStyles, 'font'>, IConfigurableFormComponent {
  value?: number | string;
  precision?: number;

  // Side icons
  leftIcon?: IIconConfig;
  leftIconStyle?: string;
  rightIcon?: IIconConfig;
  rightIconStyle?: string;

  // Title
  titleText?: string;
  titlePosition?: 'top' | 'bottom';
  titleAlign?: 'left' | 'center' | 'right';
  titleFont?: IFontValue;
  titleStyle?: string;

  // Prefix and suffix
  valuePrefix?: IPrefixSuffixConfig;
  valuePrefixStyle?: string;
  suffix?: IPrefixSuffixConfig;
  suffixStyle?: string;

  // Value styling
  valueFont?: IFontValue;
  valueStyle?: string;

  // Container
  containerStyle?: string;

  // Events
  onClick?: () => void;
  onDoubleClick?: () => void;
}

const AdvancedStatisticComponent: IToolboxComponent<IAdvancedStatisticComponentProps> = {
  type: 'advancedStatistic',
  name: 'Advanced Statistic',
  icon: <BarChartOutlined />,
  isInput: true,
  isOutput: true,
  Factory: ({ model: passedModel }) => {
    const allData = useAvailableConstantsData();
    const { formMode } = useForm();
    const { allStyles } = passedModel;

    // Access properties directly from passedModel
    const valueFont = passedModel?.valueFont;
    const valueStyle = passedModel?.valueStyle;
    const containerStyle = passedModel?.containerStyle;

    // For nested objects, merge common properties with style properties
    const leftIcon = passedModel?.leftIcon;
    const rightIcon = passedModel?.rightIcon;
    const prefix = passedModel?.valuePrefix;
    const suffix = passedModel?.suffix;

    // Title - text/align/position from root level, font from responsive properties
    const titlePosition = passedModel?.titlePosition || 'top';
    const title = {
      text: passedModel?.titleText,
      align: passedModel?.titleAlign,
      font: passedModel?.titleFont,
      style: passedModel?.titleStyle,
    };

    const valueStyles = getStyle(valueStyle);
    const containerStyles = getStyle(containerStyle);
    const titleStyles = getStyle(title?.style);
    const leftIconStyles = getStyle(passedModel?.leftIconStyle);
    const rightIconStyles = getStyle(passedModel?.rightIconStyle);
    const prefixStyles = getStyle(passedModel?.valuePrefixStyle);
    const suffixStyles = getStyle(passedModel?.suffixStyle);

    const valueFontStyles = useMemo(() => getFontStyle(valueFont), [valueFont]);
    const titleFontStyles = useMemo(() => getFontStyle(title?.font), [title?.font]);

    const customEvents = getEventHandlers(passedModel, allData);

    const renderComponent = (value: any): React.ReactElement => {
      const customEvent = customOnClickEventHandler(passedModel, allData);
      const onClickInternal = (_: any): void => {
        customEvent.onClick(value);
      };

      const mergedLeftIcon = leftIcon?.icon ? {
        ...leftIcon,
        style: removeUndefinedProps(leftIconStyles) as CSSProperties,
      } : undefined;

      const mergedRightIcon = rightIcon?.icon ? {
        ...rightIcon,
        style: removeUndefinedProps(rightIconStyles) as CSSProperties,
      } : undefined;

      const mergedTitle = title?.text ? {
        ...title,
        style: removeUndefinedProps({
          ...titleFontStyles,
          ...titleStyles,
        }) as CSSProperties,
      } : undefined;

      const topTitle = titlePosition === 'top' ? mergedTitle : undefined;
      const bottomTitle = titlePosition === 'bottom' ? mergedTitle : undefined;

      const mergedPrefix = (prefix?.text || prefix?.icon) ? {
        ...prefix,
        style: removeUndefinedProps(prefixStyles) as CSSProperties,
      } : undefined;

      const mergedSuffix = (suffix?.text || suffix?.icon) ? {
        ...suffix,
        style: removeUndefinedProps(suffixStyles) as CSSProperties,
      } : undefined;

      return (
        <ShaAdvancedStatistic
          value={value || passedModel?.value}
          precision={passedModel?.precision}
          leftIcon={mergedLeftIcon}
          rightIcon={mergedRightIcon}
          topTitle={topTitle}
          bottomTitle={bottomTitle}
          prefix={mergedPrefix}
          suffix={mergedSuffix}
          valueFont={valueFont}
          valueStyle={removeUndefinedProps({
            ...valueFontStyles,
            ...valueStyles,
            ...(!(value || passedModel?.value) && { opacity: 0.5, color: '#999' }),
          })}
          containerStyle={removeUndefinedProps({
            ...allStyles.fullStyle,
            ...containerStyles,
          })}
          {...customEvents}
          onClick={onClickInternal}
        />
      );
    };

    if (formMode === 'designer') {
      return (
        <ConfigurableFormItem
          model={{ ...passedModel, hideLabel: true }}
          valuePropName="checked"
        >
          {(value, _) => renderComponent(value)}
        </ConfigurableFormItem>
      );
    }

    return (
      <ConfigurableFormItem
        model={{ ...passedModel, hideLabel: true }}
        valuePropName="checked"
      >
        {(value) => renderComponent(value)}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  migrator: (m) =>
    m
      .add<IAdvancedStatisticComponentProps>(1, (prev) => ({ ...migrateFormApi.properties(prev) }))
      .add<IAdvancedStatisticComponentProps>(2, (prev) => {
        const styles = {
          containerStyle: prev?.containerStyle,
          valueFont: defaultStyles().valueFont,
          valueStyle: prev?.valueStyle,
          titleFont: defaultStyles().titleFont,
          shadow: defaultStyles().shadow,
          border: defaultStyles().border,
        };

        return {
          ...prev,
          desktop: { ...styles },
          tablet: { ...styles },
          mobile: { ...styles },
        };
      }),
};

export default AdvancedStatisticComponent;
