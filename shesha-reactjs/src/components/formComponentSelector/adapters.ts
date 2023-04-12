import DropdownComponent from "components/formDesigner/components/dropdown/dropdown";
import { dropdownAdapter } from "components/formDesigner/components/dropdown/editorAdapter";
import { IDictionary, IEditorAdapter } from "interfaces";

export const editorAdapters: IDictionary<IEditorAdapter> = {
    [DropdownComponent.type]: dropdownAdapter,
};