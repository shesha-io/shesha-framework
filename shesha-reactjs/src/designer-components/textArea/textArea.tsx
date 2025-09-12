import { IToolboxComponent } from '@/interfaces';
import { FormMarkup, IInputStyles } from '@/providers/form/models';
import { FontColorsOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import { TextAreaProps } from 'antd/lib/input';
import settingsFormJson from './settingsForm.json';
import React, { CSSProperties } from 'react';
import {
  evaluateString,
  getStyle,
  pickStyleFromModel,
  useAvailableConstantsData,
  validateConfigurableComponentSettings,
} from '@/providers/form/utils';
import { DataTypes, StringFormats } from '@/interfaces/dataTypes';
import { ITextAreaComponentProps } from './interfaces';
import { ConfigurableFormItem } from '@/components';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { getEventHandlers } from '@/components/formDesigner/components/utils';
import {
  migratePropertyName,
  migrateCustomFunctions,
  migrateReadOnly,
} from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { toSizeCssProp } from '@/utils/form';
import { removeUndefinedProps } from '@/utils/object';

const settingsForm = settingsFormJson as FormMarkup;

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
    });
    const jsStyle = getStyle(model.style, allData.data);
    const finalStyle = removeUndefinedProps({ ...jsStyle, ...additionalStyles });

    const textAreaProps: TextAreaProps = {
      className: 'sha-text-area',
      placeholder: model.placeholder,
      autoSize: model.autoSize ? { minRows: 2 } : false,
      showCount: model.showCount,
      maxLength: model.validate?.maxLength,
      allowClear: model.allowClear,
      variant: model.hideBorder ? 'borderless' : undefined,
      size: model?.size,
      style: { ...finalStyle, marginBottom: model?.showCount ? '16px' : 0 },
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
            if (typeof onChange === 'function') onChange(...args);
            customEvents.onChange(args[0]);
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
      }),
  settingsFormMarkup: settingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
};

export default TextAreaComponent;
