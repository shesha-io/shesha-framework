/* The migrator reads deprecated/removed model properties (mappings, override, color, valueSource,
   stylingBox) on purpose — upgrading forms saved against those shapes is what it is for. */
/* eslint-disable @typescript-eslint/no-deprecated */
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import { useEffect } from 'react';
import { ArrayFormats, DataTypes } from '@/interfaces/dataTypes';
import { TagOutlined } from '@ant-design/icons';
import { IInputStyles } from '@/providers/form/models';

import { IStatusTagComponentProps, IStatusTagComponentPropsV0, StatusTagComponentDefinition } from './model';
import { migrateCustomFunctions, migrateHiddenToVisible, migratePropertyName, migrateStylingBoxToJson } from '@/designer-components/_common-migrations/migrateSettings';
import { migratePermissionsToVisiblePermissions } from '../_common-migrations/migratePermissionsToVisiblePermissions';
import { Dropdown } from '@/components/dropdown/dropdown';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settings';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { defaultStyles, mappingsToValues } from './utils';
import { useStyles } from './styles';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { useComponentApiProvider } from '@/providers/componentApi/provider';
import { StatusTagApi } from '../../componentsApi/componentApi';
import { useEffectOnce } from '@/hooks/useEffectOnce';
import { getComponentEvents } from '../_common/events';
import { STATUS_TAG_EVENTS_WITHOUT_CHANGE } from './events';

import apiCode from "../../componentsApi/componentApi.ts?raw";

const StatusTagComponent: StatusTagComponentDefinition = {
  allowInherit: true,
  type: 'statusTag',
  name: 'Status Tag',
  /* A status tag binds to a property and reads it, but never writes one — it renders the status
     rather than capturing it. */
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
        /* No component-specific properties and no `focus`: the tag is not focusable, and `value`
           comes from the shared value processor. */
        properties: [],
      });
    }, [componentApi, model.componentName, model.id]);
    useEffectOnce(() => () => componentApi?.removeApi(model.id));

    /* `displayStyle: 'tags'` is fixed rather than configurable: a status tag is a tag by
       definition. The read-only renderer branches on it, so it has to be part of the model handed
       down, not just a prop on the element. */
    const tagModel = { ...model, displayStyle: 'tags' as const };

    /* The single style set, scoped onto the tag by the class rather than applied to the wrapper —
       `model.styleCss` (the evaluated Custom style) is folded in here for the same reason: passed
       as an inline `style` it would land on the container, and a class rule on the tag would beat
       it anyway. */
    const { styles } = useStyles({ ...tagModel, customStyle: model.styleCss });

    /* `model.style` is the raw custom-style *expression* (a string), and `styleCss` its evaluated
       form. Both are dropped from the spread: the style set belongs on the tag, which the class
       above handles, so neither may reach the wrapper as an inline style. */
    const { style: _styleExpression, styleCss: _styleCss, ...modelWithoutStyle } = tagModel;

    return (
      <ConfigurableFormItem<number | number[] | string | string[] | (number | string)[]> model={model}>
        {(value, _onChange, _propertyName, ctx) => {
          return (
            <Dropdown
              {...modelWithoutStyle}
              className={styles.statusTag}
              value={value ?? undefined}
              size={model.size}
              /* Always read-only: this is the whole point of the component. It also means the
                 select is never rendered — `Dropdown` takes its read-only branch, which draws the
                 value through `ReadOnlyDisplayFormItem` as tags.

                 `styleValue` is deliberately not passed. It is how that renderer styles its
                 *container*, and this component has no container styles — the whole set is scoped
                 onto the tag by `className`, which reaches it because the read-only branch renders
                 inside this element. */
              readOnly
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
    /* Step 3 turns the old mapping table into the drop-down data source.
       The old component matched a value against a JSON table it carried in `mappings`; the new one
       resolves it through a reference list or an inline `values` list. The table converts directly
       to `values`, so a saved form keeps rendering the same statuses in the same colours. */
    .add<IStatusTagComponentProps>(3, (prev, context) => {
      /* Reads the legacy shape and returns the new one — this is the step that converts between
         them, so `prev` is typed as V0 while the migration is declared against the new model. */
      const prevV0 = prev as unknown as IStatusTagComponentPropsV0;
      /* A new component never carries a legacy mapping table, and `initModel` has already given it
         a data source, so there is nothing to convert. */
      if (context.isNew === true) return prev as IStatusTagComponentProps;

      const { mappings, valueSource: _removed, override: _override, color: _color, ...rest } = prevV0;

      const values = mappingsToValues(mappings);

      const migrated: IStatusTagComponentProps = {
        ...rest,
        /* Values, not a reference list: the legacy component had no reference list to point at, so
           inline values are the only source that can hold the migrated table. */
        dataSourceType: 'values',
        // Omitted rather than set to undefined when the form carried no usable mapping table.
        ...(isDefined(values) ? { values } : {}),
        showItemName: true,
        showIcon: true,
        tagVariant: 'solid',
      };

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
