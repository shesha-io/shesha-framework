import { InputNumber, InputNumberProps, ConfigProvider } from 'antd';
import React, { CSSProperties, FC, useEffect, useMemo, useState } from 'react';
import { customOnChangeValueEventHandler, isValidGuid } from '@/components/formDesigner/components/utils';
import { useSheshaApplication } from '@/providers';
import { getStyle, pickStyleFromModel, useAvailableConstantsData } from '@/providers/form/utils';
import { INumberFieldComponentProps } from './interfaces';
import { IconType, ShaIcon, ValidationErrors } from '@/components';
import { getBackgroundStyle } from '../_settings/utils/background/utils';
import { useStyles } from './styles';
import { getBorderStyle } from '../_settings/utils/border/utils';
import { getFontStyle } from '../_settings/utils/font/utils';
import { getShadowStyle } from '../_settings/utils/shadow/utils';
import { removeUndefinedProps } from '@/utils/object';
import { dimensionStyles, MAX_SAFE_INTEGER } from './utils';

interface IProps {
  disabled: boolean;
  model: INumberFieldComponentProps;
  onChange?: Function;
  value?: number;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
}

const NumberFieldControl: FC<IProps> = ({ disabled, model, onChange, value, onBlur, onFocus }) => {
  const { backendUrl, httpHeaders } = useSheshaApplication();

  const { styles } = useStyles({
    fontFamily: model?.font?.type,
    fontWeight: model?.font?.weight,
    textAlign: model?.font?.align,
  });
  const dimensions = model?.dimensions;
  const border = model?.border;
  const font = model?.font;
  const shadow = model?.shadow;
  const background = model?.background;
  const jsStyle = getStyle(model?.style, model);
  const allData = useAvailableConstantsData();

  const borderStyles = useMemo(() => getBorderStyle(border, jsStyle), [border]);
  const fontStyles = useMemo(() => getFontStyle(font), [font]);
  const [backgroundStyles, setBackgroundStyles] = useState({});
  const shadowStyles = useMemo(() => getShadowStyle(shadow), [shadow]);

  useEffect(() => {
    const fetchStyles = async () => {
      const storedImageUrl =
        background?.storedFile?.id && background?.type === 'storedFile'
          ? await fetch(`${backendUrl}/api/StoredFile/Download?id=${background?.storedFile?.id}`, {
              headers: { ...httpHeaders, 'Content-Type': 'application/octet-stream' },
            })
              .then((response) => {
                return response.blob();
              })
              .then((blob) => {
                return URL.createObjectURL(blob);
              })
          : '';

      const style = await getBackgroundStyle(background, jsStyle, storedImageUrl);
      setBackgroundStyles(style);
    };

    fetchStyles();
  }, [background, background?.gradient?.colors, backendUrl, httpHeaders]);

  if (
    model?.background?.type === 'storedFile' &&
    model?.background.storedFile?.id &&
    !isValidGuid(model?.background.storedFile.id)
  ) {
    return <ValidationErrors error="The provided StoredFileId is invalid" />;
  }

  const styling = JSON.parse(model?.stylingBox || '{}');
  const stylingBoxAsCSS = pickStyleFromModel(styling);

  const additionalStyles: CSSProperties = removeUndefinedProps({
    ...stylingBoxAsCSS,
    ...borderStyles,
    ...fontStyles,
    ...backgroundStyles,
    ...shadowStyles,
  });

  const finalStyle = removeUndefinedProps({
    ...dimensionStyles(dimensions, additionalStyles),
    ...additionalStyles,
  });

  const style = model.style;

  const inputProps: InputNumberProps = {
    className: 'sha-number-field',
    disabled: disabled,
    variant: model.hideBorder ? 'borderless' : undefined,
    min: model?.validate?.minValue ?? 0,
    max: model?.validate?.maxValue ?? MAX_SAFE_INTEGER,
    placeholder: model?.placeholder,
    size: model?.size,
    style: style ? getStyle(style, allData.data, allData.globalState) : { width: '100%' },
    step: model?.highPrecision ? model?.stepNumeric : model?.stepNumeric,
    ...customOnChangeValueEventHandler(model, allData, onChange),
    defaultValue: model?.defaultValue,
    changeOnWheel: false,
    prefix: (
      <>
        {model.prefix}
        {model.prefixIcon && <ShaIcon iconName={model.prefixIcon} style={{ color: 'rgba(0,0,0,.45)' }} />}
      </>
    ),
    suffix: (
      <>
        {model.suffix}
        {model.suffixIcon && <ShaIcon iconName={model.suffixIcon as IconType} style={{ color: 'rgba(0,0,0,.45)' }} />}
      </>
    ),
  };


  return (
    <ConfigProvider
      theme={{
        components: {
          InputNumber: {
            fontFamily: model?.font?.type,
            fontSize: model?.font?.size || 14,
            fontWeightStrong: Number(model.font.weight) ?? 400,
            colorText: model?.font?.color,
          },
        },
      }}
    >
      <InputNumber
        value={value ?? model?.defaultValue}
        {...inputProps}
        stringMode={!model?.highPrecision}
        style={{ ...finalStyle, ...jsStyle }}
        className={`sha-input ${styles.numberField}`}
        onBlur={onBlur}
        onFocus={onFocus}
      />
    </ConfigProvider>
  );
};

export default NumberFieldControl;
