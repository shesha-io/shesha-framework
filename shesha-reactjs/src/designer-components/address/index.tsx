import { HomeOutlined } from '@ant-design/icons';
import { migratePropertyName, migrateCustomFunctions, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import React from 'react';
import { IToolboxComponent } from '@/interfaces';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import AutoCompletePlacesControl from './control';
import { IAddressCompomentProps } from './models';
import { AddressSettingsForm } from './settings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import ReadOnlyDisplayFormItemWrapper from '@/components/readOnlyDisplayFormItem/wrapper';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';

const AddressCompoment: IToolboxComponent<IAddressCompomentProps> = {
  type: 'address',
  name: 'Address',
  isInput: true,
  isOutput: true,
  icon: <HomeOutlined />,
  Factory: ({ model }) => {
    return (
        <ConfigurableFormItem model={model}>
          {(value, onChange) => { 
            return (
              <ReadOnlyDisplayFormItemWrapper value={value} readOnly={model.readOnly}>
                <AutoCompletePlacesControl {...model} value={value} onChange={onChange}/>
              </ReadOnlyDisplayFormItemWrapper>
            );
          }}
        </ConfigurableFormItem>
    );
  },
  settingsFormFactory: (props) => (<AddressSettingsForm {...props} />),
  migrator: (m) => m
    .add<IAddressCompomentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IAddressCompomentProps>(1, (prev) => migrateVisibility(prev))
    .add<IAddressCompomentProps>(2, (prev) => migrateReadOnly(prev))
    .add<IAddressCompomentProps>(3, (prev) => ({...migrateFormApi.eventsAndProperties(prev)}))
    .add<IAddressCompomentProps>(4, (prev) => ({...prev, onSelectCustom: migrateFormApi.withoutFormData(prev.onSelectCustom)}))
  ,  
};

export default AddressCompoment;
