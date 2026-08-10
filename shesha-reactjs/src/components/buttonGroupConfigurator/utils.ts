import { nanoid } from "@/utils/uuid";
import { ButtonGroupItemProps, IButtonGroupItem, IStyleValue } from "../..";

export const initialValues = (): IStyleValue => {
  return {
    background: {
      type: 'color',
      repeat: 'no-repeat',
      size: 'cover',
      position: 'center',
      gradient: { direction: 'to right', colors: [] },
    },
    font: { weight: '400', size: 14, align: 'center', type: 'Segoe UI' },
    dimensions: { width: 'auto', height: '32px', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
    border: {
      radiusType: 'all',
      borderType: 'all',
      hideBorder: false,
      border: { all: { width: '1px', style: 'solid' } },
      radius: { all: 8 },
    },
    shadow: { spreadRadius: 0, blurRadius: 0, color: '#000', offsetX: 0, offsetY: 0 },
  };
};

export const makeNewItem = (items: ButtonGroupItemProps[]): ButtonGroupItemProps => {
  const itemsCount = items.length;
  const itemNo = itemsCount + 1;

  const newItem: IButtonGroupItem = {
    id: nanoid(),
    itemType: 'item',
    sortOrder: itemsCount,
    name: `button${itemNo}`,
    label: `Button ${itemNo}`,
    itemSubType: 'button',
    buttonType: itemNo === 1 ? 'primary' : 'default',
    editMode: 'inherited',
    ...initialValues(),
  };

  return newItem;
};
