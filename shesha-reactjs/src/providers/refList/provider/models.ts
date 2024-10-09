import { IButtonGroupItem, IButtonItem, IConfigurableFormComponent } from "@/providers";

export type RefListGroupItemProps = IRefListItemFormModel | IRefListItemGroup;

export interface IRefListGroupItemBase extends IButtonItem{
  referenceList?: any;
  item?: string;
}

export interface IRefListItemFormModel extends IRefListGroupItemBase {
}

export interface IRefListItemGroup extends IRefListGroupItemBase {
  childItems?: RefListGroupItemProps[];
}

export interface IChevronProps extends IConfigurableFormComponent {
  items?: IChevronButton[];
  description: string;
  image?: string;
  imageStyle?: boolean;
  imageSize?: number;
  referenceList?: any;
  activeColor?: string;
  fontColor?: string;
  showIcons?: boolean;
  colorSource?: 'primary' | 'custom' | 'reflist';
  width?: number;
  height?: number;
  fontSize?: number;
}

export interface IChevronControlProps extends IChevronProps {
  value?: any;
}

export interface IChevronButton extends IButtonGroupItem {
  itemValue: number;
  item: string;
}