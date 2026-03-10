import { createGlobalStyle, css, sheshaStyles } from "@/styles";


const flexCenterAlignedSpaceBetween = css`
display: flex;
justify-content: space-between;
align-items: center;
`;

export const GlobalPageStyles = createGlobalStyle`
.sha-page {
    min-height: calc(100vh - ${sheshaStyles.layoutHeaderHeight});
  
    .sha-page-breadcrumb {
      margin-left: ${sheshaStyles.paddingLG}px;
    }
  
    .sha-page-content {
      &.is-designer-mode {
        min-height: 150px;
      }
      &:not(.no-padding) {
        padding: ${sheshaStyles.paddingLG}px;
      }
    }
  }
  
  .sha-page-heading {
    min-height: ${sheshaStyles.pageHeadingHeight};
    display: flex;
    justify-content: space-between;
    border-bottom: ${sheshaStyles.border};
    ${flexCenterAlignedSpaceBetween}
    min-height: ${sheshaStyles.pageToolbarHeight};
    background: white;
  
    padding: 5px;
  
    .sha-page-title {
      margin: unset;
      font-size: 20px;
      display: flex;
      align-items: center;
    }
  
    .sha-page-heading-left {
    }
    .sha-page-heading-right {
      display: flex;
      align-items: center;
      font-size: 12.5px;
      margin: 2px;
  
      .page-header-tags {
        padding: 0 ${(p) => p.theme.paddingSM}px;
        border-left: 0.1px lightgray solid;
      }
  
      .sha-page-heading-right-tag-separator {
        margin: 0 ${(p) => p.theme.paddingSM}px;
      }
    }
  }
  
  @media only screen and (max-width: 500px) {
    .sha-page-heading {
      max-height: unset;
    }
  }
`;
