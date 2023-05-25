export * from "./common";
export * from "./dark";
export * from "./light";

import React, { FC, PropsWithChildren } from "react";
import { ThemeProvider } from "styled-components";

import { dark } from "./dark";
import { light } from "./light";

export const ThemeContext = React.createContext({
    theme: "light",
    toggle: () => undefined,
});

export const useTheme = () => {
    const { theme, toggle } = React.useContext(ThemeContext);

    return {
        theme: theme === "light" ? light : dark,
        toggle,
        themeName: theme,
    };
};

export const StyledThemeProvider: FC<PropsWithChildren> = ({ children }) => {
    const [theme, setTheme] = React.useState("light");

    const toggle = () => {
        setTheme((theme) => (theme === "light" ? "dark" : "light"));
    };
    const values = React.useMemo(
        () => ({
            theme,
            toggle,
        }),
        [toggle, theme],
    );

    return (
        <ThemeContext.Provider value={values}>
            <ThemeProvider theme={theme === "light" ? light : dark}>
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};
