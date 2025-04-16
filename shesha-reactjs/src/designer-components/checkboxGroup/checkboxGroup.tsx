import { ProfileOutlined } from '@ant-design/icons';
import React from 'react';
import { IToolboxComponent } from '@/interfaces';
import { DataTypes } from '@/interfaces/dataTypes';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
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
import { getEventHandlers } from '@/components/formDesigner/components/utils';

interface IEnhancedICheckboxGoupProps extends Omit<ICheckboxGroupProps, 'style'> {
  style?: string;
}

const CheckboxGroupComponent: IToolboxComponent<IEnhancedICheckboxGoupProps> = {
  type: 'checkboxGroup',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  name: 'Checkbox group',
  icon: <ProfileOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.referenceListItem,
  calculateModel: (model, allData) => ({ eventHandlers: getEventHandlers(model, allData)}),
  Factory: ({ model, calculatedModel }) => {
    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) => {
          const customEvents = calculatedModel.eventHandlers;
          const onChangeInternal = (e: any) => {
            if (e.target) customEvents.onChange({ ...e, currentTarget: { value: e.target.value } });
            if (typeof onChange === 'function') onChange(e);
          };

          const onFocusInternal = (e: any) => {
            if (e.target) customEvents.onFocus({ ...e, currentTarget: { value: e.target.value } });
          };

          const onBlurInternal = (e: any) => {
            if (e.target) customEvents.onBlur({ ...e, currentTarget: { value: e.target.value } });
          };

          return (
            <RefListCheckboxGroup
              {...model}
              style={model.fullStyle}
              value={value}
              onChange={onChangeInternal}
              onFocus={onFocusInternal}
              onBlur={onBlurInternal}
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
