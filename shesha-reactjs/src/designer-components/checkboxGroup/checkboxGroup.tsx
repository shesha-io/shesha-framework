import { ProfileOutlined } from '@ant-design/icons';
import React from 'react';
import { IConfigurableFormComponent, IToolboxComponent } from '@/interfaces';
import { DataTypes } from '@/interfaces/dataTypes';
import { executeScriptSync, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { IReferenceListIdentifier } from '@/interfaces/referenceList';
import { getLegacyReferenceListIdentifier } from '@/utils/referenceList';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import RefListCheckboxGroup from './refListCheckboxGroup';
import { CHECKBOX_GROUP_MODE, CheckboxGroupComponentProps, CheckboxGroupMode, DIRECTION_TYPE, DirectionType } from './interfaces';
import {
  migratePropertyName,
  migrateCustomFunctions,
  migrateReadOnly,
} from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settingsForm';
import { isNullOrWhiteSpace } from '@/utils/nullables';
import { DATA_SOURCE_TYPES, DataSourceType } from '../dropdown/model';
import { getStringEnumOrDefault } from '@/utils/object';

interface IEnhancedICheckboxGroupProps extends Omit<CheckboxGroupComponentProps, 'style' | 'readOnly'>, IConfigurableFormComponent {
}

interface ICheckboxGoupComopnentCalulatedValues {
  dataSourceUrl?: string | undefined;
}

const CheckboxGroupComponent: IToolboxComponent<IEnhancedICheckboxGroupProps, ICheckboxGoupComopnentCalulatedValues> = {
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
    dataSourceUrl: model.dataSourceUrl ? executeScriptSync(model.dataSourceUrl, allData) : model.dataSourceUrl,
  }),
  Factory: ({ model, calculatedModel }) => {
    return (
      <ConfigurableFormItem<string | string[]> model={model} autoAlignLabel={false}>
        {(value, onChange, _, ctx) => {
          return (
            <RefListCheckboxGroup
              {...model}
              style={!model.enableStyleOnReadonly && model.readOnly ? {} : model.allStyles?.fullStyle}
              dataSourceUrl={calculatedModel.dataSourceUrl}
              value={value ?? undefined}
              onChange={(newValue) => {
                ctx?.handleEvent(undefined, newValue, model.onChangeCustom);
                onChange(newValue ?? null);
              }}
              onFocus={(event) => ctx?.handleEvent(event, value/* event.currentTarget.value*/, model.onFocusCustom)}
              onBlur={(event) => ctx?.handleEvent(event, value/* event.currentTarget.value*/, model.onBlurCustom)}
            />
          );
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  initModel: (model) => {
    const customProps: IEnhancedICheckboxGroupProps = {
      ...model,
      dataSourceType: 'values',
      direction: 'horizontal',
      mode: 'single',
    };
    return customProps;
  },
  migrator: (m) =>
    m
      .add<IEnhancedICheckboxGroupProps>(0, (prev) => ({
        ...prev,
        dataSourceType: getStringEnumOrDefault<DataSourceType>(prev, "dataSourceType", DATA_SOURCE_TYPES) ?? "values",
        direction: getStringEnumOrDefault<DirectionType>(prev, "direction", DIRECTION_TYPE) ?? "horizontal",
        mode: getStringEnumOrDefault<CheckboxGroupMode>(prev, "direction", CHECKBOX_GROUP_MODE) ?? "single",
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
      .add<IEnhancedICheckboxGroupProps>(5, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) })),
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
};

export default CheckboxGroupComponent;
