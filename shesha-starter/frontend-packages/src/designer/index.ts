import { IToolboxComponentGroup } from "@shesha-io/reactjs";
import { Divider } from "./divider";
import { Empty } from "./empty";
/* NEW_COMPONENT_IMPORT_GOES_HERE */

export const formDesignerComponents: IToolboxComponentGroup[] = [
  {
    name: "Template",
    components: [Divider, Empty],
    visible: true,
  },
];
