import { ItemInterface } from "react-sortablejs";

export type ListMode = 'create' | 'read' | 'update';

export interface ListItem {
    itemType?: 'item' | 'group';
    itemSubType?: 'button' | 'item' | 'divider' | 'dynamic' | 'separator' | 'line';
}

export type ListGroup = { id?: string; itemType: 'group'; childItems?: ListItemWithId[] };
export type ListButton = { id: string; itemType: 'item'; itemSubType: 'button' };
export type ListDivider = { id: string; itemType: 'item'; itemSubType: 'divider' };
export type ListGenericItem = { id: string; itemType: 'item'; itemSubType: 'item' };

export type ListItemWithId = ListGroup | ListButton | ListDivider | ListGenericItem;

export interface SortableItem<ListItemType> extends ItemInterface {
    data: ListItemType;
}