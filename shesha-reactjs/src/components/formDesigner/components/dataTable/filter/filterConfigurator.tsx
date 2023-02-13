import React, { FC } from 'react';
import { Button } from 'antd';
import { SidebarContainer } from '../../../..';
import { FilterProperties } from './filterProperties';
import FilterContainer from './filterContainer';
import { useTableViewSelectorConfigurator } from '../../../../../providers/tableViewSelectorConfigurator';
import { PlusSquareFilled } from '@ant-design/icons';

export interface IFilterConfiguratorProps { }

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
