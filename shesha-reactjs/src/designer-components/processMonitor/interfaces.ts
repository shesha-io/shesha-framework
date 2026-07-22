import { IConfigurableFormComponent } from "@/interfaces";

export interface IProcessMonitorProps extends IConfigurableFormComponent {
  processType: string;
  processId: string;
  components: IConfigurableFormComponent[]; // Only important for fluent API
}
