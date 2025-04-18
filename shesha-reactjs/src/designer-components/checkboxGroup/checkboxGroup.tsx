import { ProfileOutlined } from '@ant-design/icons';
import React from 'react';
import { IConfigurableFormComponent, IToolboxComponent } from '@/interfaces';
import { DataTypes } from '@/interfaces/dataTypes';
import { evaluateValue, executeScriptSync, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { IReferenceListIdentifier } from '@/interfaces/referenceList';
import { getLegacyReferenceListIdentifier } from '@/utils/referenceList';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import RefListCheckboxGroup from './refListCheckboxGroup';
import { ICheckboxGroupProps } from './utils';
import {
  migratePropertyName,
  migrateCustomFunctions,
  migrateReadOnly,
} from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settingsForm';
import { IEventHandlers, getAllEventHandlers } from '@/components/formDesigner/components/utils';

interface IEnhancedICheckboxGoupProps extends Omit<ICheckboxGroupProps, 'style'>, IConfigurableFormComponent {
}

interface ICheckboxGoupComopnentCalulatedValues {
  eventHandlers: IEventHandlers;
  dataSourceUrl?: string;
}

const CheckboxGroupComponent: IToolboxComponent<IEnhancedICheckboxGoupProps, ICheckboxGoupComopnentCalulatedValues> = {
  type: 'checkboxGroup',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  name: 'Checkbox group',
  icon: <ProfileOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.referenceListItem,
  calculateModel: (model, allData) => ({ 
    eventHandlers: getAllEventHandlers(model, allData),
    dataSourceUrl: model.dataSourceUrl ? executeScriptSync(model.dataSourceUrl, allData) : model.dataSourceUrl,
    defaultValue: evaluateValue(model.defaultValue, allData.data),
  }),
  Factory: ({ model, calculatedModel }) => {
    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) => {
          const customEvents = calculatedModel.eventHandlers;
          const onChangeInternal = (e: any) => {
            if (e.target) 
              customEvents.onChange({ value: e.target.value }, e);
            else
              customEvents.onChange({ value: e }, null);
            if (typeof onChange === 'function') onChange(e);
          };

          return (
            <RefListCheckboxGroup
              {...model}
              style={model.allStyles.fullStyle}
              dataSourceUrl={calculatedModel.dataSourceUrl}
              value={value}
              defaultValue={model.defaultValue}
              {...calculatedModel.eventHandlers}
              onChange={onChangeInternal}
            />
          );
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
  initModel: (model) => {
    const customProps: IEnhancedICheckboxGoupProps = {
      ...model,
      dataSourceType: 'values',
      direction: 'horizontal',
      mode: 'single',
    };
    return customProps;
  },
  migrator: (m) =>
    m
      .add<IEnhancedICheckboxGoupProps>(0, (prev) => ({
        ...prev,
        dataSourceType: prev['dataSourceType'] ?? 'values',
        direction: prev['direction'] ?? 'horizontal',
        mode: prev['mode'] ?? 'single',
      }))
      .add<IEnhancedICheckboxGoupProps>(1, (prev) => {
        return {
          ...prev,
          referenceListId: getLegacyReferenceListIdentifier(prev.referenceListNamespace, prev.referenceListName),
        };
      })
      .add<IEnhancedICheckboxGoupProps>(2, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<IEnhancedICheckboxGoupProps>(3, (prev) => migrateVisibility(prev))
      .add<IEnhancedICheckboxGoupProps>(4, (prev) => migrateReadOnly(prev))
      .add<IEnhancedICheckboxGoupProps>(5, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) })),
  linkToModelMetadata: (model, metadata): IEnhancedICheckboxGoupProps => {
    const refListId: IReferenceListIdentifier = metadata.referenceListName
      ? { module: metadata.referenceListModule, name: metadata.referenceListName }
      : null;
    return {
      ...model,
      dataSourceType: metadata.dataType === DataTypes.referenceListItem ? 'referenceList' : 'values',
      referenceListId: refListId,
    };
  },
};

export default CheckboxGroupComponent;
