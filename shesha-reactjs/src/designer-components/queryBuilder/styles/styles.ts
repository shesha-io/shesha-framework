import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, prefixCls, token }) => {
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

        .query-builder > .group-or-rule-container > .group {
            background: #f5f5f5;
            border: 1px solid #ededee;
            border-radius: 12px;
            padding: 12px;
        }

        .query-builder-container.qb-has-rules .qb-logic-heading {
            font-size: 20px;
            line-height: 1.3;
            font-weight: 600;
            color: rgba(0, 0, 0, 0.73);
            margin: 0 0 20px;
        }

        .query-builder-container.qb-has-rules,
        .query-builder-container.qb-empty {
            background: #f5f5f5;
            border: 1px solid #ededee;
            border-radius: 12px;
            padding: 16px !important;
            box-sizing: border-box;
        }

        .query-builder-container.qb-has-rules .qb-rule-layout {
            display: flex;
            align-items: center;
            gap: 16px;
            width: 100%;
        }

        .query-builder-container.qb-has-rules .qb-where-label {
            color: ${token.colorPrimary};
            font-weight: 500;
            line-height: 32px;
            white-space: nowrap;
            flex: 0 0 auto;
        }

        .query-builder-container.qb-has-rules .qb-rule-layout > .query-builder {
            flex: 1 1 auto;
            min-width: 0;
            margin: 0 !important;
        }

        .query-builder-container.qb-has-rules .query-builder > .group-or-rule-container > .group > .group--header:not(.no--children) {
            display: none !important;
        }

        .query-builder-container.qb-has-rules .query-builder > .group-or-rule-container > .group,
        .query-builder-container.qb-empty .query-builder > .group-or-rule-container > .group {
            background: transparent;
            border: 0;
            border-radius: 0;
            padding: 0;
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

        .query-builder > .group-or-rule-container > .group > .group--header::before {
            content: "Show all...";
            display: block;
            width: 100%;
            margin-bottom: 2px;
            font-size: 20px;
            line-height: 1.3;
            font-weight: 600;
            color: rgba(0, 0, 0, 0.73);
        }

        .query-builder > .group-or-rule-container > .group > .group--header.no--children::before {
            display: none;
        }

        .query-builder > .group-or-rule-container > .group > .group--header.no--children {
            margin: 0;
            padding: 0;
            min-height: 0;
        }

        .query-builder > .group-or-rule-container > .group > .group--header.no--children .group--conjunctions {
            display: none;
        }

        .query-builder > .group-or-rule-container > .group > .group--header.no--children .group--actions {
            justify-content: flex-start !important;
            width: 100% !important;
            margin: 0 !important;
            flex: 0 0 auto !important;
            align-self: flex-start !important;
        }

        .query-builder > .group-or-rule-container > .group > .group--header.no--children .group--actions.group--actions--br,
        .query-builder > .group-or-rule-container > .group > .group--header.no--children .group--actions.group--actions--tr {
            justify-content: flex-start !important;
        }

        .query-builder > .group-or-rule-container > .group > .group--header.no--children .group--actions .ant-btn-group {
            justify-content: flex-start !important;
            gap: 14px;
        }

        .query-builder > .group-or-rule-container > .group > .group--header.no--children + .group--children.one--child + .group--footer .action--ADD-RULE.ant-btn,
        .query-builder > .group-or-rule-container > .group > .group--header.no--children + .group--children.one--child + .group--footer .action--ADD-GROUP.ant-btn {
            min-width: 0;
            height: 40px;
            min-width: 176px;
            border-radius: 14px;
            box-shadow: none;
            padding: 0 18px;
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
    `);

  const shaQueryBuilderMarginTop8 = cx("sha-query-builder-margin-top", css`
        margin-top: 8px;
    `);

  const shaQueryBuilderModalTitle = cx("sha-query-builder-modal-title", css`
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 600;
        line-height: 1.25;
    `);

  const shaQueryBuilderModalTitleIcon = cx("sha-query-builder-modal-title-icon", css`
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: ${token.colorPrimaryBg};
        color: ${token.colorPrimary};
        border: 1px solid ${token.colorPrimaryBorder};
        font-size: 13px;
    `);

  const shaQueryBuilderModalBody = cx("sha-query-builder-modal-body", css`
        .query-builder-container {
            overflow-x: auto;
        }

        .query-builder {
            margin: 0 !important;
        }

        .query-builder .group--children > .group-or-rule-container > .group-or-rule::before,
        .query-builder .group--children > .group-or-rule-container > .group-or-rule::after {
            display: none;
        }

        .query-builder > .group-or-rule-container > .group {
            background: #f5f5f5;
            border: 1px solid #ededee;
            border-radius: 12px;
            padding: 12px;
        }

        .query-builder-container.qb-has-rules .qb-logic-heading {
            font-size: 20px;
            line-height: 1.3;
            font-weight: 600;
            color: rgba(0, 0, 0, 0.73);
            margin: 0 0 20px;
        }

        .query-builder-container.qb-has-rules,
        .query-builder-container.qb-empty {
            background: #f5f5f5;
            border: 1px solid #ededee;
            border-radius: 12px;
            padding: 16px !important;
            box-sizing: border-box;
        }

        .query-builder-container.qb-has-rules .qb-rule-layout {
            display: flex;
            align-items: center;
            gap: 16px;
            width: 100%;
        }

        .query-builder-container.qb-has-rules .qb-where-label {
            color: ${token.colorPrimary};
            font-weight: 500;
            line-height: 32px;
            white-space: nowrap;
            flex: 0 0 auto;
        }

        .query-builder-container.qb-has-rules .qb-rule-layout > .query-builder {
            flex: 1 1 auto;
            min-width: 0;
            margin: 0 !important;
        }

        .query-builder-container.qb-has-rules .query-builder > .group-or-rule-container > .group > .group--header:not(.no--children) {
            display: none !important;
        }

        .query-builder-container.qb-has-rules .query-builder > .group-or-rule-container > .group,
        .query-builder-container.qb-empty .query-builder > .group-or-rule-container > .group {
            background: transparent;
            border: 0;
            border-radius: 0;
            padding: 0;
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

        .query-builder > .group-or-rule-container > .group > .group--header {
            margin: 0 0 20px;
            padding: 0;
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 8px;
            min-height: 32px;
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

        .query-builder > .group-or-rule-container > .group > .group--header.no--children {
            display: none;
        }

        .query-builder > .group-or-rule-container > .group > .group--header .group--actions {
            margin-left: 0;
            width: 100%;
            justify-content: flex-end;
        }

        .query-builder > .group-or-rule-container > .group > .group--header:not(.no--children) .group--conjunctions {
            display: none !important;
        }

        .query-builder > .group-or-rule-container > .group > .group--header.no--children .group--conjunctions {
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

        .query-builder > .group-or-rule-container > .group > .group--header.no--children + .group--children.one--child + .group--footer .group--actions {
            margin: 0 !important;
            width: 100% !important;
            justify-content: flex-start !important;
        }

        .query-builder > .group-or-rule-container > .group > .group--header.no--children + .group--children.one--child + .group--footer .group--actions.group--actions--br,
        .query-builder > .group-or-rule-container > .group > .group--header.no--children + .group--children.one--child + .group--footer .group--actions.group--actions--tr {
            justify-content: flex-start !important;
        }

        .query-builder > .group-or-rule-container > .group > .group--header.no--children + .group--children.one--child + .group--footer .group--actions .ant-btn-group {
            justify-content: flex-start !important;
            gap: 12px;
        }

        .query-builder .group--actions .ant-btn-group {
            display: inline-flex;
            gap: 10px;
            align-items: center;
        }

        .query-builder .group--actions .ant-btn-group .ant-btn + .ant-btn {
            margin-left: 0;
        }

        .query-builder > .group-or-rule-container > .group > .group--header.no--children .action--ADD-RULE.ant-btn,
        .query-builder > .group-or-rule-container > .group > .group--header.no--children .action--ADD-GROUP.ant-btn {
            min-width: 0;
            height: 36px;
            min-width: 176px;
            border-radius: 10px;
            box-shadow: none;
            padding: 0 16px;
            font-size: 14px;
            font-weight: 500;
        }

        .query-builder > .group-or-rule-container > .group > .group--header.no--children + .group--children.one--child + .group--footer .action--ADD-RULE.ant-btn,
        .query-builder > .group-or-rule-container > .group > .group--header.no--children + .group--children.one--child + .group--footer .action--ADD-GROUP.ant-btn {
            min-width: 0;
            height: 36px;
            min-width: 160px;
            border-radius: 10px;
            box-shadow: none;
            padding: 0 16px;
            font-size: 14px;
            font-weight: 500;
        }

        .query-builder > .group-or-rule-container > .group > .group--header.no--children .action--ADD-GROUP.ant-btn {
            border-color: ${token.colorPrimary};
            color: ${token.colorPrimary};
            background: #fff;
        }

        .query-builder > .group-or-rule-container > .group > .group--header.no--children + .group--children.one--child + .group--footer .action--ADD-GROUP.ant-btn {
            border-color: ${token.colorPrimary};
            color: ${token.colorPrimary};
            background: #fff;
        }

        .query-builder > .group-or-rule-container > .group > .group--header.no--children .action--ADD-GROUP.ant-btn:hover,
        .query-builder > .group-or-rule-container > .group > .group--header.no--children .action--ADD-GROUP.ant-btn:focus-visible {
            border-color: ${token.colorPrimaryHover};
            color: ${token.colorPrimaryHover};
            background: #fff;
        }

        .query-builder > .group-or-rule-container > .group > .group--header.no--children + .group--children.one--child + .group--footer .action--ADD-GROUP.ant-btn:hover,
        .query-builder > .group-or-rule-container > .group > .group--header.no--children + .group--children.one--child + .group--footer .action--ADD-GROUP.ant-btn:focus-visible {
            border-color: ${token.colorPrimaryHover};
            color: ${token.colorPrimaryHover};
            background: #fff;
        }

        .query-builder > .group-or-rule-container > .group > .group--header.no--children .action--ADD-RULE.ant-btn .anticon,
        .query-builder > .group-or-rule-container > .group > .group--header.no--children .action--ADD-GROUP.ant-btn .anticon {
            font-size: 16px;
            margin-right: 8px;
        }

        .query-builder > .group-or-rule-container > .group > .group--header.no--children + .group--children.one--child + .group--footer .action--ADD-RULE.ant-btn .anticon,
        .query-builder > .group-or-rule-container > .group > .group--header.no--children + .group--children.one--child + .group--footer .action--ADD-GROUP.ant-btn .anticon {
            font-size: 16px;
            margin-right: 8px;
        }

        .query-builder > .group-or-rule-container > .group > .group--children .group {
            background: #b9d0f1;
            border: 1px solid #99bce9;
            border-radius: 10px;
        }

        .query-builder > .group-or-rule-container > .group > .group--children .group .group {
            background: #8fb3e5;
            border-color: #5d95dd;
        }

        .query-builder > .group-or-rule-container > .group > .group--children .group > .group--header {
            margin: 0;
            padding: 10px 10px 6px;
            display: flex;
            align-items: center;
        }

        .query-builder > .group-or-rule-container > .group > .group--children .group > .group--header::before {
            display: none;
        }

        .query-builder > .group-or-rule-container > .group > .group--children .group > .group--children {
            padding: 0 10px 10px;
            margin: 0;
        }

        .query-builder > .group-or-rule-container > .group > .group--children .group .group--actions {
            margin-left: auto;
            width: auto;
        }

        .query-builder > .group-or-rule-container > .group > .group--children .group .action--ADD-GROUP {
            display: none;
        }

        .query-builder > .group-or-rule-container > .group > .group--children .group .action--ADD-RULE,
        .query-builder > .group-or-rule-container > .group > .group--children .group .action--DELETE {
            width: 22px;
            min-width: 22px;
            height: 22px;
            padding: 0;
            border-radius: 6px;
            font-size: 0;
            border: 1px solid #dce5f3;
            background: #fff;
            color: rgba(0, 0, 0, 0.65);
            box-shadow: none;
        }

        .query-builder > .group-or-rule-container > .group > .group--children .group .action--DELETE {
            border-color: #ffd1cc;
            color: ${token.colorError};
        }

        .query-builder > .group-or-rule-container > .group > .group--children .group .action--ADD-RULE .anticon,
        .query-builder > .group-or-rule-container > .group > .group--children .group .action--DELETE .anticon {
            font-size: 11px;
        }

        .query-builder > .group-or-rule-container > .group > .group--children {
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .query-builder > .group-or-rule-container > .group > .group--children > .group-or-rule-container {
            margin: 0;
            padding: 0;
        }

        .query-builder > .group-or-rule-container > .group > .group--footer {
            margin-top: 12px;
        }

        .query-builder .group--conjunctions .ant-btn {
            border: 0;
            background: transparent;
            box-shadow: none;
            color: ${token.colorPrimary};
            font-weight: 500;
            padding-left: 0;
            padding-right: 10px;
            height: 24px;
        }

        .query-builder .group--conjunctions .ant-btn.ant-btn-primary {
            border: 0;
            background: transparent;
            color: ${token.colorPrimary};
        }

        .query-builder .rule {
            background: #fff;
            border: 1px solid #d0d5dd;
            border-radius: 8px;
            padding: 4px;
            overflow: hidden;
        }

        .query-builder .rule--body {
            display: flex;
            align-items: stretch;
            justify-content: flex-start;
            text-align: left;
            gap: 4px;
            padding: 0;
            width: 100%;
        }

        .query-builder .rule--body--wrapper {
            flex: 1 1 auto;
            min-width: 0;
            display: flex;
            align-items: stretch;
        }

        .query-builder .rule--field-wrapper {
            display: flex;
            align-items: stretch;
            gap: 0;
            flex: 0.8 1 0;
            max-width: none;
            min-width: 0;
            margin: 2px 0;
            border: 1px solid #c7ced8;
            border-radius: 8px;
            background: #fff;
            overflow: hidden;
        }

        .query-builder .rule--header {
            margin-left: 0;
            padding: 0;
            border-left: 1px solid #eaecf0;
            background: transparent;
            min-height: 0;
            min-width: 0;
            justify-content: flex-end;
            display: flex;
            align-items: center;
        }

        .query-builder .rule--field,
        .query-builder .rule--operator,
        .query-builder .rule--value {
            margin: 0;
            min-width: 0;
        }

        .query-builder .rule--field {
            flex: 1 1 0;
            max-width: none;
            padding: 0;
            min-width: 0;
            display: flex;
            align-items: stretch;
        }

        .query-builder .rule--field > * {
            flex: 1 1 auto;
            min-width: 0;
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
            margin: 2px 0;
            border: 1px solid #c7ced8;
            border-radius: 8px;
            background: #fff;
            min-height: 20px;
            padding: 0 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
        }

        .query-builder .sha-query-builder-empty-operator-text {
            color: #98a2b3;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 20px;
        }

        .query-builder .sha-query-builder-empty-value {
            flex: 1.2 1 0;
            min-width: 0;
            margin: 2px 0;
            border: 1px solid #c7ced8;
            border-radius: 8px;
            background: #fff;
            min-height: 20px;
            overflow: hidden;
            display: flex;
            align-items: stretch;
        }

        .query-builder .sha-query-builder-empty-value-type {
            flex: 0 0 auto;
            width: 28px;
            min-width: 28px;
            box-sizing: border-box;
            border-right: 1px solid #d0d5dd;
            background: #f8fafc;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1px;
            padding: 0 3px;
            color: #1d2939;
        }

        .query-builder .sha-query-builder-empty-value-type-icon {
            font-size: 9px;
        }

        .query-builder .sha-query-builder-empty-value-text {
            flex: 1 1 auto;
            min-width: 0;
            color: #98a2b3;
            line-height: 20px;
            padding: 0 12px;
            display: flex;
            align-items: center;
        }

        .query-builder .sha-query-builder-empty-caret {
            color: #98a2b3;
            font-size: 9px;
        }

        .query-builder .rule--operator {
            flex: 0.65 1 0;
            max-width: none;
            display: flex;
            align-items: stretch;
            min-width: 0;
            padding: 0;
            margin: 2px 0;
            border: 1px solid #c7ced8;
            border-radius: 8px;
            background: #fff;
            overflow: hidden;
        }

        .query-builder .rule--operator > * {
            flex: 1 1 auto;
            min-width: 0;
        }

        .query-builder .rule--value {
            flex: 1.2 1 0;
            width: auto;
            display: flex;
            align-items: stretch;
            padding: 0;
            margin: 2px 0;
            border: 1px solid #c7ced8;
            border-radius: 8px;
            background: #fff;
            overflow: hidden;
        }

        .query-builder .rule--value .rule--widget,
        .query-builder .rule--value .widget--widget {
            width: 100%;
            min-width: 0;
            flex: 1 1 auto;
            display: flex;
            align-items: stretch;
        }

        .query-builder .rule--value .widget--widget > *:not(.widget--valuesrc) {
            flex: 1 1 auto;
            min-width: 0;
        }

        .query-builder .rule--field .${prefixCls}-select,
        .query-builder .rule--operator .${prefixCls}-select,
        .query-builder .rule--value .${prefixCls}-select,
        .query-builder .rule--value .${prefixCls}-input {
            width: 100%;
        }

        .query-builder .rule--field .${prefixCls}-select-selector,
        .query-builder .rule--operator .${prefixCls}-select-selector,
        .query-builder .rule--value .${prefixCls}-select-selector {
            min-height: 20px;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: transparent !important;
        }

        .query-builder .rule--value .${prefixCls}-input {
            min-height: 20px;
            height: 20px;
            line-height: 20px;
            padding: 0 12px;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: transparent !important;
        }

        .query-builder .rule--fieldsrc,
        .query-builder .widget--valuesrc {
            margin: 0;
            flex: 0 0 auto;
        }

        .query-builder .rule--fieldsrc {
            flex: 0 0 37px;
        }

        .query-builder .widget--valuesrc {
            flex: 0 0 28px;
        }

        .query-builder .rule--field .sha-query-builder-packed-select {
            display: flex;
            align-items: stretch;
            width: 100%;
            min-width: 0;
            flex: 1 1 auto;
        }

        .query-builder .rule--fieldsrc .sha-query-builder-source-trigger {
            height: 100%;
            min-height: 20px;
            width: 100%;
            min-width: 0;
            box-sizing: border-box;
            border-radius: 0;
            border: 0;
            border-right: 1px solid #d0d5dd;
            background: #f8fafc;
            padding: 0 4px;
            color: #344054;
            gap: 2px;
            justify-content: center;
        }

        .query-builder .rule--fieldsrc .sha-query-builder-source-trigger .sha-query-builder-source-trigger-icon {
            color: #1d2939;
            font-size: 12px;
        }

        .query-builder .rule--fieldsrc .sha-query-builder-source-trigger .sha-query-builder-source-trigger-arrow {
            color: #98a2b3;
            font-size: 7px;
        }

        .query-builder .widget--valuesrc .sha-query-builder-source-trigger {
            height: 100%;
            min-height: 20px;
            width: 100%;
            min-width: 0;
            box-sizing: border-box;
            border-radius: 0;
            border: 0;
            border-right: 1px solid #d0d5dd;
            background: #f8fafc;
            padding: 0 3px;
            color: #344054;
            gap: 1px;
            justify-content: center;
        }

        .query-builder .widget--valuesrc .sha-query-builder-source-trigger .sha-query-builder-source-trigger-icon {
            color: #1d2939;
            font-size: 9px;
        }

        .query-builder .widget--valuesrc .sha-query-builder-source-trigger .sha-query-builder-source-trigger-arrow {
            color: #98a2b3;
            font-size: 7px;
        }

        .query-builder .rule--field-wrapper .rule--field .${prefixCls}-select .${prefixCls}-select-selector {
            border-radius: 0;
            min-height: 20px;
            padding-block: 0 !important;
            padding-inline: 12px;
            display: flex;
            align-items: center;
        }

        .query-builder .rule--field-wrapper .rule--field .${prefixCls}-select-single .${prefixCls}-select-selection-item,
        .query-builder .rule--field-wrapper .rule--field .${prefixCls}-select-single .${prefixCls}-select-selection-placeholder {
            line-height: 20px !important;
        }

        .query-builder .rule--field-wrapper .rule--field .${prefixCls}-select-single .${prefixCls}-select-selection-search-input {
            height: 20px;
        }

        .query-builder .rule--operator .${prefixCls}-select .${prefixCls}-select-selector {
            min-height: 20px;
            padding-block: 0 !important;
            padding-inline: 12px;
            display: flex;
            align-items: center;
        }

        .query-builder .rule--operator .${prefixCls}-select-single .${prefixCls}-select-selection-item,
        .query-builder .rule--operator .${prefixCls}-select-single .${prefixCls}-select-selection-placeholder {
            line-height: 20px !important;
        }

        .query-builder .rule--operator .${prefixCls}-select-single .${prefixCls}-select-selection-search-input {
            height: 20px;
        }

        .query-builder .rule--value .${prefixCls}-select .${prefixCls}-select-selector {
            min-height: 20px;
            padding-block: 0 !important;
            padding-inline: 12px;
            display: flex;
            align-items: center;
        }

        .query-builder .rule--value .${prefixCls}-select-single .${prefixCls}-select-selection-item,
        .query-builder .rule--value .${prefixCls}-select-single .${prefixCls}-select-selection-placeholder {
            line-height: 20px !important;
        }

        .query-builder .rule--value .${prefixCls}-select-single .${prefixCls}-select-selection-search-input {
            height: 20px;
        }

        .query-builder .rule .rule--header .action--DELETE {
            color: ${token.colorError};
            border: 0;
            background: transparent;
            width: 32px;
            height: 32px;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .query-builder .rule .rule--drag-handler {
            border-left: 1px solid #f4f5f6;
            background: transparent;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 6px;
            color: #667085;
        }

        .query-builder.qb-lite:not(.qb-dragging) .rule .rule--fieldsrc,
        .query-builder.qb-lite:not(.qb-dragging) .rule .widget--valuesrc,
        .query-builder.qb-lite:not(.qb-dragging) .rule .rule--header,
        .query-builder.qb-lite:not(.qb-dragging) .rule .rule--drag-handler {
            opacity: 1 !important;
            visibility: visible !important;
        }

        .query-builder .rule--func {
            display: none;
        }

        .query-builder .rule--func--bracket-before,
        .query-builder .rule--func--bracket-after,
        .query-builder .rule--func--arg-sep {
            display: none;
        }

        .query-builder .rule--func--arg--expression {
            flex: 1;
            min-width: 0;
        }

        .query-builder .rule--func--arg--ignoreIfUnassigned {
            margin-left: -34px;
            position: relative;
            z-index: 1;
        }

        .query-builder .rule--func--arg--ignoreIfUnassigned .rule--widget {
            width: auto;
            margin: 0;
        }

        @media (max-width: 900px) {
            .query-builder .rule--body {
                flex-wrap: nowrap;
            }

            .query-builder .rule--field {
                flex: 1 1 auto;
            }

            .query-builder .rule--operator {
                flex: 0.65 1 0;
            }

            .query-builder .rule--value {
                flex: 1.2 1 auto;
            }

            .query-builder > .group-or-rule-container > .group > .group--header .group--actions .ant-btn-group {
                flex-wrap: wrap;
                justify-content: flex-start;
            }
        }
    `);

  const shaQueryBuilderModalHelpText = cx("sha-query-builder-modal-help-text", css`
        font-size: 16px;
        line-height: 1.5;
        color: rgba(0, 0, 0, 0.88);
    `);

  const shaQueryBuilderModalHelpWrap = cx("sha-query-builder-modal-help-wrap", css`
        margin: 0 0 12px;
        display: inline-flex;
        align-items: center;
    `);

  const shaQueryBuilderModalHelpIcon = cx("sha-query-builder-modal-help-icon", css`
        color: rgba(0, 0, 0, 0.45);
        font-size: 14px;
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
