import { TableOutlined } from '@ant-design/icons';
import { componentsFlatStructureToTree, componentsTreeToFlatStructure, upgradeComponents } from 'providers/form/utils';
import React from 'react';
import { DEFAULT_FORM_SETTINGS, IConfigurableFormComponent, IToolboxComponent } from '../../../interfaces';
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
  build: (designerComponents) => {
    const components: IConfigurableFormComponent[] = generateNewKey(templateJson) as IConfigurableFormComponent[];

    const flatStructure = componentsTreeToFlatStructure(designerComponents, components);
    upgradeComponents(designerComponents, DEFAULT_FORM_SETTINGS, flatStructure);
    const tree = componentsFlatStructureToTree(designerComponents, flatStructure);

    return tree;
  },
};

export default TableTemplateComponent;
