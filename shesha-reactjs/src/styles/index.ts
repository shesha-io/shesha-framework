import { FullToken, createStyles, css, createGlobalStyle, ThemeProvider } from "antd-style";

export const sheshaStyles = {
    paddingSM: 4,
    paddingMD: 8,
    paddingLG: 12,

    layoutHeaderHeight: "51.5px", // @layout-header-height
    pageHeadingHeight: "45px", // @sha-page-heading-height
    pageToolbarHeight: "33px", // @sha-page-toolbar-height
    border: "1px solid #d3d3d3", // @sha-border

    columnFilterHeight: "150px",

    transition: "all 0.3s ease-out;",

    mediaPhoneLg: "only screen and (max-width: 500px)",

    flexCenterAlignedSpaceBetween: `
    display: flex;
    justify-content: space-between;
    align-items: center;
`,
    thinScrollbars:
        `
scrollbar-width: thin;
::-webkit-scrollbar {
    width: 8px;
    background-color: transparent;
}

::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background-color: #ccc;
}`,
    verticalSettingsClass: 'vertical-settings',
};

export const getTextHoverEffects = (token: FullToken) => {
    return `
        transition: ${sheshaStyles.transition};
        &:hover {
            color: ${token.colorPrimary} !important;
        }
        
        cursor: pointer;
    `;
};

export const getWarningHoverEffects = (token: FullToken) => {
    return `
        transition: ${sheshaStyles.transition};
        &:hover {
            color: ${token.colorWarning} !important;
        }
        
        cursor: pointer;
    `;
};

export { css, createGlobalStyle, createStyles, ThemeProvider };