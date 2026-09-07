import { ProfileOutlined } from '@ant-design/icons';
import { CSSProperties, useEffect, useMemo, useRef } from 'react';
import { useActualContextExecution } from '@/hooks';
import { IConfigurableFormComponent, IToolboxComponent } from '@/interfaces';
import { ArrayFormats, DataTypes } from '@/interfaces/dataTypes';
import { executeScriptSync } from '@/providers/form/utils';
import { IReferenceListIdentifier } from '@/interfaces/referenceList';
import { getLegacyReferenceListIdentifier } from '@/utils/referenceList';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import RefListCheckboxGroup from './refListCheckboxGroup';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { useReferenceList } from '@/providers/referenceListDispatcher';
import { getDataSourceList } from '../radio/utils';
import { CheckboxGroupComponentProps, CheckboxGroupFocusHandle, DIRECTION_TYPE, DirectionType } from './interfaces';
import {
  migratePropertyName,
  migrateCustomFunctions,
  migrateReadOnly,
  migrateStylingBoxToJson,
} from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settingsForm';
import { isDefined, isNotNullOrWhiteSpace, isNullOrWhiteSpace } from '@/utils/nullables';
import { DATA_SOURCE_TYPES, DataSourceType } from '../dropdown/model';
import { getStringEnumOrDefault } from '@/utils/object';
import { IInputStyles } from '@/providers';
import { migratePrevStyles } from '../_common-migrations';
import { defaultStyles } from './utils';
import { IRadioComponentProps } from '../radio/interfaces';
import { defaultStyles as radioDefaultStyles } from '../radio/utils';
import { migratePermissionsToVisiblePermissions } from '../_common-migrations/migratePermissionsToVisiblePermissions';
import { migrateHiddenToVisible } from '@/designer-components/_common-migrations/migrateSettings';
import { useComponentApiProvider } from '@/providers/componentApi/provider';
import { CheckboxGroupApi } from '../../componentsApi/componentApi';
import { ALL_INPUT_EVENTS_WITHOUT_CHANGE_AND_DOUBLE_CLICK, getComponentEvents } from '../_common/events';

import apiCode from "../../componentsApi/componentApi.ts?raw";

interface IEnhancedICheckboxGroupProps extends Omit<CheckboxGroupComponentProps, 'style' | 'readOnly'>, IConfigurableFormComponent {
}

/** Shape of a persisted model still carrying the legacy `mode: 'single'` property (removed from the current schema). */
type LegacySingleModeCheckboxGroup = IEnhancedICheckboxGroupProps & { mode: 'single' };

/** Narrows `prev` to a legacy single-mode checkbox group, without asserting fields the current type doesn't declare. */
const hasLegacySingleMode = (prev: IEnhancedICheckboxGroupProps): prev is LegacySingleModeCheckboxGroup =>
  'mode' in prev && (prev as { mode?: unknown }).mode === 'single';

/** Values derived from the model before render — currently the evaluated `url` data source. */
interface ICheckboxGroupCalculatedValues {
  dataSourceUrl?: string | undefined;
}

const CheckboxGroupComponent: IToolboxComponent<IEnhancedICheckboxGroupProps, ICheckboxGroupCalculatedValues> = {
  allowInherit: true,
  type: 'checkboxGroup',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  name: 'Checkbox group',
  // Checkbox has its own intrinsic size and should not be forced to fill wrapper
  preserveDimensionsInDesigner: true,
  icon: <ProfileOutlined />,
  dataTypeSupported: ({ dataType, dataFormat }) => dataType === DataTypes.array && dataFormat === ArrayFormats.multivalueReferenceList,
  // `dataSourceUrl` is a script (it may read form data, localStorage, etc.), so evaluate it
  // here and hand the resolved endpoint to the group.
  calculateModel: (model, allData) => ({
    dataSourceUrl: isNotNullOrWhiteSpace(model.dataSourceUrl)
      ? executeScriptSync<string>(model.dataSourceUrl, allData)
      : model.dataSourceUrl,
  }),
  Factory: ({ model, calculatedModel }) => {
    const componentApi = useComponentApiProvider();
    // The group has no single input element, so focus goes through an imperative
    // handle exposed by the group's wrapper div.
    const focusRef = useRef<CheckboxGroupFocusHandle>(null);

    const checkboxStyleJson = useActualContextExecution<CSSProperties>(model.checkbox?.style, undefined, {});

    useEffect(() => {
      const apiId = model.id;
      componentApi?.updateApi<CheckboxGroupApi>({
        id: apiId,
        componentName: model.componentName ?? "",
        level: 3,
        typeDefinition: { typeName: 'CheckboxGroupApi', files: [{ content: apiCode, fileName: 'apis/componentApi.ts' }] },
        properties: [],
        api: { focus: () => focusRef.current?.focus() },
      });

      return () => {
        componentApi?.removeApi(apiId);
      };
    }, [componentApi, model.componentName, model.id]);

    // Resolved here as well as in the group so the readOnly display can show the selected
    // options' labels rather than their raw values.
    const { data: refList } = useReferenceList(model.referenceListId);
    const options = useMemo(
      () => getDataSourceList(model.dataSourceType ?? 'values', model.items ?? [], refList?.items),
      [model.dataSourceType, model.items, refList?.items],
    );

    return (
      <ConfigurableFormItem<string | string[]> model={model} autoAlignLabel={false}>
        {(value, onChange, _, ctx) => {
          if (model.readOnly === true) {
            const selectedValues = isDefined(value) ? (Array.isArray(value) ? value : [value]) : [];
            const selectedLabels = options
              .filter((item) => selectedValues.some((v) => `${item.value}` === `${v}`))
              .map((item) => item.label);

            return (
              <ReadOnlyDisplayFormItem
                value={selectedLabels.join(', ')}
                enableFullStyle={model.enableStyleOnReadonly}
                style={model.styleCss}
                styleValue={model}
              />
            );
          }

          return (
            <RefListCheckboxGroup
              {...model}
              dataSourceUrl={calculatedModel.dataSourceUrl}
              checkboxStyleJson={checkboxStyleJson}
              disabled={model.disabled === true}
              focusRef={focusRef}
              value={value ?? undefined}
              onChange={(newValue) => {
                ctx?.handleEvent(undefined, { value: newValue }, model.onChangeCustom);
                onChange(newValue);
              }}
              {...getComponentEvents<string | string[]>(model, ALL_INPUT_EVENTS_WITHOUT_CHANGE_AND_DOUBLE_CLICK, ctx, value, DataTypes.array)}
            />
          );
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: getSettings,

  validateModel: (model, addModelError) => {
    const dataSourceType = model.dataSourceType ?? 'values';
    if (dataSourceType === 'referenceList' && !isDefined(model.referenceListId))
      addModelError('referenceListId', 'Select `Reference List` on the settings panel');
    if (dataSourceType === 'values' && (model.items ?? []).length === 0)
      addModelError('items', 'Add `Items` on the settings panel, or select a different `Data Source Type`');
    if (dataSourceType === 'url' && isNullOrWhiteSpace(model.dataSourceUrl))
      addModelError('dataSourceUrl', 'Enter a `Data Source URL` on the settings panel');
  },
  getDefaultStyles: () => defaultStyles(),
  initModel: (model) => {
    const customProps: IEnhancedICheckboxGroupProps = {
      ...model,
      direction: 'horizontal',
    };
    return customProps;
  },
  migrator: (m) =>
    m
      .add<IEnhancedICheckboxGroupProps>(0, (prev, context) => {
        const configured = getStringEnumOrDefault<DataSourceType>(prev, "dataSourceType", DATA_SOURCE_TYPES);

        return {
          ...prev,
          dataSourceType: configured ?? (context.isNew === true ? undefined : "values"),
          direction: getStringEnumOrDefault<DirectionType>(prev, "direction", DIRECTION_TYPE) ?? "horizontal",
        };
      })
      .add<IEnhancedICheckboxGroupProps>(1, (prev) => {
        return {
          ...prev,

          referenceListId: getLegacyReferenceListIdentifier(prev.referenceListNamespace, prev.referenceListName) ?? undefined,
        };
      })
      .add<IEnhancedICheckboxGroupProps>(2, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<IEnhancedICheckboxGroupProps>(3, (prev) => migrateVisibility(prev))
      .add<IEnhancedICheckboxGroupProps>(4, (prev) => migrateReadOnly(prev))
      .add<IEnhancedICheckboxGroupProps>(5, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
      .add<IEnhancedICheckboxGroupProps | IRadioComponentProps>(6, (prev) => {
        if (!hasLegacySingleMode(prev)) return prev;

        const { mode: _mode, checkbox, ...rest } = prev;
        const radioDefaults = radioDefaultStyles();

        const radioModel: IRadioComponentProps = migratePrevStyles(
          {
            ...rest,
            type: 'radio',
            radio: checkbox ?? radioDefaults.radio,
            version: 8,
          },
          radioDefaults,
        );
        return radioModel;
      })
      .add<IEnhancedICheckboxGroupProps>(7, (prev, context) => {
        if (context.isNew === true) return prev;

        const styles: IInputStyles = {
          style: prev.style,
        };

        return migratePrevStyles({ ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles } }, defaultStyles());
      })
      .add<IEnhancedICheckboxGroupProps>(8, (prev) => migratePermissionsToVisiblePermissions(migrateHiddenToVisible(migrateStylingBoxToJson(prev)))),
  linkToModelMetadata: (model, metadata): IEnhancedICheckboxGroupProps => {
    const refListId: IReferenceListIdentifier | undefined = !isNullOrWhiteSpace(metadata.referenceListModule) && !isNullOrWhiteSpace(metadata.referenceListName)
      ? { module: metadata.referenceListModule, name: metadata.referenceListName }
      : undefined;
    return {
      ...model,
      dataSourceType: metadata.dataType === DataTypes.referenceListItem ? 'referenceList' : 'values',
      referenceListId: refListId,
    };
  },
  previewConfiguration: {
    type: 'checkboxGroup',
    id: 'checkboxGroup',
    propertyName: 'checkboxGroupAppearance',
    label: 'Checkbox Group Label',
    version: 'latest',
    dataSourceType: 'values',
    direction: 'horizontal',
    items: [
      { id: 'preview-1', label: 'Option 1', value: '1' },
      { id: 'preview-2', label: 'Option 2', value: '2' },
      { id: 'preview-3', label: 'Option 3', value: '3' },
      { id: 'preview-4', label: 'Option 4', value: '4' },
    ],
  },
};

export default CheckboxGroupComponent;
