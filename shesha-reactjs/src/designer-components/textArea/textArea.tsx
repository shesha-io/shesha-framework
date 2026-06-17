import { IInputStyles } from '@/providers/form/models';
import { FontColorsOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import { TextAreaProps } from 'antd/lib/input';
import React, { CSSProperties, FocusEventHandler, ReactNode } from 'react';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { DataTypes, StringFormats } from '@/interfaces/dataTypes';
import { ITextAreaComponentProps, TextAreaComponentDefinition } from './interfaces';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
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
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { defaultStyles } from './utils';
import { useStyles } from './styles';
import { getOverflowStyle } from '../_settings/utils/overflow/util';
import { isDefined } from '@/utils/nullables';

interface IJsonTextAreaProps {
  value?: object;
  textAreaProps?: TextAreaProps;
  onFocus?: FocusEventHandler<HTMLTextAreaElement> | undefined;
  onBlur?: FocusEventHandler<HTMLTextAreaElement> | undefined;
}
const JsonTextArea: React.FC<IJsonTextAreaProps> = (props) => {
  const valuedString = isDefined(props.value) ? JSON.stringify(props.value, null, 2) : '';
  return (
    <Input.TextArea
      value={valuedString}
      rows={2}
      {...props.textAreaProps}
      disabled
      onFocus={props.onFocus}
      onBlur={props.onBlur}
    />
  );
};

type TextAreaValueType = string | object | undefined;

const TextAreaComponent: TextAreaComponentDefinition = {
  type: 'textArea',
  name: 'Text Area',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  preserveDimensionsInDesigner: true,
  icon: <FontColorsOutlined />,
  dataTypeSupported: ({ dataType, dataFormat }) =>
    dataType === DataTypes.string && dataFormat === StringFormats.multiline,
  Factory: ({ model }) => {
    const { styles } = useStyles({
      fontWeight: model.font?.weight,
      fontFamily: model.font?.type,
      textAlign: model.allStyles?.fullStyle.textAlign,
      color: model.allStyles?.fullStyle.color,
      fontSize: model.allStyles?.fullStyle.fontSize,
    });

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
      ...model.allStyles?.appearanceStyle,
    });

    const finalStyle = removeUndefinedProps({ ...additionalStyles, ...model.allStyles?.jsStyle });

    const textAreaProps: TextAreaProps = {
      className: `sha-text-area ${styles.textArea}`,
      placeholder: model.placeholder,
      autoSize: model.autoSize ? { minRows: 2 } : false,
      showCount: false, // will use a custom counter outside the textarea
      maxLength: model.validate?.maxLength,
      size: model.size,
      style: {
        ...finalStyle,
        ...getOverflowStyle(true, false),
        ...((!finalStyle.marginBottom || finalStyle.marginBottom === '0px' || finalStyle.marginBottom === 0 || finalStyle.marginBottom === '0')
          ? { marginBottom: model.showCount ? '4px' : '0px' }
          : {}),
      },
      spellCheck: model.spellCheck ?? false,
    };
    if (model.border?.hideBorder)
      textAreaProps.variant = 'borderless';
    if (model.allowClear)
      textAreaProps.allowClear = model.allowClear;

    return (
      <ConfigurableFormItem<TextAreaValueType>
        model={model}
        autoAlignLabel={false}
      >
        {(value, onChange, _, ctx) => {
          // Character count display component
          const renderCharCounter = (): ReactNode => {
            if (!model.showCount) return null;

            const currentLength = typeof value === 'string' ? value.length : 0;
            const maxLength = model.validate?.maxLength;

            return (
              <div style={{
                textAlign: 'right',
                fontSize: '14px',
                color: maxLength && currentLength > maxLength ? '#ff4d4f' : '#8c8c8c',
                marginTop: '0px',
                marginBottom: '0px',
                width: model.allStyles?.dimensionsStyles.width,
                minWidth: model.allStyles?.dimensionsStyles.minWidth,
                maxWidth: model.allStyles?.dimensionsStyles.maxWidth,
              }}
              >
                {currentLength}
                {maxLength ? `/${maxLength}` : ''}
              </div>
            );
          };

          const finalStyle = !model.enableStyleOnReadonly && model.readOnly
            ? {
              ...model.allStyles?.fontStyles,
              ...model.allStyles?.dimensionsStyles,
              ...getOverflowStyle(true, false),
            }
            : { ...model.allStyles?.fullStyle, ...getOverflowStyle(true, false) };

          return (
            <>
              {isDefined(value) && typeof value === 'object' ? (
                <>
                  <JsonTextArea
                    value={value}
                    textAreaProps={textAreaProps}
                    onFocus={(event) => ctx?.handleEvent(event, event.currentTarget.value, model.onFocusCustom)}
                    onBlur={(event) => ctx?.handleEvent(event, event.currentTarget.value, model.onBlurCustom)}
                  />
                  {renderCharCounter()}
                </>
              ) : model.readOnly ? ( // no need to show counter in read only mode
                <ReadOnlyDisplayFormItem value={value} style={{ padding: 8, ...finalStyle }} type="textArea" />
              ) : (
                <>
                  <Input.TextArea
                    rows={2}
                    {...textAreaProps}
                    disabled={model.readOnly}
                    value={value ?? ""}

                    // TODO EVENTS
                    onChange={(event) => {
                      ctx?.handleEvent(event, event.currentTarget.value, model.onChangeCustom);
                      onChange(event.currentTarget.value);
                    }}
                    onFocus={(event) => ctx?.handleEvent(event, event.currentTarget.value, model.onFocusCustom)}
                    onBlur={(event) => ctx?.handleEvent(event, event.currentTarget.value, model.onBlurCustom)}
                  />
                  {renderCharCounter()}
                </>
              )}
            </>
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
      .add<ITextAreaComponentProps>(5, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) })),
  linkToModelMetadata: (model, _): ITextAreaComponentProps => {
    return {
      ...model,
    };
  },
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
};

export default TextAreaComponent;
