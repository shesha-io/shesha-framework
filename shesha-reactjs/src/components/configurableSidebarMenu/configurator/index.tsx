import React, { FC, memo } from 'react';
import { Button } from 'antd';
import { SidebarContainer } from '@/components/';
import { ToolbarItemProperties } from './itemProperties';
import SidebarItemsContainer from './sidebarItemsContainer';
import { useSidebarMenuConfigurator } from '@/providers/sidebarMenuConfigurator';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';

export interface ISidebarConfiguratorProps { }

const Configurator: FC<ISidebarConfiguratorProps> = () => {
  const { styles } = useStyles();
  const { items, addItem, addGroup } = useSidebarMenuConfigurator();

  return (
    <div className={styles.shaToolbarConfigurator}>
      <h4>You can customize the Menu component from this screen.</h4>
      <div className={styles.shaActionButtons}>
        <Button onClick={addGroup} type="primary">
          Add Group
        </Button>
        <Button onClick={addItem} type="primary">
          Add New Item
        </Button>
      </div>
      <SidebarContainer
        rightSidebarProps={{
          open: true,
          title: 'Properties',
          content: <ToolbarItemProperties />,
          resizable: true,
          configurator: true,

        }}
      >
        <SidebarItemsContainer items={items} index={[]} />
      </SidebarContainer>
    </div>
  );
};

const SidebarConfigurator = memo(Configurator);

export default SidebarConfigurator;
