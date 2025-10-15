import React from "react";
import { ListEditorSectionRenderingArgs } from "@/components/listEditor";
import { Button } from "antd";
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';
import { ListItemWithId } from "../listEditor/models";

export const DefaultGroupHeader = <TItem extends ListItemWithId>({ contextAccessor, addItemText }: ListEditorSectionRenderingArgs<TItem>): JSX.Element => {
  const { addItem, readOnly } = contextAccessor();
  const { styles } = useStyles();

  const onAddItemClick = (): void => {
    addItem();
  };

  return !readOnly
    ? (
      <div className={styles.customActionButtons}>
        <Button onClick={onAddItemClick} type="primary">{ addItemText ?? 'Add New Item' }</Button>
      </div>
    ) : null;
};
