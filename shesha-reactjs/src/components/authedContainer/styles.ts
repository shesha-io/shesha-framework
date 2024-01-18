import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css, cx }) => {
    const shaStorybookAuthenticatedContainerLayout = "sha-storybook-authenticated-container-layout";
    const shaStorybookAuthenticatedActionBtn = "sha-storybook-authenticated-action-btn";
    const shaSectionSeparator = "sha-section-separator";
    const shaStorybookAuthenticatedContainer = cx("sha-storybook-authenticated-container", css`
        width: 100%;
      
        .${shaStorybookAuthenticatedContainerLayout} {
          margin: -1rem; // Fixed the layout issue with the
        }
      
        .${shaStorybookAuthenticatedActionBtn} {
          display: flex;
          justify-content: flex-end;
        }
      
        .${shaSectionSeparator} {
          margin: 5px 0 15px 0;
        }
  `);
    return {
        shaStorybookAuthenticatedContainer,
        shaStorybookAuthenticatedContainerLayout,
        shaStorybookAuthenticatedActionBtn,
        shaSectionSeparator,
    };
});