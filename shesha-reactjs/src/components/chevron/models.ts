import { IFontValue } from "@/designer-components/_settings/utils/font/interfaces";
import { IReferenceListIdentifier } from "@/interfaces";
import { IButtonGroupItem, IButtonItem, IConfigurableFormComponent } from "@/providers";

export type RefListGroupItemProps = IRefListItemFormModel | IRefListItemGroup;

export interface IRefListGroupItemBase extends IButtonItem {
  referenceList?: IReferenceListIdentifier | undefined;
  item?: string | undefined;
}

export type IRefListItemFormModel = IRefListGroupItemBase;

export interface IRefListItemGroup extends IRefListGroupItemBase {
  childItems?: RefListGroupItemProps[];
}

export interface IChevronProps extends IConfigurableFormComponent {
  items?: IChevronButton[] | undefined;
  description?: string | undefined;
  image?: string | undefined;
  imageStyle?: boolean | undefined;
  imageSize?: number | undefined;
  referenceList?: IReferenceListIdentifier | undefined;
  activeColor?: string | undefined;
  showIcons?: boolean | undefined;
  colorSource?: 'primary' | 'custom' | 'reflist' | undefined;
  width?: number | undefined;
  height?: number | undefined;
  font?: IFontValue | undefined;
}

export interface IChevronControlProps extends IChevronProps {
  value?: number | null | undefined;
}

export interface IChevronButton extends IButtonGroupItem {
  itemValue: number;
  item: string;
}
