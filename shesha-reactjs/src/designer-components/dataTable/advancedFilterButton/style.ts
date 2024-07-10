import { createStyles } from "antd-style";

export const useStyles = createStyles(({ token, cx, css }) => {

  const primaryColor = token.colorPrimary;
  const secondaryColor = token.colorPrimaryBgHover;
  const arrowLeft = "scroll-arrow-left";
  const arrowRight = "scroll-arrow-right";
  const tag = "tag";
  const resultCount = "result-count";
  const clearAllButton = "clear-all-button";

  const wrapper = cx("filter-wrapper", css`
      display: flex;
      white-space: nowrap;
      justify-content: center;
      margin: 0 6px;

      .${resultCount} {
        margin: auto 6px auto auto;
        text-align: end;
        white-space: nowrap 
      }

      .${clearAllButton} {
        margin: auto auto auto 6px;
        text-align: start;
        white-space: nowrap 
      `);

  const button = cx("filter-btn", css`
      &.ant-btn-icon-only {
        width: max-content;
        height: max-content;
        padding: 1px 1px;
      }
    `);

  const disabledColor = token.colorTextDisabled;

  const scrollableTagsContainer = cx("scrollable-tags-container", css`
      max-width: 700px;
      margin: 6px;
      justify-content: center;
      overflow: hidden;
      display: flex;
      position: relative;
      user-select: none;
      ::-webkit-scrollbar {
        display: none;
      }

      * {
        -ms-overflow-style: none; /* for Internet Explorer, Edge */
        scrollbar-width: none; /* for Firefox */
      }

      p {
        white-space: nowrap;
      }
      .filters {
        display: flex;
        margin: 0 24px;
        overflow-x: scroll;
        scroll-behavior: smooth;
        align-items: center;
      }

      .${arrowLeft}, .${arrowRight} {
        color: ${token.colorPrimary};
        cursor: pointer;
        position: absolute;
        height: 100%;
        top: 0;
        width: 24px;
        justify-content: center;
        display: flex;
      }

      .hidden {
        display: none;
      }

      .${arrowLeft} {
        left: 0;
        border-radius: 4px 0 0 4px;
      }

       .${arrowRight} {
        right: 0;
        border-radius: 0 4px 4px 0;
      }
      
      .${tag} {
        color: ${token.colorPrimary};
        marginBottom: .32em;
        vertical-align: middle;
    `);

  return {
    secondaryColor,
    primaryColor,
    arrowLeft,
    arrowRight,
    tag,
    wrapper,
    scrollableTagsContainer,
    disabledColor,
    button,
    resultCount,
    clearAllButton
  };
});
