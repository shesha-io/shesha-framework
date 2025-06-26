import { HomeOutlined } from '@ant-design/icons';
import { migratePropertyName, migrateCustomFunctions, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import React from 'react';
import { IToolboxComponent } from '@/interfaces';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import AutoCompletePlacesControl from './control';
import { IAddressCompomentProps } from './models';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './formSettings';
import { getEventHandlers, useAvailableConstantsData } from '@/index';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';

const AddressCompoment: IToolboxComponent<IAddressCompomentProps> = {
  type: 'address',
  name: 'Address',
  isInput: true,
  isOutput: true,
  icon: <HomeOutlined />,
  Factory: ({ model }) => {
      const allData = useAvailableConstantsData();
    const customEvents = getEventHandlers(model, allData);
    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) => {
          return model.readOnly
            ? <ReadOnlyDisplayFormItem value={value} />
            : <AutoCompletePlacesControl {...model} value={value} onChange={onChange} onFocusCustom={customEvents.onFocus}/>
          ;
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: (data) => getSettings(data),
  migrator: (m) => m
    .add<IAddressCompomentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IAddressCompomentProps>(1, (prev) => migrateVisibility(prev))
    .add<IAddressCompomentProps>(2, (prev) => migrateReadOnly(prev))
    .add<IAddressCompomentProps>(3, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
    .add<IAddressCompomentProps>(4, (prev) => ({ ...prev, onSelectCustom: migrateFormApi.withoutFormData(prev.onSelectCustom) }))
  ,
};

export default AddressCompoment;
