import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import React from 'react';
import { ArrayFormats, DataTypes } from '@/interfaces/dataTypes';
import { DownSquareOutlined } from '@ant-design/icons';
import { IInputStyles } from '@/providers/form/models';
import { getLegacyReferenceListIdentifier } from '@/utils/referenceList';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { DataSourceType, DropdownComponentDefinition, IDropdownComponentProps } from './model';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { Dropdown } from '@/components/dropdown/dropdown';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settingsForm';
import { migratePrevStyles, migrateStyles } from '../_common-migrations/migrateStyles';
import { defaultStyles, defaultTagStyles } from './utils';
import { useFormComponentStyles } from '@/hooks/formComponentHooks';
import { getBooleanPropertyOrUndefined } from '@/utils/object';
import { isNullOrWhiteSpace } from '@/utils/nullables';

const DropdownComponent: DropdownComponentDefinition = {
  type: 'dropdown',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  isHidden: false,
  name: 'Dropdown',
  icon: <DownSquareOutlined />,
  preserveDimensionsInDesigner: true,
  dataTypeSupported: ({ dataType, dataFormat }) => dataType === DataTypes.referenceListItem || (dataType === DataTypes.array && dataFormat === ArrayFormats.multivalueReferenceList),
  Factory: ({ model }) => {
    const tagStyle = useFormComponentStyles({ ...model.tag }).fullStyle;

    // When enableStyleOnReadonly is true, apply all configured styles in readonly mode
    // When enableStyleOnReadonly is false, apply only minimal styles (font + dimensions)
    const finalStyle = model.readOnly
      ? model.enableStyleOnReadonly
        ? { ...model.allStyles?.fullStyle, overflow: 'auto' }
        : { ...model.allStyles?.fontStyles, ...model.allStyles?.dimensionsStyles }
      : { ...model.allStyles?.fullStyle, overflow: 'auto' };

    return (
      <ConfigurableFormItem<number | number[]> model={model}>
        {(value, onChange, _, ctx) => {
          return (
            <Dropdown
              {...model}
              style={finalStyle}
              value={value ?? undefined}
              size={model.size}
              tagStyle={{ ...tagStyle, alignContent: 'center', justifyContent: tagStyle.textAlign }}
              onChange={(newValue) => {
                // value: CustomLabeledValue<T>, option: any
                // TODO: EVENTS add option to context
                // addContextData(context, { option, value })
                ctx?.handleEvent(undefined, newValue, model.onChangeCustom);
                onChange(newValue ?? null);
              }}
            />
          );
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  migrator: (m) => m
    .add<IDropdownComponentProps>(0, (prev) => ({
      ...prev,
      dataSourceType: "dataSourceType" in prev && typeof (prev.dataSourceType) === "string" && ['simple', 'listItem', 'custom'].includes(prev.dataSourceType) ? prev.dataSourceType as DataSourceType : 'values',
      useRawValues: getBooleanPropertyOrUndefined(prev, "useRawValues") ?? false,
    }))
    .add<IDropdownComponentProps>(1, (prev) => {
      return {
        ...prev,
        referenceListId: getLegacyReferenceListIdentifier(prev.referenceListNamespace, prev.referenceListName) ?? undefined,
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
        : getBooleanPropertyOrUndefined(prev, "useRawValue") === true
          ? 'simple'
          : 'listItem',
      editMode: prev.editMode ?? 'inherited',
    }))
    .add<IDropdownComponentProps>(6, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
    .add<IDropdownComponentProps>(7, (prev) => {
      const styles: IInputStyles = {
        size: prev.size,
        stylingBox: prev.stylingBox,
        style: prev.style,
      };

      return { ...prev, desktop: { ...prev.desktop, ...styles }, tablet: { ...prev.tablet, ...styles }, mobile: { ...prev.mobile, ...styles } };
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
      return { ...prev, desktop: { ...prev.desktop, ...styles }, tablet: { ...prev.tablet, ...styles }, mobile: { ...prev.mobile, ...styles } };
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
    })
    .add<IDropdownComponentProps>(11, (prev) => {
      const result = { ...prev };
      delete result['referenceListNamespace'];
      delete result['referenceListName'];
      const { referenceListId } = result;
      const knownPrefixes = ["Shesha.Framework", "Shesha.Core", "Shesha.Scheduler"];
      if (referenceListId && referenceListId.name && !referenceListId.module && knownPrefixes.some((p) => referenceListId.name.startsWith(p)))
        result.referenceListId = { module: "Shesha", name: referenceListId.name };
      return result;
    }),
  linkToModelMetadata: (model, metadata): IDropdownComponentProps => {
    const isSingleRefList = metadata.dataType === DataTypes.referenceListItem;
    const isMultipleRefList = metadata.dataType === DataTypes.array && metadata.dataFormat === ArrayFormats.multivalueReferenceList;

    return {
      ...model,
      dataSourceType: isSingleRefList || isMultipleRefList ? 'referenceList' : 'values',
      referenceListId: !isNullOrWhiteSpace(metadata.referenceListModule) && !isNullOrWhiteSpace(metadata.referenceListName)
        ? {
          module: metadata.referenceListModule,
          name: metadata.referenceListName,
        }
        : undefined,
      mode: isMultipleRefList ? 'multiple' : 'single',
      valueFormat: 'simple',
    };
  },
};

export default DropdownComponent;
