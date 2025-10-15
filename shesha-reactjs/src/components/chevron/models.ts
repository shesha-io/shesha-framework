import { IFontValue } from "@/designer-components/_settings/utils/font/interfaces";
import { IButtonGroupItem, IButtonItem, IConfigurableFormComponent } from "@/providers";

export type RefListGroupItemProps = IRefListItemFormModel | IRefListItemGroup;

export interface IRefListGroupItemBase extends IButtonItem {
  referenceList?: any;
  item?: string;
}

export type IRefListItemFormModel = IRefListGroupItemBase;

export interface IRefListItemGroup extends IRefListGroupItemBase {
  childItems?: RefListGroupItemProps[];
}

export interface IChevronProps extends IConfigurableFormComponent {
  items?: IChevronButton[];
  description?: string;
  image?: string;
  imageStyle?: boolean;
  imageSize?: number;
  referenceList?: any;
  activeColor?: string;
  showIcons?: boolean;
  colorSource?: 'primary' | 'custom' | 'reflist';
  width?: number;
  height?: number;
  font?: IFontValue;
}

export interface IChevronControlProps extends IChevronProps {
  value?: any;
}

export interface IChevronButton extends IButtonGroupItem {
  itemValue: number;
  item: string;
}
