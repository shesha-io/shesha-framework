/* The migrator reads deprecated model properties (referenceListNamespace/Name, valueFormat,
   stylingBox) on purpose — upgrading forms saved against those shapes is what it is for. */
/* eslint-disable @typescript-eslint/no-deprecated */
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import { CSSProperties, useEffect, useRef } from 'react';
import { ArrayFormats, DataTypes } from '@/interfaces/dataTypes';
import { DownSquareOutlined } from '@ant-design/icons';
import { IInputStyles, INestedStyleValue, IStyleValue } from '@/providers/form/models';
import { getLegacyReferenceListIdentifier } from '@/utils/referenceList';

import { DataSourceType, DropdownComponentDefinition, IDropdownComponentProps, IDropdownComponentPropsV1 } from './model';
import { DropdownSelectRef } from '@/components/dropdown/model';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly, migrateHiddenToVisible, migrateStylingBoxToJson } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migratePermissionsToVisiblePermissions } from '../_common-migrations/migratePermissionsToVisiblePermissions';
import { Dropdown } from '@/components/dropdown/dropdown';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settingsForm';
import { migratePrevStyles, migrateStyles } from '../_common-migrations/migrateStyles';
import { defaultStyles, defaultTagStyles } from './utils';
import { useStyles } from '@/components/dropdown/styles';
import { getBooleanPropertyOrUndefined } from '@/utils/object';
import { isDefined, isNotNullOrWhiteSpace, isNullOrWhiteSpace } from '@/utils/nullables';
import { useComponentApi } from '@/providers/componentApi/provider';
import { DropdownApi } from '../../componentsApi/componentApi';
import { useEffectOnce } from '@/hooks/useEffectOnce';
import { useActualContextExecution } from '@/hooks/formComponentHooks';
import { ALL_INPUT_EVENTS_WITHOUT_CHANGE_AND_DOUBLE_CLICK, getComponentEvents } from '../_common/events';

import apiCode from "../../componentsApi/componentApi.ts?raw";

/* The colours step 10 seeded into `tag` before the Variant owned them. Migration 15 clears these. */
const SEEDED_TAG_BACKGROUND = '#f0f0f0';
const SEEDED_TAG_BORDER = { width: '1px', style: 'solid', color: '#d9d9d9' };
const SEEDED_TAG_FONT_COLOUR = '#000';

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

    // The framework only executes the root `style` expression (into `styleJson`); a nested
    // `tag.style` script is not evaluated for us, so it would be a setting that saves but never
    // renders. Evaluate it here and hand the result to the style builder.
    const tagStyleJson = useActualContextExecution<CSSProperties>(model.tag?.style, undefined, {});

    const { styles } = useStyles({ ...model, tagStyleJson });

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
              popupClassName={styles.popup}
              // Custom style is passed through as-is; everything else is emitted as CSS by `useStyles`
              // so unset properties keep cascading from the theme.
              {...(isDefined(model.styleCss) ? { style: model.styleCss } : {})}
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
                model, ALL_INPUT_EVENTS_WITHOUT_CHANGE_AND_DOUBLE_CLICK, ctx, value, DataTypes.array,
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
    .add<IDropdownComponentPropsV1>(10, (prev, context) => {
      if (context.isNew === true) return prev;

      const initTagStyle = migrateStyles({}, defaultTagStyles());
      // The per-device style models are typed as the flat `IStyleValue`; the dropdown additionally
      // nests a `tag` set under each of them.
      const deviceTag = (device: INestedStyleValue<'tag'> | undefined): IStyleValue | undefined =>
        device?.tag;

      // Seeded only where nothing is configured yet — a form that already styled its tags keeps
      // those values rather than being reset to the defaults on every upgrade.
      return {
        ...prev,
        tag: prev.tag ?? { ...initTagStyle },
        showItemName: prev.showItemName ?? true,
        showIcon: prev.showIcon ?? true,
        /* solidColor is no longer seeded here: step 14 folds it into tagVariant and treats an unset
           value as 'solid', which is what this step used to default it to. A form that stored the
           boolean explicitly still carries it through the spread above. */
        displayStyle: prev.displayStyle ?? 'text',
        desktop: { ...prev.desktop, tag: deviceTag(prev.desktop) ?? { ...initTagStyle } },
        tablet: { ...prev.tablet, tag: deviceTag(prev.tablet) ?? { ...initTagStyle } },
        mobile: { ...prev.mobile, tag: deviceTag(prev.mobile) ?? { ...initTagStyle } },
      };
    })
    .add<IDropdownComponentPropsV1>(11, (prev) => {
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
    .add<IDropdownComponentPropsV1>(12, (prev) => ({ ...prev, mode: prev.mode ?? 'single' }))
    .add<IDropdownComponentPropsV1>(13, (prev) => migratePermissionsToVisiblePermissions(migrateHiddenToVisible(migrateStylingBoxToJson(prev))))
    .add<IDropdownComponentPropsV1>(14, (prev) => {
      const { solidColor: _removed, ...rest } = prev;
      const model: IDropdownComponentProps = { ...rest };

      // Mode -> Enable Multi-Select. 'tags' counts as multi-select; `mode` is left in place so the
      // runtime can still distinguish it.
      model.enableMultiSelect = prev.enableMultiSelect ?? (prev.mode === 'multiple' || prev.mode === 'tags');

      /* Value Format -> Binding Format. 'simple' and 'listItem' both resolve to the item value, so
         they map to 'itemValue'; 'itemLabel' is new and cannot have existed before.

         A saved 'custom' config is deliberately left WITHOUT a bindingFormat: Binding Format has no
         equivalent for user JS, and the runtime checks bindingFormat before valueFormat, so setting
         it here would silently stop incomeCustomJs/outcomeCustomJs from running. */
      if (prev.valueFormat !== 'custom') {
        model.bindingFormat = prev.bindingFormat ?? 'itemValue';
      }

      /* Show Solid Color -> Variant, and solidColor is dropped from the model above. The boolean only
         distinguished solid from outlined, so those are the only two values an existing form can
         migrate to; 'filled' is new. An unset boolean means a form that never stored the setting,
         which takes the same 'solid' default the old code applied. */
      model.tagVariant = prev.tagVariant ?? (prev.solidColor === false ? 'outlined' : 'solid');

      return model;
    })
    /* Step 10 seeded tag colours that beat antd's Variant rules, and saved forms still carry them.
       Only values still equal to those seeds are cleared — a restyled tag keeps what the user set. */
    .add<IDropdownComponentProps>(15, (prev, context) => {
      if (context.isNew === true) return prev;

      const clearSeededTagColours = (style: IStyleValue | undefined): IStyleValue | undefined => {
        if (!isDefined(style)) return style;

        const result: IStyleValue = { ...style };

        if (result.background?.type === 'color' && result.background.color === SEEDED_TAG_BACKGROUND)
          result.background = { ...result.background, color: '' };

        const sides = result.border?.border;
        const line = sides?.all;
        if (isDefined(sides) && isDefined(line) && line.width === SEEDED_TAG_BORDER.width && line.style === SEEDED_TAG_BORDER.style && line.color === SEEDED_TAG_BORDER.color) {
          const { all: _cleared, ...otherSides } = sides;
          result.border = { ...result.border, border: otherSides };
        }

        if (result.font?.color === SEEDED_TAG_FONT_COLOUR) {
          const { color: _cleared, ...otherFont } = result.font;
          result.font = otherFont;
        }

        return result;
      };

      // The per-device models nest their own `tag` set, the same shape step 10 seeded.
      const clearDeviceTagColours = (device: INestedStyleValue<'tag'> | undefined): INestedStyleValue<'tag'> | undefined => {
        if (!isDefined(device) || !isDefined(device.tag)) return device;
        return { ...device, tag: clearSeededTagColours(device.tag) };
      };

      return {
        ...prev,
        tag: clearSeededTagColours(prev.tag),
        desktop: clearDeviceTagColours(prev.desktop),
        tablet: clearDeviceTagColours(prev.tablet),
        mobile: clearDeviceTagColours(prev.mobile),
      };
    }),
  settingsFormMarkup: getSettings,

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
