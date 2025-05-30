import { IDropdownOption } from "@/designer-components/settingsInput/interfaces";

export interface IItemProps {
    id: string;
    key: string;
    value: string;
}

export interface ILabelValueEditorPropsBase {
    labelTitle?: string;
    labelName?: string;
    valueTitle?: string;
    valueName?: string;
    colorName?: string;
    iconName?: string;
    colorTitle?: string;
    iconTitle?: string;
    dropdownOptions?: IDropdownOption[] | string;
}