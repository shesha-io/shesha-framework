import { IToolboxComponents } from "@/interfaces/formDesigner";
import { IFormDto } from "@/providers/form/models";

export interface IFormMigrationContext {
  form: IFormDto;
  designerComponents: IToolboxComponents;
}
