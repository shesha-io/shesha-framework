import React, { FC, Fragment } from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { IConfigurableFormComponent } from '../../../../providers/form/models';
import { FilterOutlined } from '@ant-design/icons';
import { validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import { useForm } from '../../../../providers';
import { alertSettingsForm } from './settings';
import { Form } from 'antd';

export interface IFilterProps extends IConfigurableFormComponent {}

const FilterComponent: IToolboxComponent<IFilterProps> = {
  type: 'filter',
  name: 'Filter',
  icon: <FilterOutlined />,
  factory: (model: IFilterProps) => {
    const { isComponentHidden } = useForm();

    const isHidden = isComponentHidden(model);

    if (isHidden) return null;

    return <div />;
  },
  settingsFormMarkup: alertSettingsForm,
  validateSettings: model => validateConfigurableComponentSettings(alertSettingsForm, model),
};

interface IFilterValue {
  entityType?: string;
  properties?: string[];
}

interface IFilterRenderer {
  value?: IFilterValue;
  onChange: (value: IFilterValue) => {};
}

const IFilterRenderer: FC<IFilterRenderer> = () => {
  return (
    <Fragment>
      <Form.Item label>

      </Form.Item>
      <Form.Item></Form.Item>
    </Fragment>
  );
};

export default FilterComponent;
