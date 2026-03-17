import { createStyles, sheshaStyles } from '@/styles';

import qb_compact_styles from './css/compact_styles.css';

export const useStyles = createStyles(({ css, cx, prefixCls, token }) => {
  const shaQueryBuilderBtns = "sha-query-builder-btns";
  const shaQueryBuilder = cx("sha-query-builder", css`
        ${qb_compact_styles}

        background-image: white !important;
    
        .query-builder-container {
            padding: unset !important;
    
            .query-builder {
                margin: ${sheshaStyles.paddingLG}px 0px ${sheshaStyles.paddingLG}px 0px !important;
            }
    
            .ant-btn-group {
                button {
                    margin-left: ${sheshaStyles.paddingSM}px;
                }
            }
        }

        .query-builder-container.qb-has-rules {
            padding: 16px !important;
            box-sizing: border-box;
        }
    
        .${shaQueryBuilderBtns} {
            display: flex;
            justify-content: flex-end;
    
            button {
                margin-left: ${sheshaStyles.paddingLG}px;
            }
        }

        .query-builder > .group-or-rule-container > .group {
            background: #f5f5f5;
            border: 1px solid #ececec;
            border-radius: 8px;
        }
    
        .rule--value {
            .rule--widget {
                &.rule--widget--REFLISTDROPDOWN {
                    .${prefixCls}-select {
                        min-width: 150px;
                    }
                }
            }
        }

        .query-builder > .group-or-rule-container > .group > .group--header {
            margin: 0 0 20px;
        }

        .query-builder > .group-or-rule-container > .group > .group--header::before {
            content: "Show all...";
            display: block;
            width: 100%;
            font-size: 20px;
            line-height: 1.3;
            font-weight: 600;
            color: rgba(0, 0, 0, 0.73);
            margin-bottom: 20px;
        }

        .query-builder > .group-or-rule-container > .group > .group--header:not(.no--children) .group--conjunctions .ant-btn-group {
            display: none;
        }

        .query-builder > .group-or-rule-container > .group > .group--header:not(.no--children) .group--conjunctions::before {
            content: "Where";
            display: inline-flex;
            align-items: center;
            color: ${token.colorPrimary};
            font-weight: 500;
            line-height: 32px;
        }

        .query-builder-container.qb-has-rules .query-builder > .group-or-rule-container > .group > .group--footer .group--actions,
        .query-builder-container.qb-has-rules .query-builder > .group-or-rule-container > .group > .group--footer .group--actions.group--actions--br,
        .query-builder-container.qb-has-rules .query-builder > .group-or-rule-container > .group > .group--footer .group--actions.group--actions--tr {
            margin: 0 !important;
            width: 100% !important;
            justify-content: flex-end !important;
        }

        .query-builder-container.qb-has-rules .query-builder > .group-or-rule-container > .group > .group--footer .group--actions .ant-btn-group {
            display: inline-flex;
            gap: 12px;
            align-items: center;
        }

        .query-builder-container.qb-has-rules .query-builder > .group-or-rule-container > .group > .group--footer .group--actions .ant-btn-group .ant-btn + .ant-btn {
            margin-left: 0;
        }

        .query-builder-container.qb-has-rules .query-builder > .group-or-rule-container > .group > .group--footer .action--ADD-RULE.ant-btn,
        .query-builder-container.qb-has-rules .query-builder > .group-or-rule-container > .group > .group--footer .action--ADD-GROUP.ant-btn {
            height: 36px;
            min-width: 160px;
            border-radius: 10px;
            box-shadow: none;
            padding: 0 16px;
            font-size: 14px;
            font-weight: 500;
        }

        .query-builder-container.qb-has-rules .query-builder > .group-or-rule-container > .group > .group--footer .action--ADD-GROUP.ant-btn {
            border-color: ${token.colorPrimary};
            color: ${token.colorPrimary};
            background: #fff;
        }

        .query-builder-container.qb-has-rules .query-builder > .group-or-rule-container > .group > .group--footer .action--ADD-GROUP.ant-btn:hover,
        .query-builder-container.qb-has-rules .query-builder > .group-or-rule-container > .group > .group--footer .action--ADD-GROUP.ant-btn:focus-visible {
            border-color: ${token.colorPrimaryHover};
            color: ${token.colorPrimaryHover};
            background: #fff;
        }

        .query-builder-container.qb-has-rules .query-builder > .group-or-rule-container > .group > .group--footer .action--ADD-RULE.ant-btn .anticon,
        .query-builder-container.qb-has-rules .query-builder > .group-or-rule-container > .group > .group--footer .action--ADD-GROUP.ant-btn .anticon {
            font-size: 16px;
            margin-right: 8px;
        }

        .query-builder > .group-or-rule-container > .group > .group--footer {
            margin-top: 12px;
        }

        .query-builder > .group-or-rule-container > .group > .group--header.no--children {
            display: none;
        }

        .query-builder > .group-or-rule-container > .group > .group--header.no--children + .group--children.one--child {
            display: none;
        }

        .query-builder > .group-or-rule-container > .group > .group--header.no--children + .group--children.one--child + .group--footer {
            margin: 0;
            padding: 0;
            background: transparent;
            border: 0;
            border-radius: 0;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
        }

        .query-builder > .group-or-rule-container > .group > .group--header.no--children + .group--children.one--child + .group--footer::before {
            content: "No filter conditions are applied";
            display: block;
            margin: 0;
            font-size: 14px;
            line-height: 1.43;
            font-weight: 400;
            color: rgba(0, 0, 0, 0.45);
        }

        .query-builder > .group-or-rule-container > .group > .group--header.no--children + .group--children.one--child + .group--footer .group--actions,
        .query-builder > .group-or-rule-container > .group > .group--header.no--children + .group--children.one--child + .group--footer .group--actions.group--actions--br,
        .query-builder > .group-or-rule-container > .group > .group--header.no--children + .group--children.one--child + .group--footer .group--actions.group--actions--tr {
            margin: 0 !important;
            width: 100% !important;
            justify-content: flex-start !important;
        }

        .query-builder > .group-or-rule-container > .group > .group--header.no--children + .group--children.one--child + .group--footer .group--actions .ant-btn-group {
            display: inline-flex;
            gap: 12px;
            align-items: center;
        }

        .query-builder > .group-or-rule-container > .group > .group--header.no--children + .group--children.one--child + .group--footer .group--actions .ant-btn-group .ant-btn + .ant-btn {
            margin-left: 0;
        }

        .query-builder > .group-or-rule-container > .group > .group--header.no--children + .group--children.one--child + .group--footer .action--ADD-RULE.ant-btn,
        .query-builder > .group-or-rule-container > .group > .group--header.no--children + .group--children.one--child + .group--footer .action--ADD-GROUP.ant-btn {
            height: 36px;
            min-width: 160px;
            border-radius: 10px;
            box-shadow: none;
            padding: 0 16px;
            font-size: 14px;
            font-weight: 500;
        }

        .query-builder > .group-or-rule-container > .group > .group--header.no--children + .group--children.one--child + .group--footer .action--ADD-GROUP.ant-btn {
            border-color: ${token.colorPrimary};
            color: ${token.colorPrimary};
            background: #fff;
        }

        .query-builder > .group-or-rule-container > .group > .group--header.no--children + .group--children.one--child + .group--footer .action--ADD-GROUP.ant-btn:hover,
        .query-builder > .group-or-rule-container > .group > .group--header.no--children + .group--children.one--child + .group--footer .action--ADD-GROUP.ant-btn:focus-visible {
            border-color: ${token.colorPrimaryHover};
            color: ${token.colorPrimaryHover};
            background: #fff;
        }

        .query-builder > .group-or-rule-container > .group > .group--header.no--children + .group--children.one--child + .group--footer .action--ADD-RULE.ant-btn .anticon,
        .query-builder > .group-or-rule-container > .group > .group--header.no--children + .group--children.one--child + .group--footer .action--ADD-GROUP.ant-btn .anticon {
            font-size: 16px;
            margin-right: 8px;
        }

        .query-builder.qb-lite:not(.qb-dragging) .rule .rule--fieldsrc,
        .query-builder.qb-lite:not(.qb-dragging) .rule .widget--valuesrc,
        .query-builder.qb-lite:not(.qb-dragging) .rule .rule--header,
        .query-builder.qb-lite:not(.qb-dragging) .rule .rule--drag-handler {
            opacity: 1 !important;
            visibility: visible !important;
        }

        .sha-query-builder-source-trigger {
            height: 24px;
            min-width: 32px;
            padding: 0 7px;
            border: 1px solid #d9d9d9;
            border-radius: 6px;
            background: #fff;
            color: rgba(0, 0, 0, 0.45);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            cursor: pointer;
            transition: border-color 0.2s ease, color 0.2s ease;
        }

        .sha-query-builder-source-trigger:hover,
        .sha-query-builder-source-trigger:focus-visible {
            border-color: #1677ff;
            color: #1677ff;
            outline: none;
        }

        .sha-query-builder-source-trigger:disabled {
            cursor: not-allowed;
            opacity: 0.55;
        }

        .sha-query-builder-source-trigger-icon,
        .sha-query-builder-source-trigger-arrow {
            line-height: 1;
            font-size: 11px;
        }

        .sha-query-builder-packed-select {
            display: flex;
            align-items: stretch;
            width: 100%;
            min-width: 0;
            flex: 1 1 auto;
        }

        .query-builder .rule--before-widget:empty {
            display: none;
        }

        .query-builder .rule--before-widget:has(.sha-query-builder-empty-rule-placeholders) {
            flex: 1.85 1 0;
            min-width: 0;
        }

        .query-builder .rule--before-widget .sha-query-builder-empty-rule-placeholders {
            display: flex;
            align-items: stretch;
            gap: 4px;
            width: 100%;
            min-width: 0;
        }

        .query-builder .sha-query-builder-empty-operator {
            flex: 0.65 1 0;
            min-width: 0;
            min-height: 20px;
            padding: 0 12px;
            border: 1px solid #c7ced8;
            border-radius: 8px;
            background: #fff;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
        }

        .query-builder .sha-query-builder-empty-operator-text,
        .query-builder .sha-query-builder-empty-value-text {
            color: #98a2b3;
            line-height: 20px;
        }

        .query-builder .sha-query-builder-empty-value {
            flex: 1.2 1 0;
            min-width: 0;
            min-height: 20px;
            border: 1px solid #c7ced8;
            border-radius: 8px;
            background: #fff;
            overflow: hidden;
            display: flex;
            align-items: stretch;
        }

        .query-builder .sha-query-builder-empty-value-type {
            width: 28px;
            min-width: 28px;
            box-sizing: border-box;
            padding: 0 3px;
            border-right: 1px solid #d0d5dd;
            background: #f8fafc;
            color: #1d2939;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1px;
        }

        .query-builder .sha-query-builder-empty-value-type-icon {
            font-size: 9px;
        }

        .query-builder .sha-query-builder-empty-value-text {
            flex: 1 1 auto;
            min-width: 0;
            padding: 0 12px;
            display: flex;
            align-items: center;
        }

        .query-builder .sha-query-builder-empty-caret {
            color: #98a2b3;
            font-size: 9px;
        }

        .sha-query-builder-source-option .${prefixCls}-dropdown-menu-title-content {
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }

        .sha-query-builder-ignore-unassigned {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding-right: 2px;
        }

        .sha-query-builder-ignore-unassigned .${prefixCls}-checkbox-inner {
            border-radius: 4px;
        }

        .sha-query-builder-ignore-unassigned .${prefixCls}-checkbox-checked .${prefixCls}-checkbox-inner {
            background-color: #52c41a;
            border-color: #52c41a;
        }

        .sha-query-builder-ignore-unassigned-icon {
            color: #52c41a;
            font-size: 11px;
        }
    `);

  return {
    shaQueryBuilder,
    shaQueryBuilderBtns,
  };
});
