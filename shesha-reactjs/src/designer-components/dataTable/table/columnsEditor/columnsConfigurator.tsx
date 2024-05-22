import { Button } from 'antd';
import React, { FC } from 'react';
import { SidebarContainer } from '@/components';
import { useColumnsConfigurator } from '@/providers/datatableColumnsConfigurator';
import { ColumnProperties } from './columnProperties';
import ColumnsContainer from './columnsContainer';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';

export interface IColumnsConfiguratorProps { }

export const ColumnsConfigurator: FC<IColumnsConfiguratorProps> = () => {
  const { items, addColumn: addButton, addGroup, readOnly } = useColumnsConfigurator();
  const { styles } = useStyles();

  return (
    <div className={styles.shaToolbarConfigurator}>
      <h4>Here you can configure columns by adjusting their settings and ordering.</h4>
      {!readOnly && (
        <div className={styles.shaActionButtons}>
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
          resizable: true,
          configurator: true,
        }}
      >
        <ColumnsContainer items={items} index={[]} />
      </SidebarContainer>
    </div>
  );
};

export default ColumnsConfigurator;
