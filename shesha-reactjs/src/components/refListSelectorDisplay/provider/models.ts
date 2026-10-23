import { IReferenceListIdentifier } from "@/interfaces";
import { IButtonItem } from "@/providers";

export type RefListGroupItemProps = IRefListItemFormModel | IRefListItemGroup;

export interface IRefListGroupItemBase extends Omit<IButtonItem, 'childItems'> {
  referenceList?: IReferenceListIdentifier | undefined;
  item?: string | undefined;
  itemValue?: number | undefined;
}

export type IRefListItemFormModel = IRefListGroupItemBase;

export interface IRefListItemGroup extends IRefListGroupItemBase {
  childItems?: RefListGroupItemProps[] | undefined;
}

export const isIRefListItemGroup = (item: IRefListGroupItemBase): item is IRefListItemGroup => (item as IRefListItemGroup).childItems !== undefined;
