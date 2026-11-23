import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, prefixCls, token }) => {
  const queryBuilderSurfaceWidth = '1158px';
  const queryBuilderEmptySurfaceHeight = '88px';
  const queryBuilderFilledSurfaceMinHeight = '218px';
  const queryBuilderSurfaceRadius = '6px';

  const shaQueryBuilderField = cx("sha-query-builder-field", css`
        .${prefixCls}-collapse-item {
            .${prefixCls}-collapse-header {
                padding: 0 !important;
            }
            .${prefixCls}-collapse-content {
                .${prefixCls}-collapse-content-box {
                    padding: 0;
                }
            }
        }
    `);

  const shaQueryBuilder = "sha-query-builder";
  const shaQqueryBuilderPlainWrapperBtnWrapper = "sha-query-builder-plain-wrapper-btn-wrapper";
  const shaQueryBuilderPlainWrapper = cx("sha-query-builder-plain-wrapper", css`
        min-height: 250px;

        .${shaQueryBuilder} {
            padding: unset;
            margin-right: -5px;
        }

        .${shaQqueryBuilderPlainWrapperBtnWrapper} {
            display: flex;
            justify-content: flex-end;
        }

        .query-builder-container.qb-has-rules,
        .query-builder-container.qb-empty {
            background: #f5f5f5;
            border: 1px solid #ededee;
            border-radius: ${queryBuilderSurfaceRadius};
            width: 100%;
            max-width: ${queryBuilderSurfaceWidth};
            min-width: 0;
            padding: 12px !important;
            box-sizing: border-box;
        }

        .query-builder-container.qb-has-rules .qb-rule-layout {
            display: flex;
            align-items: center;
            gap: 16px;
            width: 100%;
        }

    `);

  const shaQueryBuilderMarginTop8 = cx("sha-query-builder-margin-top", css`
        margin-top: 8px;
    `);

  const shaQueryBuilderModalTitle = cx("sha-query-builder-modal-title", css`
        display: inline-flex;
        align-items: center;
        gap: 10px;
        font-size: 20px;
        font-weight: 600;
        line-height: 1.2;
    `);

  const shaQueryBuilderModalTitleIcon = cx("sha-query-builder-modal-title-icon", css`
        width: 40px;
        height: 40px;
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: ${token.colorPrimaryBg};
        color: ${token.colorPrimary};
        border: 1px solid ${token.colorPrimaryBorder};
        font-size: 18px;
    `);

  const shaQueryBuilderModalBody = cx("sha-query-builder-modal-body", css`
        display: flex;
        flex-direction: column;
        min-height: 0;
        height: 100%;
        overflow-x: auto;
        overflow-y: auto;

        .sha-query-builder {
            display: block;
            min-height: 0;
        }

        .query-builder-container {
            overflow: visible;
        }

        .query-builder-container.qb-has-rules,
        .query-builder-container.qb-empty {
            background: #f5f5f5;
            border: 1px solid #ededee;
            border-radius: ${queryBuilderSurfaceRadius};
            width: 100%;
            min-width: 0;
            height: auto;
            box-sizing: border-box;
        }

        .query-builder-container.qb-has-rules {
            min-height: ${queryBuilderFilledSurfaceMinHeight};
            padding: 20px 10px !important;
        }

        .query-builder-container.qb-empty {
            min-height: ${queryBuilderEmptySurfaceHeight};
            padding: 10px !important;
        }

        .query-builder-container.qb-has-rules .qb-rule-layout {
            display: flex;
            align-items: flex-start;
            gap: 16px;
            width: 100%;
        }

        .sha-query-builder-source-dropdown-trigger {
            display: inline-flex;
            width: 100%;
            min-width: 0;
            pointer-events: auto !important;
            position: relative;
            z-index: 2;
        }

        .sha-query-builder-ignore-unassigned {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding-right: 0;
        }

        .sha-query-builder-ignore-unassigned .${prefixCls}-checkbox {
            display: inline-flex;
            align-items: center;
        }

        .sha-query-builder-ignore-unassigned .${prefixCls}-checkbox-inner {
            width: 16px;
            height: 16px;
            border-radius: 4px;
        }

        .sha-query-builder-ignore-unassigned .${prefixCls}-checkbox-checked .${prefixCls}-checkbox-inner {
            background-color: #52c41a;
            border-color: #52c41a;
        }

        .sha-query-builder-ignore-unassigned-icon {
            color: #52c41a;
            font-size: 12px;
        }

        @media (max-width: 900px) {

        }

    `);

  const shaQueryBuilderModalHelpText = cx("sha-query-builder-modal-help-text", css`
        font-size: 16px;
        line-height: 1.5;
        color: #252525;
    `);

  const shaQueryBuilderModalHelpWrap = cx("sha-query-builder-modal-help-wrap", css`
        margin: 0 0 12px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
    `);

  const shaQueryBuilderModalHelpIcon = cx("sha-query-builder-modal-help-icon", css`
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        line-height: 1;
        display: inline-flex;
        align-items: center;
        transition: color 0.2s ease;

        &:hover {
            color: ${token.colorPrimary};
        }
    `);

  return {
    shaQueryBuilderField,
    shaQueryBuilderPlainWrapper,
    shaQueryBuilder,
    shaQqueryBuilderPlainWrapperBtnWrapper,
    shaQueryBuilderMarginTop8: shaQueryBuilderMarginTop8,
    shaQueryBuilderModalTitle,
    shaQueryBuilderModalTitleIcon,
    shaQueryBuilderModalBody,
    shaQueryBuilderModalHelpWrap,
    shaQueryBuilderModalHelpText,
    shaQueryBuilderModalHelpIcon,
  };
});
