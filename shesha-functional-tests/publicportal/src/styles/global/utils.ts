import { IConfigurableTheme } from "@shesha/reactjs/dist/providers/theme/contexts";
import { primaryColor } from "./variables";

export const getPrimaryColor = (theme: IConfigurableTheme) =>
  theme?.application?.primaryColor || primaryColor;
