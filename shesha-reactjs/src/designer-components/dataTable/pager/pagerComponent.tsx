import { IToolboxComponent } from 'interfaces';
import { ControlOutlined } from '@ant-design/icons';
import { getSettings } from './settingsForm';
import { ITablePagerProps, TablePager } from 'components';
import React from 'react';
import { useForm } from 'providers';
import { IConfigurableFormComponent } from 'providers/form/models';
import { validateConfigurableComponentSettings } from 'providers/form/utils';

export interface IPagerComponentProps extends ITablePagerProps, IConfigurableFormComponent {}

const PagerComponent: IToolboxComponent<IPagerComponentProps> = {
  type: 'datatable.pager',
  name: 'Table Pager',
  icon: <ControlOutlined />,
  factory: (model: IPagerComponentProps) => {
    const { isComponentHidden } = useForm();

    if (isComponentHidden(model)) return null;

    return <TablePager {...model} />;
  },
  migrator:  m => m
  .add<IPagerComponentProps>(0, prev => {
    return {
      ...prev,
      showSizeChanger: true,
      showTotalItems: true,
      items: [],
    };
  }),
  settingsFormMarkup: context => getSettings(context),
  validateSettings: model => validateConfigurableComponentSettings(getSettings(model), model),
};

export default PagerComponent;
