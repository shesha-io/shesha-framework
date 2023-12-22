import React from 'react';
import { IToolboxComponent } from '@/interfaces';
import { FormMarkup, IConfigurableFormComponent } from '@/providers/form/models';
import ConfigurableFormItem from '../formItem';
import settingsFormJson from './settingsForm.json';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { FileOutlined } from '@ant-design/icons';
import { useFormData } from '@/providers';
import _ from 'lodash';

export interface IBasicDisplayFormItemProps extends IConfigurableFormComponent {}

const settingsForm = settingsFormJson as FormMarkup;

// TODO:: Remove this component. No longer needed
const BasicDisplayFormItemComponent: IToolboxComponent<IBasicDisplayFormItemProps> = {
  type: 'displayFormItem',
  name: 'Display Form Item',
  icon: <FileOutlined />,
  isHidden: true,
  Factory: ({ model }) => {
    const { data } = useFormData();

    const getDisplayValue = () => {
      const value = _.get(data, model?.componentName);

      return typeof value === 'object' ? null : _.get(data, model?.componentName);
    };

    return (
      <ConfigurableFormItem model={model} className="display-form-item">
        <span>{data ? getDisplayValue() : ''}</span>
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
};

export default BasicDisplayFormItemComponent;
