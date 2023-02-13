import React, { FC, ReactNode } from 'react';
import { Alert, Button } from 'antd';
import { SidebarContainer } from '../../..';
import { ItemConfigProperties } from './properties';
import ItemListContainer from './listItemsContainer';
import { useItemListConfigurator } from '../../../..';
import './styles/index.less';

export interface IItemListConfiguratorProps {
  allowAddGroups?: boolean;
  render?: ReactNode | (() => ReactNode);
  heading?: ReactNode | (() => ReactNode);
}

export const ItemListConfigurator: FC<IItemListConfiguratorProps> = ({ allowAddGroups = true, render, heading }) => {
  const { items, addItem, addGroup } = useItemListConfigurator();

  const content = () => {
    if (Boolean(render)) {
      if (typeof render === 'function') {
        return render();
      } else {
        return <>{render}</>;
      }
    }

    return <ItemConfigProperties />;
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
      <Alert message={<h4>Here you can configure the items by adjusting their settings and ordering.</h4>} />

      <div className="sha-action-buttons">
        {allowAddGroups && (
          <Button onClick={addGroup} type="primary">
            Add Group
          </Button>
        )}

        <Button onClick={addItem} type="primary">
          Add New Item
        </Button>
      </div>

      <SidebarContainer
        rightSidebarProps={{
          open: true,
          title,
          content,
        }}
      >
        <ItemListContainer items={items} index={[]} />
      </SidebarContainer>
    </div>
  );
};

export default ItemListConfigurator;
