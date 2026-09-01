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
import { normalizeValue } from '@/components/dropdown/dropdown';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settings';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { DEFAULT_STATUS_VALUE, defaultStyles, defaultValuesSetting, mappingsToValuesSetting } from './utils';
import { useStyles } from './styles';
import { isDefined, isNotNullOrWhiteSpace, isNullOrWhiteSpace } from '@/utils/nullables';
import { useComponentApiProvider } from '@/providers/componentApi/provider';
import { StatusTagApi } from '../../componentsApi/componentApi';
import { useEffectOnce } from '@/hooks/useEffectOnce';
import { EventsObject, getComponentEvents } from '../_common/events';
import { STATUS_TAG_EVENTS_WITHOUT_CHANGE } from './events';

import apiCode from "../../componentsApi/componentApi.ts?raw";

/** Shown inside the tag when there is no value and no Placeholder has been configured. */
const EMPTY_STATUS_LABEL = '-';

function hasStatusValue<T>(value: T | null | undefined): value is T {
  return isDefined(value) && (Array.isArray(value) ? value.length > 0 : !isNullOrWhiteSpace(String(value)));
}

const statusOptions = (values: IStatusTagComponentProps['values']): ILabelValue<number | string>[] => {
  if (!Array.isArray(values)) return [];

  /* Two shapes: `{ value, label }` from the Values editor, and `{ code, text, override }` from a
     form migrated from Default Mappings. `override` wins over `text`, as the legacy renderer did. */
  /* `flatMap` drops rows with no value — unmatched anyway — and narrows the rest. */
  return values.flatMap((row, index) => {
    const legacy = row as Partial<ILabelValue<number | string>> & IStatusMap;
    const value = legacy.value ?? legacy.code;
    if (!isDefined(value)) return [];

    const label = legacy.label ?? (isNotNullOrWhiteSpace(legacy.override) ? legacy.override : legacy.text);

    return [{
      ...legacy,
      id: legacy.id ?? `status-${index}`,
      value,
      label: label ?? '',
    }];
  });
};

const StatusTagPlaceholder: FC<{ className: string; label: string; color?: string | undefined }> = ({ className, label, color }) => (
  <div className={className} data-tag-wrapper="true">
    <Tag {...(isNotNullOrWhiteSpace(color) ? { color } : {})}>{label}</Tag>
  </div>
);

/**
 * Carries the events, which `Dropdown` would otherwise spread onto a select its read-only branch
 * never renders. `title` is only for the tags this component renders itself — resolved statuses get
 * their tooltip per tag from their description instead.
 */
const StatusTagWrapper: FC<PropsWithChildren<{ title?: string | undefined; events: EventsObject }>> = ({ title, events, children }) => {
  /* `inline-flex`, not `display: contents`: Tooltip needs a laid-out element to anchor to, and
     shrink-wrapping keeps the hover target on the tag. */
  const content = <span className="sha-status-tag-wrapper" style={{ display: 'inline-flex', maxWidth: '100%' }} {...events}>{children}</span>;

  return isNotNullOrWhiteSpace(title)
    ? <Tooltip title={title}>{content}</Tooltip>
    : content;
};

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

    /* The drop-down used purely as a display. Both are set on the model rather than passed as
       props: `Dropdown` and its reference-list path branch on the model to pick their rendering. */
    const tagModel = { ...model, displayStyle: 'tags' as const, readOnly: true };

    /* Custom style is folded into the class: inline it would land on the container, and the tag's
       own class rule would beat it anyway. */
    const { styles } = useStyles({ ...tagModel, customStyle: model.styleCss });

    /* Dropped from the spread so neither reaches the wrapper as an inline style. */
    const { style: _styleExpression, styleCss: _styleCss, ...modelWithoutStyle } = tagModel;

    /* Surfaced in the designer where it can be fixed; nothing at runtime, as `refListStatus` does. */
    if (model.dataSourceType === 'referenceList' && !isDefined(model.referenceListId)) {
      return formMode === 'designer'
        ? (
          <Alert
            showIcon
            title="Status Tag configuration is incomplete"
            description="Please make sure that you have selected a reference list."
            type="warning"
          />
        )
        : undefined;
    }

    return (
      <ConfigurableFormItem<number | number[] | string | string[] | (number | string)[]> model={{ ...model, hideLabel: true }}>
        {(value, _onChange, _propertyName, ctx) => {
          /* Bound to the wrapper: the read-only branch renders no select to spread them onto. */
          const events = getComponentEvents<number | number[] | string | string[] | (number | string)[]>(
            model, STATUS_TAG_EVENTS_WITHOUT_CHANGE, ctx, value, DataTypes.array,
          );

          /* The legacy manual Value Source pinned a fixed status; it stands in when the bound
             property is empty so a migrated form keeps showing what it used to. */
          const resolved = hasStatusValue(value) ? value : model.value;

          /* Checked before the catch-all below, which is for a present-but-unmatched value. Rendered
             here because `Dropdown`'s read-only placeholder is plain text and cannot produce the dash. */
          if (!hasStatusValue(resolved))
            return (
              <StatusTagWrapper title={model.description} events={events}>
                <StatusTagPlaceholder
                  className={styles.statusTag}
                  label={isNotNullOrWhiteSpace(model.readOnlyPlaceholder) ? model.readOnlyPlaceholder : EMPTY_STATUS_LABEL}
                />
              </StatusTagWrapper>
            );

          /* The catch-all row, for a value matching none. Selected explicitly because antd would
             otherwise render an unmatched value as its own label. Reference-list rows are fetched, so
             "no match" cannot be told from "not loaded" — that source is left alone. */
          const options = statusOptions(model.values);
          const hasFallbackRow = options.some((option) => option.value === DEFAULT_STATUS_VALUE);
          /* `normalizeValue` so a bound "1" matches a configured 1, as the drop-down does. */
          const isResolvable = (candidate: number | string): boolean =>
            options.some((option) => normalizeValue(option.value) === normalizeValue(candidate));

          /* Entry by entry: comparing the whole array against scalar values never matches, which
             would collapse a valid multi-selection onto the fallback. */
          const resolveOne = (candidate: number | string): number | string =>
            model.dataSourceType === 'values' && !isResolvable(candidate) && hasFallbackRow
              ? DEFAULT_STATUS_VALUE
              : candidate;

          const displayValue = Array.isArray(resolved)
            ? resolved.map(resolveOne)
            : resolveOne(resolved);

          /* Hover text is per tag, so the component Tooltip becomes the fallback description on each
             option that has none. A single wrapper tooltip could only ever be all-or-nothing. */
          const tooltip = model.description;
          const optionsWithTooltip: ILabelValue<number | string>[] = isNotNullOrWhiteSpace(tooltip)
            ? options.map((option) => (isNotNullOrWhiteSpace(option.description)
              ? option
              : { ...option, description: tooltip }))
            : options;

          return (
            <StatusTagWrapper events={events}>
              <Dropdown
                {...modelWithoutStyle}
                values={optionsWithTooltip}
                /* Reference-list options are built inside `Dropdown` from the fetched items, out of
                   reach of the mapping above, so the fallback is handed over for it to apply per
                   option — same rule, applied where those options are made. */
                {...(isNotNullOrWhiteSpace(tooltip) ? { fallbackDescription: tooltip } : {})}
                className={styles.statusTag}
                value={displayValue}
                size={model.size}
                /* Read-only rendering happens outside the select, where the emotion class does not
                 reach, so the style model is handed over as a value for that path. */
                styleValue={{ ...model, dimensions: { width: 'max-content' } }}
                /* No `onChange`, `selectRef` or `popupClassName`: read-only renders no select, so
                 there is nothing to select into, focus, or pop up. */
              />
            </StatusTagWrapper>
          );
        }}
      </ConfigurableFormItem>
    );
  },
  migrator: (m) => m
    /* Steps 0-2 are the pre-refactor chain, replayed unchanged. */
    .add<IStatusTagComponentPropsV0>(0, (prev) => {
      /* Narrowed rather than asserted: a form saved before either property existed takes the default. */
      const result: IStatusTagComponentPropsV0 = {
        ...prev,
        valueSource: 'valueSource' in prev && prev.valueSource === 'form' ? 'form' : 'manual',
        color: 'color' in prev && typeof prev.color === 'string' ? prev.color : '',
      };
      return result;
    })
    .add<IStatusTagComponentPropsV0>(1, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IStatusTagComponentPropsV0>(2, (prev) => ({ ...migrateFormApi.properties(prev) }))
    /* Step 3: Default Mappings -> the Values data source. */
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
        /* Keeps a reference list on its own source; `values` for a form with neither. */
        dataSourceType: prevV0.referenceListId ? 'referenceList' : 'values',
        showItemName: prevV0.showItemName ?? true,
        showIcon: prevV0.showIcon ?? true,
        tagVariant: prevV0.tagVariant ?? 'solid',
      };
      if (isDefined(values))
        migrated.values = values;

      /* 'manual' pinned a fixed status. The setting is gone, but the value is kept as the runtime
         fallback so such a form does not render blank. */
      if (valueSource === 'manual' && isDefined(configuredValue))
        migrated.value = configuredValue;

      return migrated;
    })
    /* Freezes the old appearance into the per-device models; a no-op for a new component. */
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
    /* Hidden -> Visible and permissions, chained. No `migrateReadOnly`: there is no Interaction Mode. */
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
    /* Reference List is the default source; the list itself is left unset. */
    dataSourceType: 'referenceList',
    /* Ships as a script, so the inline editor starts empty rather than pre-filled with four rows. */
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
