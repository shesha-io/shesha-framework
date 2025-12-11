import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, token }) => {
  const dataContextDesignerEmpty = cx("sha-data-context-designer-empty", css`
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        min-height: 120px;
        border-radius: 8px;
        border: 2px dashed ${token.colorPrimary}40;
        background-color: ${token.colorPrimaryBg}10;
        margin: 4px 0;
        transition: all 0.2s ease;
        padding: 16px;
        overflow: hidden;
        position: relative;
        width: 100%;
        box-sizing: border-box;

        &:hover {
            background-color: ${token.colorPrimaryBg}20;
            border-color: ${token.colorPrimary}60;
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
        border-radius: 8px;
        background-color: ${token.colorWarningBg}20;
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
        border-radius: 6px;
        background-color: ${token.colorPrimaryBg}10;
        margin: 4px 0;
        transition: all 0.2s ease;
        width: 100%;
        max-width: 100%;
        overflow: hidden;
        box-sizing: border-box;

        &:hover {
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
        min-height: 100px !important;
        padding: 8px;
        box-sizing: border-box; /* Include padding and border in width calculation */
        transition: all 0.2s ease;
        width: 100% !important;
        max-width: 100%;
        overflow: hidden;
        margin: 0;
        flex: 1;

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
        .sha-components-container-inner {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100px;
        }

        .sha-drop-hint {
            white-space: nowrap;
        }
    `);

  const quickSearchHintPopover = cx("sha-quick-search-hint-popover", css`
        background-color:rgb(214, 214, 214) !important;
        border-radius: 8px !important;

        &.ant-popover .ant-popover-arrow::before,
        &.ant-popover .ant-popover-arrow::after {
          background-color: rgb(214, 214, 214) !important;
        }
    `);

  const tableViewSelectorHintPopover = cx("sha-table-view-selector-hint-popover", css`
        background-color:rgb(214, 214, 214) !important;
        border-radius: 8px !important;

        &.ant-popover .ant-popover-arrow::before,
        &.ant-popover .ant-popover-arrow::after {
          background-color: rgb(214, 214, 214) !important;
        }
    `);

  const tablePagerHintPopover = cx("sha-table-pager-hint-popover", css`
        background-color:rgb(214, 214, 214) !important;
        border-radius: 8px !important;

        &.ant-popover .ant-popover-arrow::before,
        &.ant-popover .ant-popover-arrow::after {
          background-color: rgb(214, 214, 214) !important;
        }
    `);

  const quickSearchContainer = cx("sha-quick-search-container", css`
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: 52px;
    `);

  const tablePagerContainer = cx("sha-table-pager-container", css`
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: 52px;
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

  const hintContainer = cx("sha-hint-container", css`
        display: flex;
        align-items: center;
        gap: 8px;
    `);

  const disabledComponentWrapper = cx("sha-disabled-component-wrapper", css`
        opacity: 0.5;
    `);

  const filterButtonMockup = cx("sha-filter-button-mockup", css`
        padding: 8px;
        border: 1px dashed #d9d9d9;
        border-radius: 4px;
        min-height: 32px;
        color: #8c8c8c;
        background-color: #fafafa;
        display: flex;
        align-items: center;
        white-space: nowrap;
    `);

  const viewSelectorMockup = cx("sha-view-selector-mockup", css`
        display: flex;
        align-items: center;
        padding: 4px 8px;
        border: 1px solid #d9d9d9;
        border-radius: 6px;
        background-color: #fafafa;
        color: #8c8c8c;
        font-size: 14px;
        font-weight: 600;
    `);

  const datatableHintPopover = cx("sha-datatable-hint-popover", css`
        background-color: #D9DCDC !important;
        border-radius: 8px !important;

        &.ant-popover .ant-popover-arrow::before,
        &.ant-popover .ant-popover-arrow::after {
          background-color: #D9DCDC !important;
        }
    `);

  const emptyStateContainer = cx("sha-empty-state-container", css`
        position: relative;
        width: 100%;
        min-height: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
    `);

  const emptyStateOverlay = cx("sha-empty-state-overlay", css`
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        z-index: 1;
        gap: 12px;
    `);

  const emptyStateIcon = cx("sha-empty-state-icon", css`
        font-size: 48px;
        margin-bottom: 0;
    `);

  const emptyStateContent = cx("sha-empty-state-content", css`
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
    `);

  const emptyStateTitle = cx("sha-empty-state-title", css`
        font-size: 14px;
        font-weight: 600;
    `);

  const emptyStateSubtitle = cx("sha-empty-state-subtitle", css`
        font-size: 12px;
        color: ${token.colorTextSecondary};
    `);

  const emptyStateComponentsContainer = cx("sha-empty-state-components-container", css`
        position: relative;
        width: 100%;
        min-height: 120px;
        z-index: 2;
    `);

  return {
    dataContextDesignerEmpty,
    dataContextRuntimeEmpty,
    dataContextDesignerWithChildren,
    dataContextRuntime,
    dataContextComponentsContainer,
    dataContextComponentsContainerEmpty,
    quickSearchHintPopover,
    tableViewSelectorHintPopover,
    tablePagerHintPopover,
    quickSearchContainer,
    tablePagerContainer,
    tablePagerMockup,
    hintContainer,
    disabledComponentWrapper,
    filterButtonMockup,
    viewSelectorMockup,
    datatableHintPopover,
    emptyStateContainer,
    emptyStateOverlay,
    emptyStateIcon,
    emptyStateContent,
    emptyStateTitle,
    emptyStateSubtitle,
    emptyStateComponentsContainer,
  };
});
