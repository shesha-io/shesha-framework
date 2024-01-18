import React, { FC } from 'react';
import { ItemInterface, ReactSortable } from 'react-sortablejs';
import { useTableViewSelectorConfigurator } from '@/providers/tableViewSelectorConfigurator';
import { ITableViewProps } from '@/providers/tableViewSelectorConfigurator/models';
import { TableView } from './tableView';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';

export interface ITableViewContainerProps {
  index?: number[];
  items: ITableViewProps[];
  onConfigClick?: (selectedItemId: string) => void;
  readOnly?: boolean;
}

export const TableViewContainer: FC<ITableViewContainerProps> = ({ onConfigClick, readOnly, ...props }) => {
  const { updateChildItems } = useTableViewSelectorConfigurator();
  const { styles } = useStyles();

  const onSetList = (newState: ItemInterface[], _sortable, _store) => {
    // temporary commented out, the behavoiur of the sortablejs differs sometimes
    const listChanged = true; //!newState.some(item => item.chosen !== null && item.chosen !== undefined);

    if (listChanged) {
      const newChilds = newState.map<ITableViewProps>((item) => item as ITableViewProps);
      updateChildItems({ index: props.index, childs: newChilds });
    }
    return;
  };

  return (
    <div className={styles.shaToolbarConfigurator}>
      <div className={styles.sidebarContainerMainArea}>
        <ReactSortable
          disabled={readOnly}
          list={props.items}
          setList={onSetList}
          fallbackOnBody={true}
          swapThreshold={0.5}
          group={{
            name: 'toolbarItems',
          }}
          sort={true}
          draggable={`.${styles.shaToolbarItem}`}
          animation={75}
          ghostClass={styles.shaToolbarItemGhost}
          emptyInsertThreshold={20}
          handle={`.${styles.shaToolbarItemDragHandle}`}
          scroll={true}
          bubbleScroll={true}
        >
          {props.items.map((item, index) => (
            <TableView index={[index]} key={index} {...item} onConfigClick={onConfigClick} />
          ))}
        </ReactSortable>
      </div>
    </div>
  );
};
export default TableViewContainer;
