import { IConfigurableFormComponent } from "@/interfaces";
import { omittedStyleType } from "./styleGroup";

export interface IStyleGroupProps extends IConfigurableFormComponent {
    omitted?: omittedStyleType[];
}