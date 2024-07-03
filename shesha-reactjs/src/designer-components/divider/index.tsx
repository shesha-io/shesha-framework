import { LineOutlined } from '@ant-design/icons';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import React from 'react';
import { validateConfigurableComponentSettings } from '@/formDesignerUtils';
import { IConfigurableFormComponent, IToolboxComponent } from '@/interfaces/formDesigner';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { ISectionSeparatorProps, SectionSeparator } from '@/components';
import { getSettings } from './settings';

export interface IDividerProps extends IConfigurableFormComponent {
  dividerType?: 'horizontal' | 'vertical';
  dashed?: boolean;
}


const DividerComponent: IToolboxComponent<ISectionSeparatorProps> = {
  type: 'divider',
  name: 'Divider',
  icon: <LineOutlined />,
  Factory: ({ model }) => {


    return (
      <SectionSeparator {...model} />
    );
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
  migrator: (m) => m
    .add<IDividerProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IDividerProps>(3, (prev) => ({ ...migrateFormApi.properties(prev) }))
  ,
  initModel: (model) => ({
    dividerType: 'horizontal',
    dashed: false,
    ...model,
  }),
};

export default DividerComponent;
