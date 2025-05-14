import { CalendarOutlined } from '@ant-design/icons';
import React, { CSSProperties, Fragment, useEffect, useMemo, useState } from 'react';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { customDateEventHandler } from '@/components/formDesigner/components/utils';
import { IToolboxComponent } from '@/interfaces';
import { DataTypes } from '@/interfaces/dataTypes';
import { IInputStyles } from '@/providers/form/models';
import { getStyle, pickStyleFromModel, useAvailableConstantsData, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { IDateFieldProps } from './interfaces';
import {
  DATE_TIME_FORMATS,
} from './utils';
import { migratePropertyName, migrateCustomFunctions, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { DatePickerWrapper } from './datePickerWrapper';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settingsForm';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { defaultStyles } from '../textField/utils';
import { getBackgroundStyle } from '../_settings/utils/background/utils';
import { getShadowStyle } from '../_settings/utils/shadow/utils';
import { getFontStyle } from '../_settings/utils/font/utils';
import { getDimensionsStyle } from '../_settings/utils/dimensions/utils';
import { useSheshaApplication } from '@/providers';
import { getBorderStyle } from '../_settings/utils/border/utils';
import { removeUndefinedProps } from '@/utils/object';

const DateField: IToolboxComponent<IDateFieldProps> = {
  type: 'dateField',
  name: 'Date field',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  icon: <CalendarOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.date || dataType === DataTypes.dateTime,
  Factory: ({ model }) => {
    const allData = useAvailableConstantsData();

    const localStyle = getStyle(model.style, allData.data);

    const dimensions = model?.dimensions;
    const border = model?.border;
    const font = model?.font;
    const shadow = model?.shadow;
    const background = model?.background;

    const { backendUrl, httpHeaders } = useSheshaApplication();
    const dimensionsStyles = useMemo(() => getDimensionsStyle(dimensions), [dimensions]);
    const borderStyles = useMemo(() => getBorderStyle(border, localStyle), [border]);
    const fontStyles = useMemo(() => getFontStyle(font), [font]);
    const [backgroundStyles, setBackgroundStyles] = useState({});
    const shadowStyles = useMemo(() => getShadowStyle(shadow), [shadow]);


    useEffect(() => {

      const fetchStyles = async () => {
        const storedImageUrl = background?.storedFile?.id && background?.type === 'storedFile'
          ? await fetch(`${backendUrl}/api/StoredFile/Download?id=${background?.storedFile?.id}`,
            { headers: { ...httpHeaders, "Content-Type": "application/octet-stream" } })
            .then((response) => {
              return response.blob();
            })
            .then((blob) => {
              return URL.createObjectURL(blob);
            }) : '';

        const style = await getBackgroundStyle(background, localStyle, storedImageUrl);
        setBackgroundStyles(style);
      };

      fetchStyles();
    }, [background, background?.gradient?.colors, backendUrl, httpHeaders]);


    const styling = JSON.parse(model.stylingBox || '{}');
    const stylingBoxAsCSS = pickStyleFromModel(styling);

    const additionalStyles: CSSProperties = removeUndefinedProps({
      ...stylingBoxAsCSS,
      ...dimensionsStyles,
      ...borderStyles,
      ...fontStyles,
      ...backgroundStyles,
      ...shadowStyles,
    });

    const finalStyle = removeUndefinedProps({ ...localStyle, ...additionalStyles });


    return (
      <Fragment>
        <ConfigurableFormItem model={model}>
          {(value, onChange) => {
            const customEvent = customDateEventHandler(model, allData);
            const onChangeInternal = (...args: any[]) => {
              customEvent.onChange(args[0], args[1]);
              if (typeof onChange === 'function')
                onChange(...args);
            };

            return <DatePickerWrapper {...model} {...customEvent} value={value} onChange={onChangeInternal} additionalStyles={finalStyle} />;
          }}
        </ConfigurableFormItem>
      </Fragment>
    );
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
  initModel: (model) => {
    const customModel: IDateFieldProps = {
      ...model,
      picker: 'date',
      showTime: false,
      dateFormat: DATE_TIME_FORMATS?.date,
      timeFormat: DATE_TIME_FORMATS.time,
      defaultToMidnight: true,
    };
    return customModel;
  },
  migrator: (m) => m
    .add<IDateFieldProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IDateFieldProps>(1, (prev) => migrateVisibility(prev))
    .add<IDateFieldProps>(2, (prev) => migrateReadOnly(prev))
    .add<IDateFieldProps>(3, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
    .add<IDateFieldProps>(4, (prev) => ({
      ...prev,
      showNow: Boolean(prev.showNow || prev['showToday'])
    }))
    .add<IDateFieldProps>(5, (prev) => {
      const styles: IInputStyles = {
        size: prev.size,
        hideBorder: prev.hideBorder,
        style: prev.style
      };

      return { ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles } };
    })
    .add<IDateFieldProps>(6, (prev) => {
      const styles: IInputStyles = {
        size: prev.size,
        width: prev.width,
        height: prev.height,
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
    .add<IDateFieldProps>(7, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) }))
  ,
  linkToModelMetadata: (model, metadata): IDateFieldProps => {

    return {
      ...model,
      dateFormat: !!metadata.dataFormat ? metadata.dataFormat : model.dateFormat,
      showTime: metadata.dataType === DataTypes.date ? false : model.showTime,
    };
  },
};

export default DateField;