import { EnvironmentOutlined } from '@ant-design/icons';
import React from 'react';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import { IToolboxComponent } from '@/interfaces';
import {
  migrateCustomFunctions,
  migratePropertyName,
  migrateReadOnly,
} from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '@/designer-components/_common-migrations/migrateFormApi1';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import AddressInputControl from './control';
import { IAddressInputComponentProps } from './interfaces';
import { getSettings } from './settingsForm';

const AddressInputComponent: IToolboxComponent<IAddressInputComponentProps> = {
  type: 'addressInput',
  name: 'Address Input',
  isInput: true,
  isOutput: true,
  icon: <EnvironmentOutlined />,

  Factory: ({ model }) => {
    const finalStyle =
      !model.enableStyleOnReadonly && model.readOnly
        ? {
          ...model.allStyles.fontStyles,
          ...model.allStyles.dimensionsStyles,
        }
        : model.allStyles.fullStyle;

    if (model.hidden) return null;

    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) =>
          model.readOnly && !model.enableMapInterface ? (
            <ReadOnlyDisplayFormItem value={value} style={finalStyle} />
          ) : (
            <AddressInputControl
              value={value}
              onChange={onChange}
              placeholder={model.placeholder}
              readOnly={model.readOnly}
              googleMapsApiKey={model.googleMapsApiKey}
              enableMapInterface={model.enableMapInterface}
              latitudePropertyName={model.latitudePropertyName}
              longitudePropertyName={model.longitudePropertyName}
              defaultZoom={model.defaultZoom ?? 15}
              mapHeight={model.mapHeight ?? 400}
            />
          )}
      </ConfigurableFormItem>
    );
  },

  initModel: (model) => ({
    ...model,
    defaultZoom: 15,
    mapHeight: 400,
    enableMapInterface: false,
  }),

  settingsFormMarkup: getSettings,

  validateSettings: (model) =>
    validateConfigurableComponentSettings(getSettings, model),

  migrator: (m) =>
    m
      .add<IAddressInputComponentProps>(0, (prev) =>
        migratePropertyName(migrateCustomFunctions(prev)),
      )
      .add<IAddressInputComponentProps>(1, (prev) => migrateVisibility(prev))
      .add<IAddressInputComponentProps>(2, (prev) => migrateReadOnly(prev))
      .add<IAddressInputComponentProps>(3, (prev) => ({
        ...migrateFormApi.eventsAndProperties(prev),
      })),
};

export default AddressInputComponent;
