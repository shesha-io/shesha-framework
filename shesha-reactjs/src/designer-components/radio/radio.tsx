import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import RadioGroup from './radioGroup';
import React from 'react';
import { CheckCircleOutlined } from '@ant-design/icons';
import { DataTypes } from '@/interfaces/dataTypes';
import { IInputStyles } from '@/providers/form/models';
import { getLegacyReferenceListIdentifier } from '@/utils/referenceList';
import { getStyle, useAvailableConstantsData, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { IRadioProps } from './utils';
import { IToolboxComponent } from '@/interfaces';
import {
  migrateCustomFunctions,
  migratePropertyName,
  migrateReadOnly,
} from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { useFormData } from '@/providers';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settingsForm';
import { getEventHandlers } from '@/components/formDesigner/components/utils';

interface IEnhancedRadioProps extends Omit<IRadioProps, 'style'> {
  style?: string;
}

const Radio: IToolboxComponent<IEnhancedRadioProps> = {
  type: 'radio',
  name: 'Radio',
  icon: <CheckCircleOutlined />,
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.array,
  Factory: ({ model }) => {
    const allData = useAvailableConstantsData();
    const { style, ...restProps } = model;

    const { data: formData } = useFormData();

    return (
      <ConfigurableFormItem model={restProps}>
        {(value, onChange) => {
          const customEvents = getEventHandlers(model, allData);
          const onChangeInternal = (e: any) => {
            customEvents.onChange({...e, currentTarget: { value: e.target.value }});
            if (typeof onChange === 'function') onChange(e);
          };
          return (
            <RadioGroup {...restProps} {...customEvents} style={getStyle(style, formData)} value={value} onChange={onChangeInternal} />
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
