import React from 'react';
import settingsFormJson from './settingsForm.json';
import { FilterOutlined } from '@ant-design/icons';
import { FormMarkup, IConfigurableFormComponent } from '@/providers/form/models';
import { IToolboxComponent } from '@/interfaces';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { AdvancedFilterButton } from './advancedFilterButton';

export interface IAdvancedFilterButtonComponentProps extends IConfigurableFormComponent { }

const settingsForm = settingsFormJson as FormMarkup;

const AdvancedFilterButtonComponent: IToolboxComponent<IAdvancedFilterButtonComponentProps> = {
  type: 'datatable.advancedFilterButton',
  name: 'Table Advanced Filter Button',
  icon: <FilterOutlined />,
  Factory: ({ model }) => {
    if (model.hidden) return null;

    return <AdvancedFilterButton />;
  },
  initModel: (model: IAdvancedFilterButtonComponentProps) => {
    return {
      ...model,
      items: [],
    };
  },
  settingsFormMarkup: settingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
  isHidden: true, // note: to be removed, now is used only for backward compatibility
};

export default AdvancedFilterButtonComponent;
