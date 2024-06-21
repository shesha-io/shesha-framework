import React from 'react';
import { IToolboxComponent } from '@/interfaces';
import { FilterOutlined } from '@ant-design/icons';
import { getStyle, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { getSettings } from './settingsForm';
import { AdvancedFilterButton } from './advancedFilterButton';
import { IButtonComponentProps } from '@/designer-components/button/interfaces';
import { useFormData } from '@/index';

const FilterComponent: IToolboxComponent<IButtonComponentProps> = {
  type: 'datatable.filter',
  name: 'Table Filter',
  icon: <FilterOutlined />,
  Factory: ({ model }) => {

    return model.hidden ? null : <AdvancedFilterButton {...model}/>
  },
  initModel: (model) => {
    return {
      ...model,
      type: 'link',
      label: "",
    };
  },
  settingsFormMarkup: (context) => getSettings(context),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
};

export default FilterComponent;
