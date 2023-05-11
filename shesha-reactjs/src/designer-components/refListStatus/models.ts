import { IFormItem } from "../..";
import { IConfigurableFormComponent } from "../../providers";


export interface IRefListStatusProps extends IConfigurableFormComponent, IFormItem {
    height: string;
    width: string;
    module: string;
    nameSpace: string;
    showIcon?: boolean;
    solidBackground?: boolean;
    showReflistName?: boolean;
}
