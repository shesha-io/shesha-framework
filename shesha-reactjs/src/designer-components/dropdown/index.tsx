import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import React from 'react';
import { customDropDownEventHandler } from '@/components/formDesigner/components/utils';
import { ArrayFormats, DataTypes } from '@/interfaces/dataTypes';
import { DownSquareOutlined } from '@ant-design/icons';
import { IInputStyles } from '@/providers/form/models';
import { getLegacyReferenceListIdentifier } from '@/utils/referenceList';
import { evaluateString, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { IDropdownComponentProps } from './model';
import { IToolboxComponent } from '@/interfaces';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { Dropdown } from '@/components/dropdown/dropdown';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settingsForm';
import { migratePrevStyles, migrateStyles } from '../_common-migrations/migrateStyles';
import { defaultStyles, defaultTagStyles } from './utils';
import { CustomLabeledValue } from '@/components/refListDropDown/models';
import { useFormComponentStyles } from '@/hooks/formComponentHooks';

interface ITextFieldComponentCalulatedValues {
  eventHandlers?: { onChange: (value: CustomLabeledValue<any>, option: any) => any };
  defaultValue?: any;
}

const DropdownComponent: IToolboxComponent<IDropdownComponentProps, ITextFieldComponentCalulatedValues> = {
  type: 'dropdown',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  isHidden: false,
  name: 'Dropdown',
  icon: <DownSquareOutlined />,
  dataTypeSupported: ({ dataType, dataFormat }) => dataType === DataTypes.referenceListItem || dataType === DataTypes.array && dataFormat === ArrayFormats.multivalueReferenceList,
  calculateModel: (model, allData) => ({
    eventHandlers: customDropDownEventHandler(model, allData),
    // quick fix not to default to empty string or null while working with multi-mode
    defaultValue: Array.isArray(model.defaultValue)
      ? model.defaultValue
      : model.defaultValue
        ? evaluateString(model.defaultValue, { formData: allData.data, formMode: allData.form.formMode, globalState: allData.globalState }) || undefined
        : undefined,
  }),
  Factory: ({ model, calculatedModel }) => {
    const initialValue = model?.defaultValue ? { initialValue: model.defaultValue } : {};
    const tagStyle = useFormComponentStyles({ ...model.tag }).fullStyle;

    const finalStyle = model.enableStyleOnReadonly && model.readOnly
      ? { ...model.allStyles.fontStyles, ...model.allStyles.dimensionsStyles }
      : { ...model.allStyles.fullStyle, width: '100%', height: '100%', overflow: 'hidden',

      };

    return (
      <ConfigurableFormItem model={model} {...initialValue}>
        {(value, onChange) => {
          const customEvent = calculatedModel.eventHandlers;
          const onChangeInternal = (...args: any[]) => {
            customEvent.onChange(args[0], args[1]);
            if (typeof onChange === 'function')
              onChange(...args);
          };

          return <Dropdown
            {...model}
            style={finalStyle}
            {...customEvent}
            defaultValue={calculatedModel.defaultValue}
            value={value}
            size={model?.size}
            tagStyle={{ ...tagStyle, alignContent: 'center', justifyContent: tagStyle.textAlign }}
            onChange={onChangeInternal}
          />;
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
  migrator: (m) => m
    .add<IDropdownComponentProps>(0, (prev) => ({
      ...prev,
      dataSourceType: prev['dataSourceType'] ?? 'values',
      useRawValues: prev['useRawValues'] ?? false,
    }))
    .add<IDropdownComponentProps>(1, (prev) => {
      return {
        ...prev,
        referenceListId: getLegacyReferenceListIdentifier(prev.referenceListNamespace, prev.referenceListName),
      };
    })
    .add<IDropdownComponentProps>(2, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IDropdownComponentProps>(3, (prev) => migrateVisibility(prev))
    .add<IDropdownComponentProps>(4, (prev) => migrateReadOnly(prev))
    .add<IDropdownComponentProps>(5, (prev, context) => ({
      ...prev,
      valueFormat: prev.valueFormat ??
        context.isNew
        ? 'simple'
        : prev['useRawValue'] === true
          ? 'simple'
          : 'listItem',
      editMode: prev?.editMode ?? 'inherited',
    }))
    .add<IDropdownComponentProps>(6, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
    .add<IDropdownComponentProps>(7, (prev) => {
      const styles: IInputStyles = {
        size: prev.size,
        stylingBox: prev.stylingBox,
        style: prev.style,
      };

      return { ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles } };
    })
    .add<IDropdownComponentProps>(8, (prev) => {
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
    .add<IDropdownComponentProps>(9, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) }))
    .add<IDropdownComponentProps>(10, (prev) => {
      const initTagStyle = migrateStyles({}, defaultTagStyles());

      return {
        ...prev,
        tag: { ...initTagStyle },
        showItemName: prev.showItemName ?? true,
        showIcon: prev.showIcon ?? true,
        solidColor: prev.solidColor ?? true,
        displayStyle: prev.displayStyle ?? 'text',
        desktop: { ...prev.desktop, tag: { ...initTagStyle } },
        tablet: { ...prev.tablet, tag: { ...initTagStyle } },
        mobile: { ...prev.mobile, tag: { ...initTagStyle } },
      };
    }),
  linkToModelMetadata: (model, metadata): IDropdownComponentProps => {
    const isSingleRefList = metadata.dataType === DataTypes.referenceListItem;
    const isMultipleRefList = metadata.dataType === DataTypes.array && metadata.dataFormat === ArrayFormats.multivalueReferenceList;

    return {
      ...model,
      dataSourceType: isSingleRefList || isMultipleRefList ? 'referenceList' : 'values',
      referenceListId: {
        module: metadata.referenceListModule,
        name: metadata.referenceListName,
      },
      mode: isMultipleRefList ? 'multiple' : 'single',
      valueFormat: 'simple',
    };
  },
};

export default DropdownComponent;
