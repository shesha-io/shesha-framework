import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import RadioGroup from './radioGroup';
import React from 'react';
import { CheckCircleOutlined } from '@ant-design/icons';
import { ArrayFormats, DataTypes } from '@/interfaces/dataTypes';
import { IInputStyles } from '@/providers/form/models';
import { getLegacyReferenceListIdentifier } from '@/utils/referenceList';
import { executeScriptSync, validateConfigurableComponentSettings } from '@/providers/form/utils';
import {
  migrateCustomFunctions,
  migratePropertyName,
  migrateReadOnly,
} from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settingsForm';
import { IRadioComponentProps, RadioComponentDefinition } from './interfaces';
import { isNullOrWhiteSpace } from '@/utils/nullables';
import { DataSourceType } from '../dropdown/model';
import { getNumberOrUndefined } from '@/utils/string';

const RadioComponent: RadioComponentDefinition = {
  type: 'radio',
  name: 'Radio',
  icon: <CheckCircleOutlined />,
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  // Radio has its own intrinsic size and should not be forced to fill wrapper
  preserveDimensionsInDesigner: true,
  dataTypeSupported: ({ dataType, dataFormat }) => dataType === DataTypes.referenceListItem || (dataType === DataTypes.array && dataFormat === ArrayFormats.simple),
  calculateModel: (model, allData) => ({
    dataSourceUrl: model.dataSourceUrl ? executeScriptSync(model.dataSourceUrl, allData) : model.dataSourceUrl,
  }),
  Factory: ({ model, calculatedModel }) => {
    return (
      <ConfigurableFormItem<number> model={model} autoAlignLabel={false}>
        {(value, onChange, _, ctx) => {
          return (
            <RadioGroup
              {...model}
              style={!model.enableStyleOnReadonly && model.readOnly ? {} : model.allStyles?.fullStyle}
              value={value ?? undefined}
              dataSourceUrl={calculatedModel.dataSourceUrl}
              onChange={(event) => {
                ctx?.handleEvent(event, event.target.value, model.onChangeCustom);
                onChange(getNumberOrUndefined(event.target.value) ?? null);
              }}
            />
          );
        }}
      </ConfigurableFormItem>
    );
  },

  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  migrator: (m) =>
    m
      .add<IRadioComponentProps>(0, (prev) => ({
        ...prev,
        dataSourceType: "dataSourceType" in prev && typeof (prev.dataSourceType) === 'string'
          ? (prev.dataSourceType as DataSourceType)
          : 'values',
        direction: "direction" in prev && typeof (prev.direction) === 'string'
          ? prev.direction as "horizontal" | "vertical"
          : 'horizontal',
      }))
      .add<IRadioComponentProps>(1, (prev) => {
        return {
          ...prev,
          // eslint-disable-next-line @typescript-eslint/no-deprecated
          referenceListId: getLegacyReferenceListIdentifier(prev.referenceListNamespace, prev.referenceListName) ?? undefined,
        };
      })
      .add<IRadioComponentProps>(2, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<IRadioComponentProps>(3, (prev) => migrateVisibility(prev))
      .add<IRadioComponentProps>(4, (prev) => migrateReadOnly(prev))
      .add<IRadioComponentProps>(5, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
      .add<IRadioComponentProps>(6, (prev) => {
        const styles: IInputStyles = {
          style: prev.style,
        };

        return { ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles } };
      }),
  linkToModelMetadata: (model, metadata): IRadioComponentProps => {
    const isRefList = metadata.dataType === DataTypes.referenceListItem;

    return {
      ...model,
      dataSourceType: isRefList ? 'referenceList' : 'values',
      referenceListId: isRefList && !isNullOrWhiteSpace(metadata.referenceListName) && !isNullOrWhiteSpace(metadata.referenceListModule)
        ? {
          module: metadata.referenceListModule,
          name: metadata.referenceListName,
        }
        : undefined,
    };
  },
};

export default RadioComponent;
