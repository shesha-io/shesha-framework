import React, { FC, useMemo } from 'react';
import ToolboxComponent from './toolboxComponent';
import { Collapse, Empty } from 'antd';
import { useLocalStorage } from '@/hooks';
import { ItemInterface, ReactSortable } from 'react-sortablejs';
import { TOOLBOX_COMPONENT_DROPPABLE_KEY } from '@/providers/form/models';
import { IToolboxComponentGroup } from '@/interfaces';
import { SearchBox } from './toolboxSearchBox';
import { useFormDesigner } from '@/providers/formDesigner';
import { useStyles } from './styles/styles';

const { Panel } = Collapse;

export interface IToolboxComponentsProps {}

export const ToolboxComponents: FC<IToolboxComponentsProps> = () => {
  const [openedKeys, setOpenedKeys] = useLocalStorage('shaDesigner.toolbox.components.openedKeys', ['']);
  const [searchText, setSearchText] = useLocalStorage('shaDesigner.toolbox.components.search', '');
  const { styles }  = useStyles();

  const { toolboxComponentGroups, startDraggingNewItem, endDraggingNewItem } = useFormDesigner();

  const filteredGroups = useMemo<IToolboxComponentGroup[]>(() => {
    if (!Boolean(searchText)) return [...toolboxComponentGroups];

    const result: IToolboxComponentGroup[] = [];

    toolboxComponentGroups.forEach((group) => {
      const filteredComponents = group.components.filter((c) =>
        c.name?.toLowerCase().includes(searchText?.toLowerCase())
      );
      if (filteredComponents.length > 0) result.push({ ...group, components: filteredComponents });
    });
    return result;
  }, [toolboxComponentGroups, searchText]);

  const onCollapseChange = (key: string | string[]) => {
    setOpenedKeys(Array.isArray(key) ? key : [key]);
  };

  const onDragStart = () => {
    startDraggingNewItem();
  };

  const onDragEnd = (_evt) => {
    endDraggingNewItem();
  };

  let idx = 0;
  return (
    <>
      <SearchBox value={searchText} onChange={setSearchText} placeholder="Search components" />
      {filteredGroups.length > 0 && (
        <Collapse activeKey={openedKeys} onChange={onCollapseChange} accordion>
          {filteredGroups
            .filter(({ visible }) => visible)
            .map((group, groupIndex) => {
              const visibleComponents = group.components.filter((c) => c.isHidden !== true);

              const sortableItems = visibleComponents.map<ItemInterface>((component) => {
                return {
                  id: component.type,
                  parent_id: null,
                  type: TOOLBOX_COMPONENT_DROPPABLE_KEY,
                };
              });

              return visibleComponents.length === 0 ? null : (
                <Panel header={group.name} key={groupIndex.toString()}>
                  <ReactSortable
                    list={sortableItems}
                    setList={() => {
                      /* nop */
                    }}
                    group={{
                      name: 'shared',
                      pull: 'clone',
                      put: false,
                    }}
                    sort={false}
                    draggable={`.${styles.shaToolboxComponent}`}
                    ghostClass={styles.shaComponentGhost}
                    onStart={onDragStart}
                    onEnd={onDragEnd}
                  >
                    {visibleComponents.map((component, componentIndex) => {
                      idx++;
                      return (
                        <ToolboxComponent
                          key={`Group${groupIndex}:Component${componentIndex}`}
                          component={component}
                          index={idx}
                        />
                      );
                    })}
                  </ReactSortable>
                </Panel>
              );
            })}
        </Collapse>
      )}
      {filteredGroups.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Components not found" />}
    </>
  );
};

export default ToolboxComponents;
