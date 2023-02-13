import React, { FC, memo } from 'react';
import { Button } from 'antd';
import { SidebarContainer } from '../../';
import { ToolbarItemProperties } from './itemProperties';
import SidebarItemsContainer from './sidebarItemsContainer';
import { useSidebarMenuConfigurator } from '../../../providers/sidebarMenuConfigurator';
import '../styles/index.less';

export interface ISidebarConfiguratorProps {}

const Configurator: FC<ISidebarConfiguratorProps> = () => {
  const { items, addItem, addGroup } = useSidebarMenuConfigurator();

  return (
    <div className="sha-sidebar-configurator">
      <h4>You can customize the Menu component from this screen.</h4>
      <div className="sha-action-buttons">
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
        }}
      >
        <SidebarItemsContainer items={items} index={[]} />
      </SidebarContainer>
    </div>
  );
};

const SidebarConfigurator = memo(Configurator);

export default SidebarConfigurator;
