import { HomeOutlined } from '@ant-design/icons';
import React from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { useForm } from '../../../../providers';
import ReadOnlyDisplayFormItemWrapper from '../../../readOnlyDisplayFormItem/wrapper';
import ConfigurableFormItem from '../formItem';
import AutoCompletePlacesControl from './control';
import { IAddressCompomentProps } from './models';
import AddressSettings from './settings';
import { getAddressModel } from './utils';

const AddressCompoment: IToolboxComponent<IAddressCompomentProps> = {
  type: 'address',
  name: 'Address',
  icon: <HomeOutlined />,
  factory: (model: IAddressCompomentProps) => {
    const { formMode } = useForm();

    const readOnly = model?.readOnly || formMode === 'readonly';

    const addressModel = getAddressModel(model);

    return (
      <ConfigurableFormItem model={addressModel}>
        <ReadOnlyDisplayFormItemWrapper readOnly={readOnly} disabled={model?.disabled}>
          <AutoCompletePlacesControl {...model} />
        </ReadOnlyDisplayFormItemWrapper>
      </ConfigurableFormItem>
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
};

export default AddressCompoment;
