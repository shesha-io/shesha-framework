import { IEditorAdapter } from "interfaces";
import { IDropdownComponentProps } from "./interfaces";

export const dropdownAdapter: IEditorAdapter<IDropdownComponentProps> = {
    settingsFormFactory: _props => {
        return null;
    },
    fillSettings: function (_customSettings: Partial<IDropdownComponentProps>): IDropdownComponentProps {
        throw new Error("Function not implemented.");
    }
};

//export interface IEditorComponentBaseProps = Pick<IConfigurableFormComponent, '' | >;

/*
    name: string;
    label?: string;
    labelAlign?: LabelAlign;
    hideLabel?: boolean;
    type: string;
    description?: string;
    hidden?: boolean;
    visibility?: VisibilityType;
    disabled?: boolean; // todo: move to the model level
    defaultValue?: any;
    readOnly?: boolean;
    isDynamic?: boolean;
*/