/* The migrator reads deprecated/removed model properties (mappings, override, color, valueSource,
   stylingBox) on purpose — upgrading forms saved against those shapes is what it is for. */
/* eslint-disable @typescript-eslint/no-deprecated */
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import { FC, useEffect } from 'react';
import { ArrayFormats, DataTypes } from '@/interfaces/dataTypes';
import { TagOutlined } from '@ant-design/icons';
import { Tag } from 'antd';
import { IInputStyles } from '@/providers/form/models';

import { IStatusTagComponentProps, IStatusTagComponentPropsV0, StatusTagComponentDefinition } from './model';
import { migrateCustomFunctions, migrateHiddenToVisible, migratePropertyName, migrateStylingBoxToJson } from '@/designer-components/_common-migrations/migrateSettings';
import { migratePermissionsToVisiblePermissions } from '../_common-migrations/migratePermissionsToVisiblePermissions';
import { Dropdown } from '@/components/dropdown/dropdown';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settings';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { DEFAULT_STATUS_VALUE, defaultStyles, defaultValues, mappingsToValues } from './utils';
import { useStyles } from './styles';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { useComponentApiProvider } from '@/providers/componentApi/provider';
import { StatusTagApi } from '../../componentsApi/componentApi';
import { useEffectOnce } from '@/hooks/useEffectOnce';
import { getComponentEvents } from '../_common/events';
import { STATUS_TAG_EVENTS_WITHOUT_CHANGE } from './events';

import apiCode from "../../componentsApi/componentApi.ts?raw";

/**
 * Stand-in shown when the component cannot resolve any status at all — currently only when the Data
 * source is a reference list and no list has been chosen.
 *
 * A black tag, per the spec: it is deliberately not one of the status colours, so it cannot be
 * mistaken for a real status, and it is visible rather than blank so the mis-configuration shows up
 * on the form instead of looking like an empty field.
 */
const StatusTagPlaceholder: FC<{ className: string; label: string }> = ({ className, label }) => (
  <div className={className}>
    <Tag color="#000">{label}</Tag>
  </div>
);

const StatusTagComponent: StatusTagComponentDefinition = {
  allowInherit: true,
  type: 'statusTag',
  name: 'Status Tag',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  isHidden: false,
  icon: <TagOutlined />,
  preserveDimensionsInDesigner: true,
  dataTypeSupported: ({ dataType, dataFormat }) =>
    dataType === DataTypes.referenceListItem || (dataType === DataTypes.array && dataFormat === ArrayFormats.multivalueReferenceList),
  Factory: ({ model }) => {
    const componentApi = useComponentApiProvider();
    useEffect(() => {
      componentApi?.updateApi<StatusTagApi>({
        id: model.id,
        componentName: model.componentName ?? "",
        level: 3,
        typeDefinition: { typeName: 'StatusTagApi', files: [{ content: apiCode, fileName: 'apis/componentApi.ts' }] },
        /* Nothing component-specific: `value` and the rest come from the shared interfaces. There
           is no `focus`: the component renders no focusable control. */
        properties: [],
      });
    }, [componentApi, model.componentName, model.id]);
    useEffectOnce(() => () => componentApi?.removeApi(model.id));

    /* The component is the drop-down used purely as a display: `displayStyle: 'tags'` renders the
       value as a tag rather than plain text, and `readOnly` disables the drop-down behaviour
       entirely — no popup, no selection, no clear button. Both are fixed rather than configurable
       (a status tag is a tag by definition, and it shows a status rather than capturing one), and
       both have to be on the model rather than passed as props, because `Dropdown` and its
       reference-list path branch on the model to choose their read-only rendering.

       The read-only path still renders through `ReflistTag`, and it is handed the whole option
       object, so each tag keeps the colour and icon configured for its status. */
    const tagModel = { ...model, displayStyle: 'tags' as const, readOnly: true };

    /* The single style set, scoped onto the tag by the class rather than applied to the wrapper —
       `model.styleCss` (the evaluated Custom style) is folded in here for the same reason: passed
       as an inline `style` it would land on the container, and a class rule on the tag would beat
       it anyway. */
    const { styles } = useStyles({ ...tagModel, customStyle: model.styleCss });

    /* `model.style` is the raw custom-style *expression* (a string), and `styleCss` its evaluated
       form. Both are dropped from the spread: the style set belongs on the tag, which the class
       above handles, so neither may reach the wrapper as an inline style. */
    const { style: _styleExpression, styleCss: _styleCss, ...modelWithoutStyle } = tagModel;

    /* A reference list that was never chosen resolves nothing, so every value would render as an
       empty tag and the form would look merely blank rather than mis-configured. Flagged instead,
       so the problem is visible on the form and in the designer. */
    const isMisconfigured = model.dataSourceType === 'referenceList' && !isDefined(model.referenceListId);
    if (isMisconfigured)
      return <StatusTagPlaceholder className={styles.statusTag} label="NOT CONFIGURED" />;

    return (
      <ConfigurableFormItem<number | number[] | string | string[] | (number | string)[]> model={{ ...model, hideLabel: true }}>
        {(value, _onChange, _propertyName, ctx) => {
          /* The legacy manual Value Source pinned a fixed status; it stands in when the bound
             property is empty so a migrated form keeps showing what it used to. */
          const resolved = isDefined(value) ? value : model.manualValue;

          /* With inline values, the catch-all row stands in whenever the configured values cannot
             produce a tag — both for a value matching no row (what 0.45 rendered as "NOT
             RECOGNISED") and for no value at all, so the component shows its fallback status rather
             than nothing. The select can only display a value that is one of its options, so the
             fallback is selected explicitly here rather than left to antd, which would otherwise
             render an unmatched value as its own label.

             Reference-list rows are fetched rather than local, so "no matching row" cannot be told
             apart from "not loaded yet" — that source is left alone to avoid flashing the fallback
             during load. */
          const options = model.values ?? [];
          const isResolvable = isDefined(resolved) && options.some((option) => option.value === resolved);
          const useFallback = model.dataSourceType === 'values' &&
            !isResolvable &&
            options.some((option) => option.value === DEFAULT_STATUS_VALUE);
          const displayValue = useFallback ? DEFAULT_STATUS_VALUE : resolved;

          return (
            <Dropdown
              {...modelWithoutStyle}
              className={styles.statusTag}
              value={displayValue ?? undefined}
              size={model.size}
              /* Read-only rendering happens outside the select, where the emotion class does not
                 reach, so the style model is handed over as a value for that path. */
              styleValue={model}
              /* No `onChange`, `selectRef` or `popupClassName`: read-only renders no select, so
                 there is nothing to select into, focus, or pop up. */
              events={getComponentEvents<number | number[] | string | string[] | (number | string)[]>(
                model, STATUS_TAG_EVENTS_WITHOUT_CHANGE, ctx, value, DataTypes.array,
              )}
            />
          );
        }}
      </ConfigurableFormItem>
    );
  },
  migrator: (m) => m
    /* Steps 0-2 are the pre-refactor chain, replayed unchanged so a form saved at any of those
       versions lands on the same shape it did before. */
    .add<IStatusTagComponentPropsV0>(0, (prev) => {
      // `prev` is the untyped starting shape here, so the legacy properties are read through V0.
      const prevTyped = prev as IStatusTagComponentPropsV0;
      return {
        ...prevTyped,
        valueSource: prevTyped.valueSource ?? 'manual',
        color: prevTyped.color ?? '',
      };
    })
    .add<IStatusTagComponentPropsV0>(1, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IStatusTagComponentPropsV0>(2, (prev) => ({ ...migrateFormApi.properties(prev) }))
    /* Step 3 turns the old Default Mappings table into the Values data source.
       The old component matched a value against a JSON table it carried in `mappings`, taking the
       label and colour from the matched row; `values` holds those same three fields per row, so the
       table converts across directly and a migrated form keeps rendering the same statuses in the
       same colours. */
    .add<IStatusTagComponentProps>(3, (prev, context) => {
      /* Reads the legacy shape and returns the new one — this is the step that converts between
         them, so `prev` is typed as V0 while the migration is declared against the new model. */
      const prevV0 = prev as unknown as IStatusTagComponentPropsV0;
      /* A new component never carries a legacy mapping table, and `initModel` has already given it
         a data source, so there is nothing to convert. */
      if (context.isNew === true) return prev as IStatusTagComponentProps;

      const { mappings, valueSource, value: configuredValue, override: _override, color: _color, ...rest } = prevV0;

      const values = mappingsToValues(mappings);

      const migrated: IStatusTagComponentProps = {
        ...rest,
        /* Whatever the form already had, so a reference list keeps its source; only the branch
           below may change it. `values` is the fallback for a form that has neither. */
        dataSourceType: prevV0.referenceListId ? 'referenceList' : 'values',
        showItemName: prevV0.showItemName ?? true,
        showIcon: prevV0.showIcon ?? true,
        tagVariant: prevV0.tagVariant ?? 'solid',
      };

      /* Written whenever the table converted, including for a form that also has a reference list:
         the converted rows are kept so switching the Data source to Values shows what the mappings
         used to be, rather than an empty editor. The source itself is decided above. */
      if (isDefined(values))
        migrated.values = values;

      /* Value Source 'manual' pinned the tag to a fixed status rather than reading the bound
         property, and that value is what picked the row out of the mapping table. The setting is
         gone, but the value is kept so the runtime can still fall back to it when the bound
         property is empty — otherwise a manual-source form would silently render nothing. */
      if (valueSource === 'manual' && isDefined(configuredValue))
        migrated.manualValue = configuredValue;

      return migrated;
    })
    /* Step 4 back-fills styles for forms saved before those settings existed, freezing the old
       appearance into the per-device models. A newly dropped component ships empty and inherits
       from the entity model instead, so it is a no-op when `isNew`. */
    .add<IStatusTagComponentProps>(4, (prev, context) => {
      if (context.isNew === true) return prev;

      const styles: IInputStyles = {
        size: prev.size,
        stylingBox: prev.stylingBox,
        style: prev.style,
      };

      return {
        ...prev,
        desktop: { ...prev.desktop, ...styles },
        tablet: { ...prev.tablet, ...styles },
        mobile: { ...prev.mobile, ...styles },
      };
    })
    .add<IStatusTagComponentProps>(5, (prev, context) => context.isNew === true
      ? prev
      : { ...migratePrevStyles(prev, defaultStyles()) })
    /* Hidden -> Visible and permissions -> Visible permissions, in the single chained step the
       standard calls for. `migrateReadOnly` is deliberately absent: the component has no
       Interaction Mode, so there is no editMode for a legacy readOnly flag to migrate into. */
    .add<IStatusTagComponentProps>(6, (prev) =>
      migratePermissionsToVisiblePermissions(migrateHiddenToVisible(migrateStylingBoxToJson(prev)))),
  settingsFormMarkup: getSettings,

  getDefaultStyles: () => defaultStyles(),
  previewConfiguration: {
    type: 'statusTag',
    id: 'statusTag',
    propertyName: 'statusTagAppearance',
    label: 'Status Tag Label',
    version: 'latest',
    dataSourceType: 'values',
    tagVariant: 'solid',
    showItemName: true,
    showIcon: true,
    /* Written out rather than derived from the legacy mapping table: this object is built while the
       module is still evaluating, so a helper call here resolves to `undefined` whenever the module
       graph brings this file in through a cycle. */
    values: [
      { id: 'preview-1', label: 'Completed', value: 1, color: '#87d068' },
      { id: 'preview-2', label: 'In Progress', value: 2, color: '#4DA6FF' },
      { id: 'preview-3', label: 'Overdue', value: 3, color: '#cd201f' },
    ],
  },
  initModel: (model) => ({
    ...model,
    /* Reference List is the default source per the spec. The list itself is left unset so the
       Reference List input starts empty and the user is prompted to choose one. */
    dataSourceType: 'referenceList',
    /* Seeded even though Reference List is the default source, so switching to Values shows the
       same statuses 0.45 put in Default Mappings rather than an empty editor. */
    values: defaultValues(),
    showItemName: true,
    showIcon: true,
    tagVariant: 'solid',
  }),
  linkToModelMetadata: (model, metadata): IStatusTagComponentProps => {
    const isSingleRefList = metadata.dataType === DataTypes.referenceListItem;
    const isMultipleRefList = metadata.dataType === DataTypes.array && metadata.dataFormat === ArrayFormats.multivalueReferenceList;

    return {
      ...model,
      dataSourceType: isSingleRefList || isMultipleRefList ? 'referenceList' : 'values',
      referenceListId: !isNullOrWhiteSpace(metadata.referenceListModule) && !isNullOrWhiteSpace(metadata.referenceListName)
        ? { module: metadata.referenceListModule, name: metadata.referenceListName }
        : undefined,
      enableMultiSelect: isMultipleRefList,
    };
  },
};

export default StatusTagComponent;
