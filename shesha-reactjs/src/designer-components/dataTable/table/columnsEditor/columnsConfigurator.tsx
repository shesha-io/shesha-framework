import { Alert } from 'antd';
import React, { FC } from 'react';
import { ColumnProperties } from './columnProperties';
import { ColumnsItemProps, IDataColumnsProps, standardCellComponentTypes } from '@/providers/datatableColumnsConfigurator/models';
import { nanoid } from '@/utils/uuid';
import { ListEditorWithPropertiesPanel } from '@/components/listEditorWithPropertiesPanel';
import { Column } from './column';

export interface IColumnsConfiguratorProps {
  readOnly: boolean;
  value: ColumnsItemProps[];
  parentComponentType?: string;
  onChange: (newValue: ColumnsItemProps[]) => void;
}

export const ColumnsConfigurator: FC<IColumnsConfiguratorProps> = ({ value, onChange, readOnly, parentComponentType }) => {
  const makeNewItem = (items: ColumnsItemProps[]): ColumnsItemProps => {
    const safeItems = items ?? [];
    const itemsCount = safeItems.filter((i) => i.itemType === 'item').length;
    const itemNo = itemsCount + 1;

    const columnProps: IDataColumnsProps = {
      id: nanoid(),
      itemType: 'item',
      sortOrder: safeItems.length,
      caption: `Column ${itemNo}`,
      minWidth: 100,
      columnType: 'data',
      isVisible: true,
      propertyName: '',
      displayComponent: { type: standardCellComponentTypes.defaultDisplay },
      editComponent: { type: standardCellComponentTypes.notEditable },
      createComponent: { type: standardCellComponentTypes.notEditable },
      allowSorting: true,
    };

    return columnProps;
  };

  return (
    <ListEditorWithPropertiesPanel<ColumnsItemProps>
      value={value}
      onChange={onChange}
      initNewItem={makeNewItem}
      readOnly={readOnly}
      header={<Alert message={readOnly ? 'Here you can view columns configuration.' : 'Here you can configure columns by adjusting their settings and ordering.'} />}
      itemProperties={(itemProps) => (<ColumnProperties item={itemProps.item} onChange={itemProps.onChange} readOnly={itemProps.readOnly} parentComponentType={parentComponentType} />)}
      addItemText="Add Column"
    >
      {({ item }) => (
        <Column item={item} />
      )}
    </ListEditorWithPropertiesPanel>
  );
};

export default ColumnsConfigurator;
