// #region Global Imports
import { DefaultTheme } from "styled-components";
// #endregion Global Imports
import { common } from "./common";

const light: DefaultTheme = {
  colors: {
    ...common.colors,
    toggleBorder: "#ABB7C4",
    gradient: "linear-gradient(#39598A, #79D7ED)",
    background: "#282C34",
    headerBg: "#20232A",
    cardsBg: "#FFFFFF",
    textColor: "#000000",
    dodgerBlue: "#007BFF",
  },
};

export { light };
