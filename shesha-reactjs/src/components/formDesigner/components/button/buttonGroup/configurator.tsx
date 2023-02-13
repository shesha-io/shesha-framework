import React, { FC, ReactNode } from 'react';
import { Alert, Button } from 'antd';
import { SidebarContainer } from '../../../..';
import { ButtonGroupProperties } from './properties';
import ButtonGroupItemsContainer from './buttonGrouptemsContainer';
import { useButtonGroupConfigurator } from '../../../../../providers/buttonGroupConfigurator';
import './styles/index.less';

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

    return 'Properties';
  };

  return (
    <div className="sha-button-group-configurator">
      <Alert message={<h4>{readOnly ? 'Here you can view buttons configuration.' : 'Here you can configure the button group by adjusting their settings and ordering.'}</h4>} />

      {!readOnly && (
        <div className="sha-action-buttons">
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
        }}
      >
        <ButtonGroupItemsContainer items={items} index={[]} />
      </SidebarContainer>
    </div>
  );
};

export default ButtonGroupConfigurator;
