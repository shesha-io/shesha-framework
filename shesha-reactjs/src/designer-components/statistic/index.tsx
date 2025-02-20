import { ValidationErrors } from '@/components';
import { getEventHandlers, isValidGuid } from '@/components/formDesigner/components/utils';
import ShaIcon from '@/components/shaIcon';
import ShaStatistic from '@/components/statistic';
import { IToolboxComponent } from '@/interfaces';
import { IInputStyles, useForm, useFormData, useSheshaApplication } from '@/providers';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { getStyle, pickStyleFromModel, useAvailableConstantsData, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { toSizeCssProp } from '@/utils/form';
import { removeUndefinedProps } from '@/utils/object';
import { BarChartOutlined } from '@ant-design/icons';
import React, { useEffect, useMemo, useState } from 'react';
import { CSSProperties } from 'styled-components';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { getBackgroundStyle } from '../_settings/utils/background/utils';
import { getBorderStyle } from '../_settings/utils/border/utils';
import { getSizeStyle } from '../_settings/utils/dimensions/utils';
import { IFontValue } from '../_settings/utils/font/interfaces';
import { getFontStyle } from '../_settings/utils/font/utils';
import { getShadowStyle } from '../_settings/utils/shadow/utils';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';

interface IStatisticComponentProps extends Omit<IInputStyles, 'font'>, IConfigurableFormComponent {
  value?: number | string;
  precision?: number;
  title?: string | number;
  valueStyle?: string;
  titleStyle?: string;
  prefix?: string;
  suffix?: string;
  prefixIcon?: string;
  suffixIcon?: string;
  titleFont?: IFontValue;
  valueFont?: IFontValue;
  onClick?: () => void;
  onDoubleClick?: () => void;
}

const StatisticComponent: IToolboxComponent<IStatisticComponentProps> = {
  type: 'statistic',
  name: 'Statistic',
  icon: <BarChartOutlined />,
  isInput: true,
  isOutput: true,
  Factory: ({ model: passedModel }) => {
    const { data: formData } = useFormData();
    const { style, valueStyle, titleStyle, prefix, suffix, prefixIcon, suffixIcon, ...model } = passedModel;
    const { backendUrl, httpHeaders } = useSheshaApplication();
    const allData = useAvailableConstantsData();
    const { formMode } = useForm();

    const dimensions = model?.dimensions;
    const border = model?.border;
    const valueFont = model?.valueFont;
    const titleFont = model?.titleFont;
    const shadow = model?.shadow;
    const background = model?.background;
    const jsStyle = getStyle(passedModel?.style, passedModel);

    const dimensionsStyles = useMemo(() => getSizeStyle(dimensions), [dimensions]);
    const borderStyles = useMemo(() => getBorderStyle(border, jsStyle), [border, jsStyle, formData]);
    const valueFontStyles = useMemo(() => getFontStyle(valueFont), [valueFont]);
    const titleFontStyles = useMemo(() => getFontStyle(titleFont), [titleFont]);
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

        const style = await getBackgroundStyle(background, jsStyle, storedImageUrl);
        setBackgroundStyles(style);
      };

      fetchStyles();
    }, [background, background?.gradient?.colors, backendUrl, httpHeaders]);

    if (model?.background?.type === 'storedFile' && model?.background.storedFile?.id && !isValidGuid(model?.background.storedFile.id)) {
      return <ValidationErrors error="The provided StoredFileId is invalid" />;
    }

    const styling = JSON.parse(model?.stylingBox || '{}');
    const stylingBoxAsCSS = pickStyleFromModel(styling);

    const additionalStyles: CSSProperties = removeUndefinedProps({
      height: toSizeCssProp(model?.height),
      width: toSizeCssProp(model?.width),
      borderWidth: model?.hideBorder ? 0 : model?.borderSize,
      borderRadius: model?.borderRadius,
      borderStyle: model?.borderType,
      borderColor: model?.borderColor,
      backgroundColor: model?.backgroundColor,
      ...stylingBoxAsCSS,
      ...dimensionsStyles,
      ...borderStyles,
      ...backgroundStyles,
      ...shadowStyles
    });

    const customEvents = getEventHandlers(model, allData);

    const designerPreviewContent = {
      title: passedModel?.title || "Statistic Title",
      value: passedModel?.value || 1234,
      prefix: passedModel?.prefix || "$",
      suffix: passedModel?.suffix || "USD",
      prefixIcon: passedModel?.prefixIcon || "dollar",
      suffixIcon: passedModel?.suffixIcon || "dollar",
    };

    if (formMode === 'designer') {
      return (
        <ShaStatistic
          value={designerPreviewContent.value}
          precision={passedModel?.precision}
          title={<div style={{ ...titleFontStyles, ...getStyle(titleStyle, formData) }}>{designerPreviewContent.title}</div>}
          prefix={<>{designerPreviewContent.prefix ? <ShaIcon iconName={designerPreviewContent.prefix as any} /> : null}<span style={{ marginRight: 5 }}>{designerPreviewContent.prefix ? designerPreviewContent.prefix : null}</span></>}
          suffix={<>{designerPreviewContent.suffix ? <ShaIcon iconName={designerPreviewContent.suffix as any} /> : null}<span style={{ marginLeft: 5 }}>{designerPreviewContent.suffix ? designerPreviewContent.suffix : null}</span></>}
          style={{ ...getStyle(style, formData), ...additionalStyles }}
          valueStyle={{ ...valueFontStyles, ...getStyle(valueStyle, formData) }}
          onClick={customEvents?.onClick}
        />
      );
    }

    return (
      <ShaStatistic
        value={passedModel?.value || 0}
        precision={passedModel?.precision}
        title={<div style={{ ...titleFontStyles, ...getStyle(titleStyle, formData) }}>{passedModel?.title}</div>}
        prefix={<>{prefixIcon ? <ShaIcon iconName={prefixIcon as any} /> : null}<span style={{ marginRight: 5 }}>{prefix ? prefix : null}</span></>}
        suffix={<>{suffixIcon ? <ShaIcon iconName={suffixIcon as any} /> : null}<span style={{ marginLeft: 5 }}>{suffix ? suffix : null}</span></>}
        style={{ ...getStyle(style, formData), ...additionalStyles }}
        valueStyle={{ ...valueFontStyles, ...getStyle(valueStyle, formData) }}
        onClick={customEvents?.onClick}
      />
    );
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
  migrator: (m) => m
    .add<IStatisticComponentProps>(1, (prev) => ({ ...migrateFormApi.properties(prev) }))
    .add<IStatisticComponentProps>(2, (prev) => {
      const styles = {
        style: prev?.style,
        valueStyle: prev?.valueStyle,
        titleStyle: prev?.titleStyle,
        hideBorder: prev?.hideBorder,
      };

      return { ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles } };
    })
    .add<IStatisticComponentProps>(3, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) })),
};

export default StatisticComponent;