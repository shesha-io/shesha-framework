import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import React, { useEffect, useRef } from 'react';
import { ArrayFormats, DataTypes } from '@/interfaces/dataTypes';
import { DownSquareOutlined } from '@ant-design/icons';
import { IInputStyles, INestedStyleValue, IStyleValue } from '@/providers/form/models';
import { getLegacyReferenceListIdentifier } from '@/utils/referenceList';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { DataSourceType, DropdownComponentDefinition, IDropdownComponentProps } from './model';
import { DropdownSelectRef } from '@/components/dropdown/model';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly, migrateHiddenToVisible } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migratePermissionsToVisiblePermissions } from '../_common-migrations/migratePermissionsToVisiblePermissions';
import { Dropdown } from '@/components/dropdown/dropdown';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settingsForm';
import { migratePrevStyles, migrateStyles } from '../_common-migrations/migrateStyles';
import { defaultStyles, defaultTagStyles } from './utils';
import { useStyles } from './styles';
import { getBooleanPropertyOrUndefined } from '@/utils/object';
import { isDefined, isNotNullOrWhiteSpace, isNullOrWhiteSpace } from '@/utils/nullables';
import { useComponentApi } from '@/providers/componentApi/provider';
import { DropdownApi } from '../../componentsApi/componentApi';
import { useEffectOnce } from '@/hooks/useEffectOnce';
import { SELECT_EVENTS_WITHOUT_CHANGE, getComponentEvents } from '../_common/events';

import apiCode from "../../componentsApi/componentApi.ts?raw";

const DropdownComponent: DropdownComponentDefinition = {
  allowInherit: true,
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
    const componentApi = useComponentApi();
    const selectRef = useRef<DropdownSelectRef>(null);
    useEffect(() => {
      componentApi?.updateApi<DropdownApi>({
        id: model.id,
        componentName: model.componentName ?? "",
        level: 3,
        typeDefinition: { typeName: 'DropdownApi', files: [{ content: apiCode, fileName: 'apis/componentApi.ts' }] },
        properties: [],
        api: { focus: () => selectRef.current?.focus() },
      });
    }, [componentApi, model.componentName, model.id]);
    useEffectOnce(() => () => componentApi?.removeApi(model.id));

    const { styles } = useStyles(model);

    // `model.style` is the raw custom-style *expression* (a string); the select's `style` prop takes
    // a CSSProperties object. Drop it from the spread so only the evaluated `styleJson` can land there.
    const { style: _styleExpression, ...modelWithoutStyle } = model;

    return (
      <ConfigurableFormItem<number | number[] | string | string[] | (number | string)[]> model={model}>
        {(value, onChange, _, ctx) => {
          return (
            <Dropdown
              {...modelWithoutStyle}
              className={styles.dropdown}
              // Custom style is passed through as-is; everything else is emitted as CSS by `useStyles`
              // so unset properties keep cascading from the theme.
              {...(isDefined(model.styleJson) ? { style: model.styleJson } : {})}
              value={value ?? undefined}
              size={model.size}
              // Read-only rendering happens outside the select, where the emotion class does not
              // reach, so the style model is handed over as a value for that path.
              styleValue={model}
              selectRef={selectRef}
              onChange={(newValue) => {
                // value: CustomLabeledValue<T>, option: any
                // TODO: EVENTS add option to context
                // addContextData(context, { option, value })
                ctx?.handleEvent(undefined, { value: newValue }, model.onChangeCustom);
                onChange(newValue ?? null);
              }}
              events={getComponentEvents<number | number[] | string | string[] | (number | string)[]>(
                model, SELECT_EVENTS_WITHOUT_CHANGE, ctx, value, DataTypes.array,
              )}
            />
          );
        }}
      </ConfigurableFormItem>
    );
  },
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
        (context.isNew === true
          ? 'simple'
          : getBooleanPropertyOrUndefined(prev, "useRawValue") === true
            ? 'simple'
            : 'listItem'),
      editMode: prev.editMode ?? 'inherited',
    }))
    .add<IDropdownComponentProps>(6, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
    // Steps 7-10 back-fill styles and property defaults for forms saved before those settings
    // existed. A newly dropped component ships empty and inherits from the entity model instead,
    // so each of them is a no-op when `isNew`.
    .add<IDropdownComponentProps>(7, (prev, context) => {
      if (context.isNew === true) return prev;

      const styles: IInputStyles = {
        size: prev.size,
        stylingBox: prev.stylingBox,
        style: prev.style,
      };

      return { ...prev, desktop: { ...prev.desktop, ...styles }, tablet: { ...prev.tablet, ...styles }, mobile: { ...prev.mobile, ...styles } };
    })
    .add<IDropdownComponentProps>(8, (prev, context) => {
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
      };
      return { ...prev, desktop: { ...prev.desktop, ...styles }, tablet: { ...prev.tablet, ...styles }, mobile: { ...prev.mobile, ...styles } };
    })
    .add<IDropdownComponentProps>(9, (prev, context) => context.isNew === true
      ? prev
      : { ...migratePrevStyles(prev, defaultStyles()) })
    .add<IDropdownComponentProps>(10, (prev, context) => {
      if (context.isNew === true) return prev;

      const initTagStyle = migrateStyles({}, defaultTagStyles());
      // The per-device style models are typed as the flat `IStyleValue`; the dropdown additionally
      // nests a `tag` set under each of them.
      const deviceTag = (device: IStyleValue | undefined): IStyleValue | undefined =>
        (device as INestedStyleValue<'tag'> | undefined)?.tag;

      // Seeded only where nothing is configured yet — a form that already styled its tags keeps
      // those values rather than being reset to the defaults on every upgrade.
      return {
        ...prev,
        tag: prev.tag ?? { ...initTagStyle },
        showItemName: prev.showItemName ?? true,
        showIcon: prev.showIcon ?? true,
        solidColor: prev.solidColor ?? true,
        displayStyle: prev.displayStyle ?? 'text',
        desktop: { ...prev.desktop, tag: deviceTag(prev.desktop) ?? { ...initTagStyle } },
        tablet: { ...prev.tablet, tag: deviceTag(prev.tablet) ?? { ...initTagStyle } },
        mobile: { ...prev.mobile, tag: deviceTag(prev.mobile) ?? { ...initTagStyle } },
      };
    })
    .add<IDropdownComponentProps>(11, (prev) => {
      const result = { ...prev };
      delete result['referenceListNamespace'];
      delete result['referenceListName'];
      const { referenceListId } = result;
      const knownPrefixes = ["Shesha.Framework", "Shesha.Core", "Shesha.Scheduler"];
      if (isDefined(referenceListId) &&
        isNotNullOrWhiteSpace(referenceListId.name) &&
        isNullOrWhiteSpace(referenceListId.module) &&
        knownPrefixes.some((p) => referenceListId.name.startsWith(p)))
        result.referenceListId = { module: "Shesha", name: referenceListId.name };
      return result;
    })
    .add<IDropdownComponentProps>(12, (prev) => ({ ...prev, mode: prev.mode ?? 'single' }))
    .add<IDropdownComponentProps>(13, (prev) => migratePermissionsToVisiblePermissions(migrateHiddenToVisible(prev))),
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  getDefaultStyles: () => defaultStyles(),
  previewConfiguration: {
    type: 'dropdown',
    id: 'dropdown',
    propertyName: `dropdownAppearance`,
    label: `Dropdown Label`,
    version: 'latest',
    dataSourceType: 'values',
    mode: 'single',
    values: [
      { id: 'preview-1', label: 'Option 1', value: '1' },
      { id: 'preview-2', label: 'Option 2', value: '2' },
    ],
  },
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
