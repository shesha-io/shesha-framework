import DropdownComponent from "designer-components/dropdown/dropdown";
import { dropdownAdapter } from "designer-components/dropdown/editorAdapter";
import { IDictionary, IEditorAdapter } from "interfaces";

export const editorAdapters: IDictionary<IEditorAdapter> = {
    [DropdownComponent.type]: dropdownAdapter,
};