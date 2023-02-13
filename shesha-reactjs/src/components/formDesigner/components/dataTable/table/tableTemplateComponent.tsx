import { IConfigurableFormComponent, IToolboxComponent } from '../../../../../interfaces';
import { TableOutlined } from '@ant-design/icons';
import React from 'react';
import templateJson from './tableTemplate.json';
import { generateNewKey } from './utils';

const TableTemplateComponent: IToolboxComponent = {
  type: 'datatable_template',
  name: 'DataTable (Full)',
  isTemplate: true,
  icon: <TableOutlined />,
  factory: () => {
    return <>test</>;
  },
  build: () => {
    const components: IConfigurableFormComponent[] = generateNewKey(templateJson) as IConfigurableFormComponent[];

    return components;
  },
};

export default TableTemplateComponent;
