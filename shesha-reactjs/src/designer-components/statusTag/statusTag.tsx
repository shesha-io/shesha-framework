/* The migrator reads deprecated/removed model properties (mappings, override, color, valueSource,
   stylingBox) on purpose — upgrading forms saved against those shapes is what it is for. */
/* eslint-disable @typescript-eslint/no-deprecated */
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import { FC, PropsWithChildren, useEffect } from 'react';
import { ArrayFormats, DataTypes } from '@/interfaces/dataTypes';
import { TagOutlined } from '@ant-design/icons';
import { Alert, Tag, Tooltip } from 'antd';
import { IInputStyles } from '@/providers/form/models';
import { useForm } from '@/providers';

import { IStatusTagComponentProps, IStatusTagComponentPropsV0, StatusTagComponentDefinition } from './model';
import { IStatusMap } from '@/components/statusTag';
import { migrateCustomFunctions, migrateHiddenToVisible, migratePropertyName, migrateStylingBoxToJson } from '@/designer-components/_common-migrations/migrateSettings';
import { migratePermissionsToVisiblePermissions } from '../_common-migrations/migratePermissionsToVisiblePermissions';
import { Dropdown } from '@/components/dropdown/dropdown';
import { ILabelValue } from '@/components/dropdown/model';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settings';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { DEFAULT_STATUS_VALUE, defaultStyles, defaultValuesSetting, mappingsToValuesSetting } from './utils';
import { useStyles } from './styles';
import { isDefined, isNotNullOrWhiteSpace, isNullOrWhiteSpace } from '@/utils/nullables';
import { useComponentApiProvider } from '@/providers/componentApi/provider';
import { StatusTagApi } from '../../componentsApi/componentApi';
import { useEffectOnce } from '@/hooks/useEffectOnce';
import { getComponentEvents } from '../_common/events';
import { STATUS_TAG_EVENTS_WITHOUT_CHANGE } from './events';

import apiCode from "../../componentsApi/componentApi.ts?raw";

/** Shown inside the tag when there is no value and no Placeholder has been configured. */
const EMPTY_STATUS_LABEL = '-';

/**
 * Whether a value carries a status to display.
 *
 * Blank counts as absent: a bound property that has never been set commonly arrives as `null` or an
 * empty string, and an unset multi-select as an empty array. Treating any of those as a value would
 * stop the configured fallbacks — the migrated manual value, then the Placeholder — from ever
 * standing in. `0` is a real reference-list code, so only whitespace-blank strings are excluded.
 */
function hasStatusValue<T>(value: T | null | undefined): value is T {
  return isDefined(value) && (Array.isArray(value) ? value.length > 0 : !isNullOrWhiteSpace(String(value)));
}

/**
 * The configured statuses, as rows.
 *
 * `values` is a JS setting, so the model holds either the rows themselves or the unevaluated
 * code-mode setting (see `defaultValuesSetting`). The framework normally evaluates the setting
 * before the component renders, but the model type admits both — so the shape is checked rather
 * than assumed, and an unevaluated setting yields no rows instead of being read as an array.
 */
const statusOptions = (values: IStatusTagComponentProps['values']): ILabelValue<number | string>[] => {
  if (!Array.isArray(values)) return [];

  /* Rows may arrive in either of two shapes. The Values editor produces `{ value, label }`, but a
     form migrated from Default Mappings returns that table as-is — `{ code, text, override }` —
     because the migration carries the user's script across verbatim rather than rewriting it. Both
     are normalised here so a migrated form renders without the author having to rewrite the script;
     `override` wins over `text`, exactly as the legacy renderer did. */
  return values.map((row, index) => {
    const legacy = row as Partial<ILabelValue<number | string>> & IStatusMap;
    const value = legacy.value ?? legacy.code;
    const label = legacy.label ?? (isNotNullOrWhiteSpace(legacy.override) ? legacy.override : legacy.text);

    return {
      ...legacy,
      id: legacy.id ?? `status-${index}`,
      value: value as number | string,
      label: label ?? '',
    };
  });
};

const StatusTagPlaceholder: FC<{ className: string; label: string; color?: string | undefined }> = ({ className, label, color }) => (
  <div className={className} data-tag-wrapper="true">
    <Tag {...(isNotNullOrWhiteSpace(color) ? { color } : {})}>{label}</Tag>
  </div>
);

/**
 * Applies the component's Tooltip to whatever it renders.
 *
 * The framework normally hands `description` to the Form.Item as its `tooltip`, but antd renders
 * that as an icon beside the *label* — and this component hides its label, so the tooltip would
 * disappear with it. Wrapping the tag restores it, and puts it on the thing the user actually
 * points at rather than on a label that is not there.
 *
 * Returns the children untouched when no Tooltip is configured, so no wrapper element is added for
 * a component that does not need one.
 */
const WithTooltip: FC<PropsWithChildren<{ title: string | undefined }>> = ({ title, children }) =>
  isNotNullOrWhiteSpace(title)
    ? <Tooltip title={title}>{children}</Tooltip>
    : <>{children}</>;

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
    const { formMode } = useForm();
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

    /* A reference list that was never chosen resolves nothing, so there is no status to show.
       Handled exactly as `refListStatus` does: the configuration problem is surfaced in the
       designer, where it can be fixed, and renders nothing at runtime rather than putting an error
       in front of an end user who cannot act on it. */
    if (model.dataSourceType === 'referenceList' && !isDefined(model.referenceListId)) {
      return formMode === 'designer'
        ? (
          <Alert
            showIcon
            title="Status Tag configuration is incomplete"
            description="Please make sure that you've select a reference list."
            type="warning"
          />
        )
        : undefined;
    }

    return (
      <ConfigurableFormItem<number | number[] | string | string[] | (number | string)[]> model={{ ...model, hideLabel: true }}>
        {(value, _onChange, _propertyName, ctx) => {
          /* The legacy manual Value Source pinned a fixed status; it stands in when the bound
             property is empty so a migrated form keeps showing what it used to. */
          const resolved = hasStatusValue(value) ? value : model.value;

          /* No value at all: the Placeholder stands in, falling back to a dash so the component
             always renders a tag rather than collapsing to nothing. This is checked before the
             catch-all row below, which answers a different question — that row is for a value that
             *is* present but matches nothing, whereas an absent value has no status to fail to
             recognise. Rendered here rather than left to `Dropdown`, whose read-only placeholder is
             plain text and could not produce the dash. */
          if (!hasStatusValue(resolved))
            return (
              <WithTooltip title={model.description}>
                <StatusTagPlaceholder
                  className={styles.statusTag}
                  label={isNotNullOrWhiteSpace(model.readOnlyPlaceholder) ? model.readOnlyPlaceholder : EMPTY_STATUS_LABEL}
                />
              </WithTooltip>
            );

          /* With inline values, the catch-all row stands in for a value that matches no row — what
             0.45 rendered as "NOT RECOGNISED". The select can only display a value that is one of
             its options, so the fallback is selected explicitly here rather than left to antd,
             which would otherwise render an unmatched value as its own label.

             Reference-list rows are fetched rather than local, so "no matching row" cannot be told
             apart from "not loaded yet" — that source is left alone to avoid flashing the fallback
             during load. */
          const options = statusOptions(model.values);
          const isResolvable = options.some((option) => option.value === resolved);
          const useFallback = model.dataSourceType === 'values' &&
            !isResolvable &&
            options.some((option) => option.value === DEFAULT_STATUS_VALUE);
          const displayValue = useFallback ? DEFAULT_STATUS_VALUE : resolved;

          return (
            <WithTooltip title={model.description}>
              <Dropdown
                {...modelWithoutStyle}
                values={options}
                className={styles.statusTag}
                value={displayValue}
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
            </WithTooltip>
          );
        }}
      </ConfigurableFormItem>
    );
  },
  migrator: (m) => m
    /* Steps 0-2 are the pre-refactor chain, replayed unchanged so a form saved at any of those
       versions lands on the same shape it did before. */
    .add<IStatusTagComponentPropsV0>(0, (prev) => {
      /* `prev` is the pre-migration shape, so the legacy properties are read by narrowing rather
         than asserted — a form saved before either existed simply takes the default. */
      const result: IStatusTagComponentPropsV0 = {
        ...prev,
        valueSource: 'valueSource' in prev && prev.valueSource === 'form' ? 'form' : 'manual',
        color: 'color' in prev && typeof prev.color === 'string' ? prev.color : '',
      };
      return result;
    })
    .add<IStatusTagComponentPropsV0>(1, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IStatusTagComponentPropsV0>(2, (prev) => ({ ...migrateFormApi.properties(prev) }))
    /* Step 3 turns the old Default Mappings table into the Values data source.
       The old component matched a value against a JSON table it carried in `mappings`, taking the
       label and colour from the matched row; `values` holds those same three fields per row, so the
       table converts across directly and a migrated form keeps rendering the same statuses in the
       same colours. */
    .add<IStatusTagComponentProps>(3, (prevV0: IStatusTagComponentPropsV0, context) => {
      const { mappings, valueSource, value: configuredValue, override: _override, color: _color, ...rest } = prevV0;

      if (context.isNew === true) {
        const fresh: IStatusTagComponentProps = {
          ...rest,
          dataSourceType: 'referenceList',
          // Required on the model, and `initModel` seeds the same value.
          tagVariant: prevV0.tagVariant ?? 'solid',
        };
        return fresh;
      }

      const values = mappingsToValuesSetting(mappings);

      const migrated: IStatusTagComponentProps = {
        ...rest,
        /* Whatever the form already had, so a reference list keeps its source; only the branch
           below may change it. `values` is the fallback for a form that has neither. */
        dataSourceType: prevV0.referenceListId ? 'referenceList' : 'values',
        showItemName: prevV0.showItemName ?? true,
        showIcon: prevV0.showIcon ?? true,
        tagVariant: prevV0.tagVariant ?? 'solid',
      };
      if (isDefined(values))
        migrated.values = values;

      /* Value Source 'manual' pinned the tag to a fixed status rather than reading the bound
         property, and that value is what picked the row out of the mapping table. The setting is
         gone, but the value is kept so the runtime can still fall back to it when the bound
         property is empty — otherwise a manual-source form would silently render nothing. */
      if (valueSource === 'manual' && isDefined(configuredValue))
        migrated.value = configuredValue;

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
    /* Values ships as a script rather than as rows in the editor: the inline list starts empty, and
       the JS setting returns the statuses 0.45 seeded into Default Mappings. Seeding the editor
       itself would have put four rows in front of every new component that the user then has to
       clear; a script is visible where it is relevant and easy to replace wholesale. */
    values: defaultValuesSetting(),
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
