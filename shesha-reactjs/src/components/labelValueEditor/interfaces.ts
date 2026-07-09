import { IDropdownOption } from "@/designer-components/settingsInput/interfaces";

export interface IItemProps {
  id: string;
  key: string;
  value: string;
}

export interface ILabelValueEditorPropsBase {
  labelTitle?: string | undefined;
  labelName?: string | undefined;
  valueTitle?: string | undefined;
  valueName?: string | undefined;
  colorName?: string | undefined;
  iconName?: string | undefined;
  colorTitle?: string | undefined;
  iconTitle?: string | undefined;
  dropdownOptions?: IDropdownOption[] | undefined;
  /**
   * Renderer for the value column. Defaults to 'input' (a plain text field).
   * When set to 'expression' the value cell uses the mustache-aware ExpressionEditor.
   */
  valueEditor?: 'input' | 'expression' | undefined;
}
