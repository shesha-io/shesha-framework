import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import RadioGroup from './radioGroup';
import React from 'react';
import { CheckCircleOutlined } from '@ant-design/icons';
import { DataTypes } from '@/interfaces/dataTypes';
import { IInputStyles } from '@/providers/form/models';
import { getLegacyReferenceListIdentifier } from '@/utils/referenceList';
import { evaluateValue, executeScriptSync, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { IRadioProps } from './utils';
import { IToolboxComponent } from '@/interfaces';
import {
  migrateCustomFunctions,
  migratePropertyName,
  migrateReadOnly,
} from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { IConfigurableFormComponent } from '@/providers';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settingsForm';
import { IEventHandlers, getAllEventHandlers } from '@/components/formDesigner/components/utils';

interface IEnhancedRadioProps extends Omit<IRadioProps, 'style'>, IConfigurableFormComponent {
}

interface IRadioComopnentCalulatedValues {
  eventHandlers: IEventHandlers;
  dataSourceUrl?: string;
  defaultValue?: any;
}

const Radio: IToolboxComponent<IEnhancedRadioProps, IRadioComopnentCalulatedValues> = {
  type: 'radio',
  name: 'Radio',
  icon: <CheckCircleOutlined />,
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.array,
  calculateModel: (model, allData) => ({ 
    eventHandlers: getAllEventHandlers(model, allData),
    dataSourceUrl: model.dataSourceUrl ? executeScriptSync(model.dataSourceUrl, allData) : model.dataSourceUrl,
    defaultValue: evaluateValue(model.defaultValue, allData.data),
  }),
  Factory: ({ model, calculatedModel }) => {
    const { style, ...restProps } = model;

    return (
      <ConfigurableFormItem model={restProps}>
        {(value, onChange) => {
          const customEvents = calculatedModel.eventHandlers;
          const onChangeInternal = (e: any) => {
            if (e.target) customEvents.onChange({ ...e, currentTarget: { value: e.target.value } });
            if (typeof onChange === 'function') onChange(e);
          };

          return (
            <RadioGroup 
              {...restProps}
              style={model.allStyles.fullStyle}
              value={value}
              defaultValue={model.defaultValue}
              {...customEvents}
              onChange={onChangeInternal} 
            />
          );
        }}
      </ConfigurableFormItem>
    );
  },

  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
  migrator: (m) =>
    m
      .add<IEnhancedRadioProps>(0, (prev) => ({
        ...prev,
        dataSourceType: prev['dataSourceType'] ?? 'values',
        direction: prev['direction'] ?? 'horizontal',
      }))
      .add<IEnhancedRadioProps>(1, (prev) => {
        return {
          ...prev,
          referenceListId: getLegacyReferenceListIdentifier(prev.referenceListNamespace, prev.referenceListName),
        };
      })
      .add<IEnhancedRadioProps>(2, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<IEnhancedRadioProps>(3, (prev) => migrateVisibility(prev))
      .add<IEnhancedRadioProps>(4, (prev) => migrateReadOnly(prev))
      .add<IEnhancedRadioProps>(5, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
      .add<IEnhancedRadioProps>(6, (prev) => {
        const styles: IInputStyles = {
          style: prev.style,
        };

        return { ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles } };
      }),
  linkToModelMetadata: (model, metadata): IEnhancedRadioProps => {
    const isRefList = metadata.dataType === DataTypes.referenceListItem;

    return {
      ...model,
      dataSourceType: isRefList ? 'referenceList' : 'values',
      referenceListId: isRefList
        ? {
          module: metadata.referenceListModule,
          name: metadata.referenceListName,
        }
        : null,
    };
  },
};

export default Radio;
