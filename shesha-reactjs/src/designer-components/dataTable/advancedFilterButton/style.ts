import { createStyles } from "@/styles";

export const useStyles = createStyles(({ token, cx, css }, {fontSize}) => {

  const primaryColor = token.colorPrimary;
  const secondaryColor = token.colorPrimaryBgHover;
  const arrowLeft = "scroll-arrow-left";
  const arrowRight = "scroll-arrow-right";
  const tag = "tag";
  const resultCount = "result-count";
  const clearAllButton = "clear-all-button";
  const filters = "filters";

  const wrapper = cx("filter-wrapper", css`
      display: flex;
      white-space: nowrap;
      justify-content: center;
      margin: 0 6px;

      .${resultCount} {
        text-align: end;
        white-space: nowrap;
        margin: 6px 0;
        align-self: center;
      }

      .${clearAllButton} {
        text-align: start;
        margin: 6px 0;
        white-space: nowrap;
        padding-left: 0px;
        padding-bottom: 6px;
        align-self: center;
      `);

  const button = cx("filter-btn", css`
    .ant-btn-icon{
    font-size: ${fontSize} !important;
    }
      &.ant-btn-icon-only {
        width: max-content;
        height: max-content;
        padding: 1px 1px;
      }
    `);

  const disabledColor = token.colorTextDisabled;

  const scrollableTagsContainer = cx("scrollable-tags-container", css`
      max-width: 700px;
      margin: 0 6px;
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

      .${filters} {
        display: flex;
        overflow-x: scroll;
        scroll-behavior: smooth;
        align-items: center;

        span:last-child {
          margin-right: 0px;
        }
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
    clearAllButton,
    filters
  };
});
