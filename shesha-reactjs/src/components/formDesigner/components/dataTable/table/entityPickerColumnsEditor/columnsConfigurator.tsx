import React, { FC } from 'react';
import { Button } from 'antd';
import { SidebarContainer } from '../../../../../../components';
import { ColumnProperties } from './columnProperties';
import ToolbarItemsContainer from './columnsContainer';
import { useColumnsConfigurator } from '../../../../../../providers/datatableColumnsConfigurator';
import './styles/index.less';

export interface IColumnsConfiguratorProps { }

export const ColumnsConfigurator: FC<IColumnsConfiguratorProps> = () => {
  const { items, addColumn: addButton, addGroup, readOnly } = useColumnsConfigurator();

  return (
    <div className="sha-toolbar-configurator">
      <h4>Here you can configure columns by adjusting their settings and ordering.</h4>
      {!readOnly && (
        <div className="sha-action-buttons">
          {false && (
            <Button onClick={addGroup} type="primary">
              Add Group
            </Button>
          )}
          <Button onClick={addButton} type="primary">
            Add Column
          </Button>
        </div>
      )}
      <SidebarContainer
        rightSidebarProps={{
          open: true,
          title: () => 'Properties',
          content: () => <ColumnProperties />,
        }}
      >
        <ToolbarItemsContainer items={items} index={[]} />
      </SidebarContainer>
    </div>
  );
};

export default ColumnsConfigurator;
