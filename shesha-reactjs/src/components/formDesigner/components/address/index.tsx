import { HomeOutlined } from '@ant-design/icons';
import { migratePropertyName, migrateCustomFunctions } from 'designer-components/_common-migrations/migrateSettings';
import React from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { useForm } from '../../../../providers';
import ReadOnlyDisplayFormItemWrapper from '../../../readOnlyDisplayFormItem/wrapper';
import ConfigurableFormItem from '../formItem';
import AutoCompletePlacesControl from './control';
import AddressEffect from './effect';
import { IAddressCompomentProps } from './models';
import AddressSettings from './settings';

const AddressCompoment: IToolboxComponent<IAddressCompomentProps> = {
  type: 'address',
  name: 'Address',
  icon: <HomeOutlined />,
  factory: (model: IAddressCompomentProps) => {
    const { formMode } = useForm();

    const readOnly = model?.readOnly || formMode === 'readonly';

    return (
      <AddressEffect externalApiKey={model?.googleMapsApiKey}>
        <ConfigurableFormItem model={model}>
          {(value, onChange) => { 
            return (
              <ReadOnlyDisplayFormItemWrapper value={value} readOnly={readOnly} disabled={model?.disabled}>
                <AutoCompletePlacesControl {...model} readOnly={readOnly} disabled={model?.disabled} value={value} onChange={onChange}/>
              </ReadOnlyDisplayFormItemWrapper>
            );
          }}
        </ConfigurableFormItem>
      </AddressEffect>
    );
  },
  settingsFormFactory: ({ readOnly, model, onSave, onCancel, onValuesChange }) => {
    return (
      <AddressSettings
        readOnly={readOnly}
        model={model}
        onSave={onSave as any}
        onCancel={onCancel}
        onValuesChange={onValuesChange as any}
      />
    );
  },
  migrator: (m) => m
    .add<IAddressCompomentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
  ,  
};

export default AddressCompoment;
