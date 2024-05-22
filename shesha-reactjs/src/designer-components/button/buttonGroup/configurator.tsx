import React, { FC, ReactNode } from 'react';
import { Alert, Button } from 'antd';
import { ButtonGroupProperties } from './properties';
import ButtonGroupItemsContainer from './buttonGroupItemsContainer';
import { useButtonGroupConfigurator } from '@/providers/buttonGroupConfigurator';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';
import { SidebarContainer } from '@/components/sidebarContainer';

export interface IButtonGroupConfiguratorProps {
  allowAddGroups?: boolean;
  render?: ReactNode | (() => ReactNode);
  heading?: ReactNode | (() => ReactNode);
}

export const ButtonGroupConfigurator: FC<IButtonGroupConfiguratorProps> = ({
  allowAddGroups = true,
  render,
  heading,
}) => {
  const { styles } = useStyles();
  const { items, addButton, addGroup, readOnly } = useButtonGroupConfigurator();

  const content = () => {
    if (Boolean(render)) {
      if (typeof render === 'function') {
        return render();
      } else {
        return <>{render}</>;
      }
    }

    return <ButtonGroupProperties />;
  };

  const title = () => {
    if (Boolean(heading)) {
      if (typeof heading === 'function') {
        return heading();
      } else {
        return <>{heading}</>;
      }
    }

    return "Properties";
  };

  return (
    <div className={styles.shaToolbarConfigurator}>
      <Alert message={readOnly ? 'Here you can view buttons configuration.' : 'Here you can configure the button group by adjusting their settings and ordering.'} />

      {!readOnly && (
        <div className={styles.shaActionButtons}>
          {allowAddGroups && (
            <Button onClick={addGroup} type="primary">
              Add Group
            </Button>
          )}

          <Button onClick={addButton} type="primary">
            Add New Item
          </Button>
        </div>
      )}

      <SidebarContainer
        rightSidebarProps={{
          open: true,
          title,
          content,
          resizable: true,
          width: 350,
          configurator: true,

        }}

      >
        <ButtonGroupItemsContainer items={items} index={[]} />
      </SidebarContainer>
    </div>
  );
};

export default ButtonGroupConfigurator;
