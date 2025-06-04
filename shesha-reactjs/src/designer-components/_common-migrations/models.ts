import { IFormDto, IToolboxComponents } from "@/index";

export interface IFormMigrationContext {
    form: IFormDto;
    designerComponents: IToolboxComponents;
}