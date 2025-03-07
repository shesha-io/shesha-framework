import { IToolboxComponent } from '@/interfaces';
import { IInputStyles } from '@/providers/form/models';
import { FontColorsOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import { TextAreaProps } from 'antd/lib/input';
import React, { CSSProperties, useEffect, useMemo, useState } from 'react';
import {
  evaluateString,
  getStyle,
  pickStyleFromModel,
  useAvailableConstantsData,
  validateConfigurableComponentSettings,
} from '@/providers/form/utils';
import { DataTypes, StringFormats } from '@/interfaces/dataTypes';
import { ITextAreaComponentProps } from './interfaces';
import { ConfigurableFormItem, ValidationErrors } from '@/components';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { getEventHandlers, isValidGuid } from '@/components/formDesigner/components/utils';
import {
  migratePropertyName,
  migrateCustomFunctions,
  migrateReadOnly,
} from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { toSizeCssProp } from '@/utils/form';
import { removeUndefinedProps } from '@/utils/object';
import { getSettings } from './settingsForm';
import { getSizeStyle } from '../_settings/utils/dimensions/utils';
import { getBorderStyle } from '../_settings/utils/border/utils';
import { getFontStyle } from '../_settings/utils/font/utils';
import { getShadowStyle } from '../_settings/utils/shadow/utils';
import { useSheshaApplication } from '@/providers';
// import { useStyles } from '../codeEditor/styles';
import { getBackgroundStyle } from '../_settings/utils/background/utils';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { defaultStyles } from './utils';

interface IJsonTextAreaProps {
  value?: any;
  textAreaProps?: TextAreaProps;
  customEventHandler?: any;
}
const JsonTextArea: React.FC<IJsonTextAreaProps> = (props) => {
  const valuedString = !!props.value ? JSON.stringify(props.value, null, 2) : '';
  return (
    <Input.TextArea value={valuedString} rows={2} {...props.textAreaProps} disabled {...props.customEventHandler} />
  );
};

const TextAreaComponent: IToolboxComponent<ITextAreaComponentProps> = {
  type: 'textArea',
  name: 'Text Area',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  icon: <FontColorsOutlined />,
  dataTypeSupported: ({ dataType, dataFormat }) =>
    dataType === DataTypes.string && dataFormat === StringFormats.multiline,
  Factory: ({ model }) => {
    const allData = useAvailableConstantsData();

    const { backendUrl, httpHeaders } = useSheshaApplication();

    const dimensions = model?.dimensions;
    const border = model?.border;
    const font = model?.font;
    const shadow = model?.shadow;
    const background = model?.background;
    const jsStyle = getStyle(model.style, model);

    const dimensionsStyles = useMemo(() => getSizeStyle(dimensions), [dimensions]);
    const borderStyles = useMemo(() => getBorderStyle(border, jsStyle), [model.border]);
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

        const style = await getBackgroundStyle(background, jsStyle, storedImageUrl);
        setBackgroundStyles(style);
      };

      fetchStyles();
    }, [background, background?.gradient?.colors, backendUrl, httpHeaders]);

    if (model?.background?.type === 'storedFile' && model?.background.storedFile?.id && !isValidGuid(model?.background.storedFile.id)) {
      return <ValidationErrors error="The provided StoredFileId is invalid" />;
    }

    const styling = JSON.parse(model.stylingBox || '{}');
    const stylingBoxAsCSS = pickStyleFromModel(styling);

    const additionalStyles: CSSProperties = removeUndefinedProps({
      height: toSizeCssProp(model.height),
      width: toSizeCssProp(model.width),
      borderWidth: model.hideBorder ? 0 : model.borderSize,
      borderRadius: model.borderRadius,
      borderStyle: model.borderType,
      borderColor: model.borderColor,
      backgroundColor: model.backgroundColor,
      color: model.fontColor,
      fontWeight: model.fontWeight,
      fontSize: model.fontSize,
      ...stylingBoxAsCSS,
      ...dimensionsStyles,
      ...borderStyles,
      ...fontStyles,
      ...backgroundStyles,
      ...shadowStyles
    });

    const finalStyle = removeUndefinedProps({ ...additionalStyles, ...jsStyle });

    const textAreaProps: TextAreaProps = {
      className: 'sha-text-area',
      placeholder: model.placeholder,
      autoSize: model.autoSize ? { minRows: 2 } : false,
      showCount: model.showCount,
      maxLength: model.validate?.maxLength,
      allowClear: model.allowClear,
      variant: model?.border?.hideBorder ? 'borderless' : undefined,
      size: model?.size,
      style: { 
        ...finalStyle, 
        ...((!finalStyle?.marginBottom || finalStyle.marginBottom === '0px' || finalStyle.marginBottom === 0 || finalStyle.marginBottom === '0') 
          ? { marginBottom: model?.showCount ? '16px' : '0px' }
          : {})
      },
      spellCheck: model.spellCheck,
    };

    return (
      <ConfigurableFormItem
        model={model}
        initialValue={
          (model?.passEmptyStringByDefault && '') ||
          (model.initialValue
            ? evaluateString(model?.initialValue, {
              formData: allData.data,
              formMode: allData.form.formMode,
              globalState: allData.globalState,
            })
            : undefined)
        }
      >
        {(value, onChange) => {
          const showAsJson = Boolean(value) && typeof value === 'object';

          const customEvents = getEventHandlers(model, allData);
          const onChangeInternal = (...args: any[]) => {
            customEvents.onChange(args[0]);
            if (typeof onChange === 'function') onChange(...args);
          };

          return showAsJson ? (
            <JsonTextArea value={value} textAreaProps={textAreaProps} customEventHandler={customEvents} />
          ) : model.readOnly ? (
            <ReadOnlyDisplayFormItem value={value} />
          ) : (
            <Input.TextArea
              rows={2}
              {...textAreaProps}
              disabled={model.readOnly}
              {...customEvents}
              value={value}
              onChange={onChangeInternal}
            />
          );
        }}
      </ConfigurableFormItem>
    );
  },
  initModel: (model) => {
    const textAreaModel: ITextAreaComponentProps = {
      ...model,
      label: 'Text Area',
      autoSize: false,
      showCount: false,
      allowClear: false,
    };

    return textAreaModel;
  },
  migrator: (m) =>
    m
      .add<ITextAreaComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<ITextAreaComponentProps>(1, (prev) => migrateVisibility(prev))
      .add<ITextAreaComponentProps>(2, (prev) => migrateReadOnly(prev))
      .add<ITextAreaComponentProps>(3, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
      .add<ITextAreaComponentProps>(4, (prev) => {
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
          style: prev.style,
        };
        return { ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles } };
      })
      .add<ITextAreaComponentProps>(5, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) }))
  ,
  linkToModelMetadata: (model, _): ITextAreaComponentProps => {
    return {
      ...model,
    };
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
};

export default TextAreaComponent;