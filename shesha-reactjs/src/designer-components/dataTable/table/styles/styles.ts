import { createGlobalStyle, createStyles } from "antd-style";
import { sheshaStyles } from '@/styles';


export const GlobalTableStyles = createGlobalStyle`
  .sha-components-container.sha-index-table-control {
    background: white;
    padding: ${sheshaStyles.paddingMD}px ${sheshaStyles.paddingLG}px !important;
    justify-content: space-between;
    align-items: center;
    padding: 0px ${sheshaStyles.paddingLG}px;
    min-height: ${sheshaStyles.pageHeadingHeight} !important;
    border-bottom: ${sheshaStyles.border};

    .sha-components-container,
    .sha-components-container-inner {
        height: 100% !important;
    }

    .${p => p.theme.prefixCls}-form-item {
      margin: unset !important;
    }

    .index-table-controls-left,
    .index-table-controls-right {
      .sha-components-container {
        justify-content: unset;
        align-items: center;

        .sha-components-container-inner {
          height: ${sheshaStyles.pageHeadingHeight} !important;
          display: flex;
          align-items: center;

          button {
            padding: unset;
          }
        }
      }
    }
  }
      
  @media (${sheshaStyles.mediaPhoneLg}) {
    .sha-components-container.sha-index-table-control {
      .index-table-controls-left,
      .index-table-controls-right {
        .sha-components-container {
          .sha-components-container-inner {
            height: unset !important;
          }
        }
      }
    }
  }
  .sha-react-table {
    .td {
      .${p => p.theme.prefixCls}-form-item {
        width: 100%;
    
        .${p => p.theme.prefixCls}-row {
          &.${p => p.theme.prefixCls}-form-item-row {
            margin: 0;
    
            .${p => p.theme.prefixCls}-picker, .${p => p.theme.prefixCls}-input-number {
              width: 100%;
            }
          }
        }
      }
      .sha-form-cell {
        .${p => p.theme.prefixCls}-form-item {
          .${p => p.theme.prefixCls}-row {
            &.${p => p.theme.prefixCls}-form-item-row {
              margin-bottom: 5px;
            }
          }
        }
      }
    }
  }
`;


export const useStyles = createStyles(({ token, cx, css }) => {

  const primaryColor = token.colorPrimary;
  const secondaryColor = token.colorPrimaryBgHover;
  const arrowLeft = "scroll-arrow-left";
  const arrowRight = "scroll-arrow-right";
  const tag = "tag";

  const scrollableTagsContainer = cx("scrollable-tags-container", css`
      max-width: 700px;
      margin: 6px auto;
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

      .filters {
        display: flex;
        margin: 0 24px;
        overflow-x: scroll;
        scroll-behavior: smooth;
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
    `);

  return {
    secondaryColor,
    primaryColor,
    arrowLeft,
    arrowRight,
    tag,
    scrollableTagsContainer
  };
});