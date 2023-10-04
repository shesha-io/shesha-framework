import { IReferenceListIdentifier } from "interfaces/referenceList";
import { IFormItem } from "../..";
import { IConfigurableFormComponent } from "../../providers";


export interface IRefListStatusProps extends IConfigurableFormComponent, Omit<IFormItem, 'name'> {
    referenceListId: IReferenceListIdentifier;
    showIcon?: boolean;
    solidBackground?: boolean;
    showReflistName?: boolean;
}
