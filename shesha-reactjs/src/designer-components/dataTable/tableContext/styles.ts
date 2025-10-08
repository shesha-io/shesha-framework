import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, token }) => {
  const dataContextDesignerEmpty = cx("sha-data-context-designer-empty", css`
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        min-height: 60px;
        background-color: ${token.colorPrimaryBg}20;
        margin: 4px 0;
        transition: all 0.2s ease;
        padding-top: 8px;

        &:hover {
            border-color: ${token.colorPrimary}60;
            background-color: ${token.colorPrimaryBg}30;
        }

        .data-context-label {
            display: flex;
            align-items: center;
            color: ${token.colorTextSecondary};
            font-size: 14px;
            font-weight: 500;
            pointer-events: none;

            .anticon {
                margin-right: 8px;
                font-size: 16px;
                color: ${token.colorPrimary};
            }
        }

    `);

  const dataContextRuntimeEmpty = cx("sha-data-context-runtime-empty", css`
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 60px;
        margin: 4px 0;
        transition: all 0.2s ease;

        .data-context-label {
            display: flex;
            align-items: center;
            color: ${token.colorText};
            font-size: 14px;
            font-weight: 500;

            .anticon {
                margin-right: 8px;
                font-size: 16px;
                color: ${token.colorWarning};
            }
        }
    `);

  const dataContextDesignerWithChildren = cx("sha-data-context-designer-with-children", css`
        display: flex;
        flex-direction: column;
        min-height: 40px;
        border: 1px solid ${token.colorPrimary}60;
        border-radius: 6px;
        background-color: ${token.colorPrimaryBg}10;
        margin: 4px 0;
        transition: all 0.2s ease;

        &:hover {
            border-color: ${token.colorPrimary}80;
            background-color: ${token.colorPrimaryBg}15;
        }

        .data-context-label {
            display: flex;
            align-items: center;
            padding: 8px 12px;
            color: ${token.colorText};
            font-size: 12px;
            font-weight: 500;
            background-color: ${token.colorPrimaryBg}20;
            border-bottom: 1px solid ${token.colorPrimary}30;
            pointer-events: none;

            .anticon {
                margin-right: 6px;
                font-size: 14px;
                color: ${token.colorPrimary};
            }
        }

    `);

  const dataContextRuntime = cx("sha-data-context-runtime", css`
        /* Runtime styles - transparent wrapper */
    `);

  const dataContextComponentsContainer = cx("sha-data-context-components-container", css`
        border: 2px dotted ${token.colorPrimary}30;
        border-radius: 4px;
        margin: 8px;
        min-height: 60px;
        padding: 8px;
        transition: all 0.2s ease;

        &:hover {
            border-color: ${token.colorPrimary}50;
            background-color: ${token.colorPrimaryBg}10;
        }

        .sha-drop-hint {
            color: ${token.colorTextSecondary};
            font-size: 13px;
            font-weight: 400;
            text-align: center;
            pointer-events: none;
        }
    `);

  const dataContextComponentsContainerEmpty = cx("sha-data-context-components-container-empty", css`
    width: 100%;
    min-height: 100px;
    .sha-components-container-inner {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: 100px;
        }

        .sha-drop-hint {
            white-space: nowrap;
            min-height: 100px;
        }
    `);

  const emptyDataContextWatermark = cx("sha-empty-data-context-watermark", css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 120px;
    padding: 24px;
    color: ${token.colorTextTertiary};
    text-align: center;

    .watermark-icon {
      font-size: 32px;
      margin-bottom: 12px;
      opacity: 0.4;
    }

    .watermark-text {
      font-size: 14px;
      line-height: 1.4;
      opacity: 0.6;
      font-weight: 400;
      width: 100%;
    }

    .watermark-instruction {
      font-size: 12px;
      margin-top: 8px;
      opacity: 0.5;
      font-style: italic;
      width: 100%;
    }
  `);

  const designerDropZoneWithWatermark = cx("sha-designer-dropzone-with-watermark", css`
    position: relative;
    width: 100%;

    .sha-empty-data-context-watermark {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      z-index: 1;
      pointer-events: none;
    }

    .sha-data-context-components-container {
      position: relative;
      z-index: 2;
      background: transparent !important;
      border: 2px dotted ${token.colorPrimary}30;

      &:hover {
        border-color: ${token.colorPrimary}50;
        background: transparent !important;
      }
    }
  `);

  const quickSearchHintPopover = cx("sha-quick-search-hint-popover", css`
        background-color:rgb(214, 214, 214) !important;
        border-radius: 8px !important;
    `);

  const tableViewSelectorHintPopover = cx("sha-table-view-selector-hint-popover", css`
        background-color:rgb(214, 214, 214) !important;
        border-radius: 8px !important;
    `);

  const tablePagerHintPopover = cx("sha-table-pager-hint-popover", css`
        background-color:rgb(214, 214, 214) !important;
        border-radius: 8px !important;
    `);

  const dataListHintPopover = cx("sha-data-list-hint-popover", css`
        background-color:rgb(214, 214, 214) !important;
        border-radius: 8px !important;
    `);

  const quickSearchPopoverArrowStyles = `
    .ant-popover.sha-quick-search-hint-popover .ant-popover-arrow::before,
    .ant-popover.sha-quick-search-hint-popover .ant-popover-arrow::after {
      background-color: rgb(214, 214, 214) !important;
    }
    .ant-popover.sha-table-view-selector-hint-popover .ant-popover-arrow::before,
    .ant-popover.sha-table-view-selector-hint-popover .ant-popover-arrow::after {
      background-color: rgb(214, 214, 214) !important;
    }
    .ant-popover.sha-table-pager-hint-popover .ant-popover-arrow::before,
    .ant-popover.sha-table-pager-hint-popover .ant-popover-arrow::after {
      background-color: rgb(214, 214, 214) !important;
    }
    .ant-popover.sha-data-list-hint-popover .ant-popover-arrow::before,
    .ant-popover.sha-data-list-hint-popover .ant-popover-arrow::after {
      background-color: rgb(214, 214, 214) !important;
    }
  `;

  const quickSearchContainer = cx("sha-quick-search-container", css`
        display: flex;
        align-items: center;
        gap: 8px;
    `);

  const tablePagerContainer = cx("sha-table-pager-container", css`
        display: flex;
        align-items: center;
        gap: 8px;
    `);

  const tablePagerMockup = cx("sha-table-pager-mockup", css`
        display: flex;
        align-items: center;
        padding: 4px 8px;
        border: 1px solid ${token.colorBorder};
        border-radius: 6px;
        background-color: ${token.colorBgContainer};
        color: ${token.colorTextSecondary};
        font-size: 14px;
        gap: 8px;

        span {
            &:nth-child(2n) {
                opacity: 0.6;
            }
        }
    `);

  return {
    dataContextDesignerEmpty,
    dataContextRuntimeEmpty,
    dataContextDesignerWithChildren,
    dataContextRuntime,
    dataContextComponentsContainer,
    dataContextComponentsContainerEmpty,
    emptyDataContextWatermark,
    designerDropZoneWithWatermark,
    quickSearchHintPopover,
    tableViewSelectorHintPopover,
    tablePagerHintPopover,
    dataListHintPopover,
    quickSearchPopoverArrowStyles,
    quickSearchContainer,
    tablePagerContainer,
    tablePagerMockup,
  };
});
