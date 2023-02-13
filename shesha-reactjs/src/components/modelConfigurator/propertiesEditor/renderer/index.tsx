import React, { FC, useMemo } from 'react';
import { Tabs } from 'antd';
import { CodeEditor, SidebarContainer } from '../../../';
import { ToolbarItemProperties } from './itemProperties';
import ItemsContainer from './itemsContainer';
import { usePropertiesEditor } from '../provider';

export interface IModelConfiguratorProps { }

export const PropertiesEditorRenderer: FC<IModelConfiguratorProps> = () => {

  const { items, /*addItem, selectedItemRef*/ } = usePropertiesEditor();

  /*const onAddClick = () => {
    addItem().then(_item => {
      const element = selectedItemRef?.current;
      if (element) {
        const offset = 0;
        
        //get how much pixels left to scrolling our ReactElement
        const top = element.getBoundingClientRect().top;
        const isVisible = top + offset >= 0 && top - offset <= window.innerHeight;
        if (!isVisible)
          element?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
      }
    });
  }*/

  const jsonSchema = useMemo(() => {
    return JSON.stringify(items, null, 2);
  }, [items]);

  return (
    <Tabs items={[
      { label: "Designer", key: "1",
      children: <>
        {/*<div className="sha-action-buttons" style={{ marginBottom: '8px' }}>
          <Button onClick={onAddClick} type="primary">
            Add Property
          </Button>
        </div>*/}
        <div className="sha-sidebar-configurator">
          <SidebarContainer
            rightSidebarProps={{
              open: true,
              title: 'Properties',
              content: <ToolbarItemProperties />,
            }}
          >
            <ItemsContainer items={items} index={[]} />
          </SidebarContainer>
        </div>
        </>
      },
      { label: "Schema", key: "2", children: <CodeEditor value={jsonSchema} readOnly={true} width='100%' /> }
    ]} />
  );
};