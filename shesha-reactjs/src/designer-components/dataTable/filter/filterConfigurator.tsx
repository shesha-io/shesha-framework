import { PlusSquareFilled } from '@ant-design/icons';
import { Button } from 'antd';
import React, { FC } from 'react';
import { SidebarContainer } from '@/components';
import { useTableViewSelectorConfigurator } from '@/providers/tableViewSelectorConfigurator';
import FilterContainer from './filterContainer';
import { FilterProperties } from './filterProperties';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';

export interface IFilterConfiguratorProps { }

export const FilterConfigurator: FC<IFilterConfiguratorProps> = () => {
  const { items, addItem, readOnly } = useTableViewSelectorConfigurator();
  const { styles } = useStyles();

  return (
    <div className={styles.shaToolbarConfigurator}>
      <h4>Here you can create your own filters or adjust their settings and ordering</h4>
      {!readOnly && (
        <div className={styles.shaActionButtons}>
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
          resizable: true,
          configurator: true,
        }}
      >
        <FilterContainer items={items} index={[]} />
      </SidebarContainer>
    </div>
  );
};

export default FilterConfigurator;
