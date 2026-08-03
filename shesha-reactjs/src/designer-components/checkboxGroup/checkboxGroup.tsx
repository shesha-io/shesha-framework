import { ProfileOutlined } from '@ant-design/icons';
import React, { useEffect, useRef } from 'react';
import { IConfigurableFormComponent, IToolboxComponent } from '@/interfaces';
import { DataTypes } from '@/interfaces/dataTypes';
import { executeScriptSync, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { IReferenceListIdentifier } from '@/interfaces/referenceList';
import { getLegacyReferenceListIdentifier } from '@/utils/referenceList';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import RefListCheckboxGroup from './refListCheckboxGroup';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { useCheckboxGroupOptions } from './multiCheckbox';
import { CheckboxGroupComponentProps, CheckboxGroupFocusHandle, DIRECTION_TYPE, DirectionType } from './interfaces';
import {
  migratePropertyName,
  migrateCustomFunctions,
  migrateReadOnly,
} from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settingsForm';
import { isDefined, isNotNullOrWhiteSpace, isNullOrWhiteSpace } from '@/utils/nullables';
import { migrateUrlDataSource } from '../_common-migrations/migrateUrlDataSource';
import { DATA_SOURCE_TYPES, DataSourceType } from '../dropdown/model';
import { getStringEnumOrDefault } from '@/utils/object';
import { IInputStyles } from '@/providers';
import { migratePrevStyles } from '../_common-migrations';
import { defaultStyles } from './utils';
import { migratePermissionsToVisiblePermissions } from '../_common-migrations/migratePermissionsToVisiblePermissions';
import { migrateHiddenToVisible } from '@/designer-components/_common-migrations/migrateSettings';
import { useComponentApi } from '@/providers/componentApi/provider';
import { CheckboxGroupApi } from '../../componentsApi/componentApi';
import { ALL_INPUT_EVENTS_WITHOUT_CHANGE, getComponentEvents } from '../_common/events';

import apiCode from "../../componentsApi/componentApi.ts?raw";

interface IEnhancedICheckboxGroupProps extends Omit<CheckboxGroupComponentProps, 'style' | 'readOnly'>, IConfigurableFormComponent {
}

interface ICheckboxGroupCalculatedValues {
  /** The `dataSourceUrl` expression evaluated against the current form data. */
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
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.referenceListItem,
  calculateModel: (model, allData) => ({
    dataSourceUrl: isNotNullOrWhiteSpace(model.dataSourceUrl) ? executeScriptSync(model.dataSourceUrl, allData) : model.dataSourceUrl,
  }),
  Factory: ({ model, calculatedModel }) => {
    const componentApi = useComponentApi();
    // The group has no single input element, so focus goes through an imperative
    // handle exposed by the group's wrapper div.
    const focusRef = useRef<CheckboxGroupFocusHandle>(null);

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

    const options = useCheckboxGroupOptions({ ...model, dataSourceUrl: calculatedModel.dataSourceUrl });

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
                style={model.styleJson}
                styleValue={model}
              />
            );
          }

          return (
            <RefListCheckboxGroup
              {...model}
              options={options}
              disabled={model.disabled === true}
              focusRef={focusRef}
              value={value ?? undefined}
              onChange={(newValue) => {
                ctx?.handleEvent(undefined, { value: newValue }, model.onChangeCustom);
                onChange(newValue);
              }}
              {...getComponentEvents<string | string[]>(model, ALL_INPUT_EVENTS_WITHOUT_CHANGE, ctx, value, DataTypes.array)}
            />
          );
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  getDefaultStyles: () => defaultStyles(),
  initModel: (model) => {
    const customProps: IEnhancedICheckboxGroupProps = {
      ...model,
      dataSourceType: 'values',
      direction: 'horizontal',
    };
    return customProps;
  },
  migrator: (m) =>
    m
      .add<IEnhancedICheckboxGroupProps>(0, (prev) => ({
        ...prev,
        dataSourceType: getStringEnumOrDefault<DataSourceType>(prev, "dataSourceType", DATA_SOURCE_TYPES) ?? "values",
        direction: getStringEnumOrDefault<DirectionType>(prev, "direction", DIRECTION_TYPE) ?? "horizontal",
      }))
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
      // Checkbox group now only ever works in multi-select mode. Drop the legacy
      // "mode" property so existing forms stop rendering the single (radio) variant.
      .add<IEnhancedICheckboxGroupProps>(6, (prev) => {
        const { mode, ...rest } = prev as IEnhancedICheckboxGroupProps & { mode?: string };
        return rest;
      })
      // Seed the new per-checkbox Appearance style model (font/border/background/
      // dimensions/shadow/padding) for existing forms only.
      .add<IEnhancedICheckboxGroupProps>(7, (prev, context) => {
        if (context.isNew === true) return prev;

        const styles: IInputStyles = {
          style: prev.style,
        };

        return migratePrevStyles({ ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles } }, defaultStyles());
      })
      // Hidden -> Visible and permissions onto the Visible / Interaction Mode
      // settings, applied as a single chained step.
      .add<IEnhancedICheckboxGroupProps>(8, (prev) => migratePermissionsToVisiblePermissions(migrateHiddenToVisible(prev)))
      // A `url` source that statically points at a reference list converts to the native
      // `referenceList` source; any other URL (e.g. a dynamic one) keeps working as `url`.
      .add<IEnhancedICheckboxGroupProps>(9, (prev) => migrateUrlDataSource(prev)),
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
