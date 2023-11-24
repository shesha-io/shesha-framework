import { PlusSquareFilled } from '@ant-design/icons';
import { Button } from 'antd';
import React, { FC } from 'react';
import { SidebarContainer } from '../../../components';
import { useTableViewSelectorConfigurator } from '@/providers/tableViewSelectorConfigurator';
import FilterContainer from './filterContainer';
import { FilterProperties } from './filterProperties';

export interface IFilterConfiguratorProps {}

export const FilterConfigurator: FC<IFilterConfiguratorProps> = () => {
  const { items, addItem, readOnly } = useTableViewSelectorConfigurator();

  return (
    <div className="sha-toolbar-configurator">
      <h4>Here you can create your own filters or adjust their settings and ordering</h4>
      {!readOnly && (
        <div className="sha-action-buttons">
          <Button onClick={addItem} type="primary" icon={<PlusSquareFilled />}>
            Add New Item
          </Button>
        </div>
      )}
      <SidebarContainer
        rightSidebarProps={{
          open: true,
          title: () => 'Properties',
          content: () => <FilterProperties />,
        }}
      >
        <FilterContainer items={items} index={[]} />
      </SidebarContainer>
    </div>
  );
};

export default FilterConfigurator;
