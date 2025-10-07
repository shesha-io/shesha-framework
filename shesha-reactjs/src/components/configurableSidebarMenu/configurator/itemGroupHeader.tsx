import React, { FC } from "react";
import { ListEditorSectionRenderingArgs } from "@/components/listEditor";
import { ISidebarGroup, ISidebarMenuItem, isSidebarGroup } from "@/interfaces/sidebar";
import { nanoid } from "@/utils/uuid";
import { Button, Divider } from "antd";
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';

export const ItemGroupHeader: FC<ListEditorSectionRenderingArgs<ISidebarMenuItem>> = ({ contextAccessor, level, parentItem }) => {
  const { addItem, readOnly } = contextAccessor();
  const { styles } = useStyles();

  const onAddItemClick = (): void => {
    addItem();
  };

  const onAddGroupClick = (): void => {
    addItem((items) => {
      const itemsCount = (items ?? []).length;
      const itemNo = itemsCount + 1;

      const group: ISidebarGroup = {
        id: nanoid(),
        itemType: 'group',
        title: `Group ${itemNo}`,
        childItems: [],
      };
      return group;
    });
  };

  const parent = isSidebarGroup(parentItem)
    ? parentItem
    : undefined;

  return !readOnly
    ? level === 1
      ? (
        <div className={styles.customActionButtons}>
          <Button onClick={onAddGroupClick} type="primary">Add Group</Button>
          <Button onClick={onAddItemClick} type="primary">Add New Item</Button>
        </div>
      )
      : !(parent.childItems?.length)
        ? (
          <Divider style={{ marginTop: 0, marginBottom: 0 }}>
            <Button shape="round" size="small" type="link" onClick={onAddItemClick}>Add item</Button>
            <Divider type="vertical" />
            <Button shape="round" size="small" type="link" onClick={onAddGroupClick}>Add group</Button>
          </Divider>
        )
        : null
    : null;
};
