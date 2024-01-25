import React from 'react';
import { ConfigurableFormItem } from '@/components';
import { FilterOutlined } from '@ant-design/icons';
import { ICustomFilterComponentProps } from './interfaces';
import { IToolboxComponent } from '@/interfaces';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { CustomFilter } from './customFilter';

const CustomFilterComponent: IToolboxComponent<ICustomFilterComponentProps> = {
  type: 'filter',
  name: 'Filter',
  icon: <FilterOutlined />,
  isHidden: true,
  Factory: ({ model }) => {
    return (
      <ConfigurableFormItem model={model}>
        <CustomFilter target={model?.target} />
      </ConfigurableFormItem>
    );
  },
  initModel: (model: ICustomFilterComponentProps) => {
    return {
      ...model,
      filters: [],
    };
  },
  migrator:  m => m
    .add<ICustomFilterComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev) as ICustomFilterComponentProps))
    .add<ICustomFilterComponentProps>(1, (prev) => migrateVisibility(prev))
  ,
};

export default CustomFilterComponent;