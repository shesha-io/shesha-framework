import { IReferenceListIdentifier } from "@/interfaces";
import { IButtonGroupItem, IButtonItem, IConfigurableFormComponent } from "@/providers";

export type RefListGroupItemProps = IRefListItemFormModel | IRefListItemGroup;

export interface IRefListGroupItemBase extends Omit<IButtonItem, 'childItems'> {
  referenceList?: IReferenceListIdentifier | undefined;
  item?: string | undefined;
}

export type IRefListItemFormModel = IRefListGroupItemBase;

export interface IRefListItemGroup extends IRefListGroupItemBase {
  childItems?: RefListGroupItemProps[] | undefined;
}

export const isIRefListItemGroup = (item: IRefListGroupItemBase): item is IRefListItemGroup => (item as IRefListItemGroup).childItems !== undefined;

export interface IChevronProps extends IConfigurableFormComponent {
  items?: IChevronButton[] | undefined;
  description: string;
  image?: string | undefined;
  imageStyle?: boolean | undefined;
  imageSize?: number | undefined;
  referenceList?: IReferenceListIdentifier | undefined;
  activeColor?: string | undefined;
  fontColor?: string | undefined;
  showIcons?: boolean | undefined;
  colorSource?: 'primary' | 'custom' | 'reflist' | undefined;
  width?: number | undefined;
  height?: number | undefined;
  fontSize?: number | undefined;
}

export interface IChevronButton extends IButtonGroupItem {
  itemValue: number;
  item: string;
}
