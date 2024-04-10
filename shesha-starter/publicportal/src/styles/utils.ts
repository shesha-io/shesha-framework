import { IConfigurableTheme } from "@shesha-io/reactjs";
import { primaryColor } from "./variables";

export const getPrimaryColor = (theme: IConfigurableTheme) =>
  theme?.application?.primaryColor || primaryColor;