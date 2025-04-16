import { IToolboxComponent } from '@/interfaces';
import { IInputStyles } from '@/providers/form/models';
import { FontColorsOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import { TextAreaProps } from 'antd/lib/input';
import React, { CSSProperties } from 'react';
import { evaluateString, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { DataTypes, StringFormats } from '@/interfaces/dataTypes';
import { ITextAreaComponentProps } from './interfaces';
import { ConfigurableFormItem, ValidationErrors } from '@/components';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { EventHandlerAttributes, getEventHandlers, isValidGuid } from '@/components/formDesigner/components/utils';
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

interface ITextFieldComponentCalulatedValues {
  defaultValue?: string;
  eventHandlers?: EventHandlerAttributes<any>;
}

const TextAreaComponent: IToolboxComponent<ITextAreaComponentProps, ITextFieldComponentCalulatedValues> = {
  type: 'textArea',
  name: 'Text Area',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  icon: <FontColorsOutlined />,
  dataTypeSupported: ({ dataType, dataFormat }) =>
    dataType === DataTypes.string && dataFormat === StringFormats.multiline,
  calculateModel: (model, allData) => {
    return {
      defaultValue: model.initialValue
        ? evaluateString(model?.initialValue, { formData: allData.data, formMode: allData.form.formMode, globalState: allData.globalState })
        : undefined,
      eventHandlers: getEventHandlers(model, allData)
    };
  },
  Factory: ({ model, calculatedModel }) => {
    if (model?.background?.type === 'storedFile' && model?.background.storedFile?.id && !isValidGuid(model?.background.storedFile.id)) {
      return <ValidationErrors error="The provided StoredFileId is invalid" />;
    }

    const { styles } = useStyles({
      fontWeight: model.font.weight,
      fontFamily: model.font.type,
      textAlign: model.fullStyle?.textAlign,
      color: model.fullStyle?.color,
      fontSize: model.fullStyle?.fontSize,
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
      ...model.appearanceStyle,
    });

    const finalStyle = removeUndefinedProps({ ...additionalStyles, ...model.jsStyle });

    const textAreaProps: TextAreaProps = {
      className: `sha-text-area ${styles.textArea}`,
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
        initialValue={calculatedModel.defaultValue}
      >
        {(value, onChange) => {
          const showAsJson = Boolean(value) && typeof value === 'object';

          const customEvents = calculatedModel.eventHandlers;
          const onChangeInternal = (...args: any[]) => {
            customEvents.onChange(args[0]);
            if (typeof onChange === 'function') onChange(...args);
          };

          return showAsJson 
            ? <JsonTextArea value={value} textAreaProps={textAreaProps} customEventHandler={customEvents} />
            : model.readOnly 
              ? <ReadOnlyDisplayFormItem value={value} />
              : <Input.TextArea rows={2} {...textAreaProps} disabled={model.readOnly} {...customEvents} value={value} onChange={onChangeInternal}/>
          ;
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