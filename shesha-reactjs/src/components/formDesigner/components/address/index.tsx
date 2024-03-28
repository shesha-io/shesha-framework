import { HomeOutlined } from '@ant-design/icons';
import { migratePropertyName, migrateCustomFunctions, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import React from 'react';
import { IToolboxComponent } from '@/interfaces';
import ReadOnlyDisplayFormItemWrapper from '../../../readOnlyDisplayFormItem/wrapper';
import ConfigurableFormItem from '../formItem';
import AutoCompletePlacesControl from './control';
import AddressEffect from './effect';
import { IAddressCompomentProps } from './models';
import { AddressSettingsForm } from './settings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';

const AddressCompoment: IToolboxComponent<IAddressCompomentProps> = {
  type: 'address',
  name: 'Address',
  isInput: true,
  isOutput: true,
  icon: <HomeOutlined />,
  Factory: ({ model }) => {
    return (
      <AddressEffect externalApiKey={model?.googleMapsApiKey}>
        <ConfigurableFormItem model={model}>
          {(value, onChange) => { 
            return (
              <ReadOnlyDisplayFormItemWrapper value={value} readOnly={model.readOnly}>
                <AutoCompletePlacesControl {...model} value={value} onChange={onChange}/>
              </ReadOnlyDisplayFormItemWrapper>
            );
          }}
        </ConfigurableFormItem>
      </AddressEffect>
    );
  },
  settingsFormFactory: (props) => (<AddressSettingsForm {...props} />),
  migrator: (m) => m
    .add<IAddressCompomentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IAddressCompomentProps>(1, (prev) => migrateVisibility(prev))
    .add<IAddressCompomentProps>(2, (prev) => migrateReadOnly(prev))
  ,  
};

export default AddressCompoment;
