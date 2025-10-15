import React, { FC, useMemo, useState } from 'react';
import { Button } from 'antd';
import { SidebarContainer } from '@/components/';
import { ToolbarItemProperties } from './itemProperties';
import ItemsContainer from './itemsContainer';
import { usePropertiesEditor } from '../provider';
import { IPropertiesEditorProps } from '..';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';

export const PropertiesEditorRenderer: FC<IPropertiesEditorProps> = ({
  allowAdd = false,
}) => {
  const { items, addItem, selectedItemRef } = usePropertiesEditor();
  const { styles } = useStyles();
  const [rightWidth, setRightWidth] = useState<number | undefined>(undefined);

  const onAddClick = (): void => {
    addItem().then((_item) => {
      const element = selectedItemRef?.current;
      if (element) {
        const offset = 0;

        // get how much pixels left to scrolling our ReactElement
        const top = element.getBoundingClientRect().top;
        const isVisible = top + offset >= 0 && top - offset <= window.innerHeight;
        if (!isVisible)
          element?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
      }
    });
  };

  const onDragEnd = (sizes: number[]): void => {
    setRightWidth(sizes[1]);
  };

  const rightSidebar = useMemo(() => {
    return {
      open: true,
      title: 'Properties',
      content: <ToolbarItemProperties />,
      width: rightWidth,
    };
  }, [rightWidth]);

  return (
    <div className={styles.shaToolbarConfigurator}>
      {allowAdd && (
        <div className={styles.shaActionButtons} style={{ marginBottom: '8px' }}>
          <Button onClick={onAddClick} type="primary">
            Add Property
          </Button>
        </div>
      )}

      <SidebarContainer
        onDragEnd={onDragEnd}
        rightSidebarProps={rightSidebar}
      >
        <div>
          <ItemsContainer items={items} index={[]} />
        </div>
      </SidebarContainer>
    </div>
  );
};
