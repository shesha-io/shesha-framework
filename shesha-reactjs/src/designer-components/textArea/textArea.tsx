import { IInputStyles } from '@/providers/form/models';
import { FontColorsOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import { TextAreaProps, TextAreaRef } from 'antd/lib/input/TextArea';
import { FocusEventHandler, ReactNode, useEffect, useRef } from 'react';
import * as React from 'react';

import { DataTypes, StringFormats } from '@/interfaces/dataTypes';
import { ITextAreaComponentProps, TextAreaComponentDefinition } from './interfaces';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import {
  migratePropertyName,
  migrateCustomFunctions,
  migrateReadOnly,
  migrateHiddenToVisible,
  migrateStylingBoxToJson,
} from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migratePermissionsToVisiblePermissions } from '../_common-migrations/migratePermissionsToVisiblePermissions';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settingsForm';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { defaultStyles } from './utils';
import { useStyles } from './styles';
import { getOverflowStyle } from '../_settings/utils/overflow/util';
import { ALL_INPUT_EVENTS_WITHOUT_CHANGE, getComponentEvents } from '../_common/events';
import { useComponentApiProvider } from '@/providers/componentApi/provider';
import { TextAreaApi } from '@/componentsApi/componentApi';
import { isDefined } from '@/utils/nullables';

import apiCode from "../../componentsApi/componentApi.ts?raw";

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
  styleGroup: 'inputs',
  allowInherit: true,
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
    const componentApi = useComponentApiProvider();
    const inputRef = useRef<TextAreaRef>(null);
    useEffect(() => {
      const apiId = model.id;
      componentApi?.updateApi<TextAreaApi>({
        id: apiId,
        componentName: model.componentName ?? "",
        level: 3,
        typeDefinition: { typeName: 'TextAreaApi', files: [{ content: apiCode, fileName: 'apis/componentApi.ts' }] },
        api: { focus: () => inputRef.current?.focus() },
      });

      return () => {
        componentApi?.removeApi(apiId);
      };
    }, [componentApi, model.componentName, model.id]);

    const { styles } = useStyles(model);

    const textAreaProps: TextAreaProps = {
      classNames: {
        // With allowClear/suffix antd renders an affix wrapper and `root` lands on it; that
        // wrapper then owns the visible border/background. Both elements get the appearance
        // class, and the stylesheet decides which one actually paints it — see styles.ts.
        root: styles.textAreaWrapper,
        textarea: isDefined(model.allowClear) && model.allowClear ? '' : `sha-text-area ${styles.textArea}`,
      },
      placeholder: model.placeholder,
      autoSize: model.autoSize === true ? { minRows: 2 } : false,
      showCount: false, // will use a custom counter outside the textarea
      maxLength: model.validate?.maxLength,
      size: model.size,
      style: {
        ...getOverflowStyle(true, false),
        ...(isDefined(model.styleCss) ? model.styleCss : {}),
      },
      spellCheck: model.spellCheck ?? false,
    };
    if (model.border?.hideBorder === true)
      textAreaProps.variant = 'borderless';
    if (model.allowClear === true)
      textAreaProps.allowClear = model.allowClear;

    return (
      <ConfigurableFormItem<TextAreaValueType>
        model={model}
        autoAlignLabel={false}
      >
        {(value, onChange, _, ctx) => {
          // Character count display component
          const renderCharCounter = (): ReactNode => {
            if (model.showCount !== true) return null;

            const currentLength = typeof value === 'string' ? value.length : 0;
            const maxLength = model.validate?.maxLength;

            return (
              <div style={{
                textAlign: 'right',
                fontSize: '14px',
                color: isDefined(maxLength) && currentLength > maxLength ? '#ff4d4f' : '#8c8c8c',
                marginTop: '0px',
                marginBottom: '0px',
                width: model.dimensions?.width,
                minWidth: model.dimensions?.minWidth,
                maxWidth: model.dimensions?.maxWidth,
              }}
              >
                {currentLength}
                {isDefined(maxLength) ? `/${maxLength}` : ''}
              </div>
            );
          };

          return (
            <>
              {isDefined(value) && typeof value === 'object' ? (
                <>
                  <JsonTextArea
                    value={value}
                    textAreaProps={textAreaProps}
                    onFocus={(event) => ctx?.handleEvent(event, { value }, model.onFocusCustom)}
                    onBlur={(event) => ctx?.handleEvent(event, { value }, model.onBlurCustom)}
                  />
                  {renderCharCounter()}
                </>
              ) : model.readOnly === true ? ( // no need to show counter in read only mode
                <ReadOnlyDisplayFormItem
                  value={value}
                  type="textArea"
                  enableFullStyle={model.enableStyleOnReadonly}
                  style={{ padding: 8, ...getOverflowStyle(true, false), ...model.styleCss }}
                  styleValue={model}
                />
              ) : (
                <>
                  <Input.TextArea
                    ref={inputRef}
                    rows={2}
                    {...textAreaProps}
                    disabled={model.disabled === true}
                    value={value ?? ""}
                    onChange={(event) => {
                      ctx?.handleEvent(event, { value: event.currentTarget.value }, model.onChangeCustom);
                      onChange(event.currentTarget.value);
                    }}
                    {...getComponentEvents<TextAreaValueType>(model, ALL_INPUT_EVENTS_WITHOUT_CHANGE, ctx, value, DataTypes.string)}
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
  settingsFormMarkup: getSettings,

  getDefaultStyles: () => defaultStyles(),
  migrator: (m) =>
    m
      .add<ITextAreaComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<ITextAreaComponentProps>(1, (prev) => migrateVisibility(prev))
      .add<ITextAreaComponentProps>(2, (prev) => migrateReadOnly(prev))
      .add<ITextAreaComponentProps>(3, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
      .add<ITextAreaComponentProps>(4, (prev, context) => {
        if (context.isNew === true) return prev;

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
      .add<ITextAreaComponentProps>(5, (prev, context) => context.isNew === true
        ? prev
        : { ...migratePrevStyles(prev, defaultStyles()) })
      .add<ITextAreaComponentProps>(6, (prev) => migrateHiddenToVisible(migrateStylingBoxToJson(prev)))
      .add<ITextAreaComponentProps>(7, (prev) => migratePermissionsToVisiblePermissions(prev)),
  linkToModelMetadata: (model, _): ITextAreaComponentProps => {
    return {
      ...model,
    };
  },
  previewConfiguration: {
    type: 'textArea',
    id: 'textArea',
    propertyName: `textAreaAppearance`,
    label: `Text Area Label`,
    version: 'latest',
    autoSize: false,
    showCount: false,
    allowClear: false,
  },
};

export default TextAreaComponent;
