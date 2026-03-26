import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, prefixCls, token }) => {
  const queryBuilderSurfaceWidth = '1158px';
  const queryBuilderRuleWidth = '880px';
  const queryBuilderSurfaceRadius = '6px';
  const queryBuilderControlRadius = '4px';
  const queryBuilderActionRadius = '4px';

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
            border-radius: ${queryBuilderSurfaceRadius};
            padding: 12px;
        }

        .query-builder-container.qb-has-rules .qb-logic-heading {
            font-family: Inter, Roboto, Helvetica, Arial, sans-serif;
            font-size: 16px;
            line-height: 22px;
            font-weight: 400;
            color: #000;
            margin: 0 0 12px;
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

        .query-builder-container.qb-empty .query-builder > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container {
            margin: 0 !important;
            padding-right: 0 !important;
        }

        .query-builder-container.qb-empty .query-builder > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group {
            padding: 0 !important;
        }

        .query-builder-container.qb-empty .query-builder > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--header,
        .query-builder-container.qb-empty .query-builder > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--children {
            display: none !important;
        }

        .query-builder-container.qb-empty .query-builder > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer {
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
        }

        .query-builder-container.qb-empty .query-builder > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer .group--actions,
        .query-builder-container.qb-empty .query-builder > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer .group--actions.group--actions--br,
        .query-builder-container.qb-empty .query-builder > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer .group--actions.group--actions--tr {
            margin: 0 !important;
            width: 100% !important;
            justify-content: flex-start !important;
        }

        .query-builder-container.qb-empty .query-builder > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer:has(> .sha-query-builder-empty-state--root) {
            display: flex !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
        }

        .query-builder-container.qb-empty .query-builder > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer:has(> .sha-query-builder-empty-state--root) > .group--actions,
        .query-builder-container.qb-empty .query-builder > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer:has(> .sha-query-builder-empty-state--root) > .group--actions.group--actions--br,
        .query-builder-container.qb-empty .query-builder > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer:has(> .sha-query-builder-empty-state--root) > .group--actions.group--actions--tr {
            margin: 0 !important;
            width: auto !important;
            flex: 0 0 auto !important;
            justify-content: flex-start !important;
        }

        .query-builder-container.qb-empty .query-builder > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer:has(> .sha-query-builder-empty-state--root) > .group--actions .ant-btn-group {
            display: inline-flex !important;
            justify-content: flex-start !important;
            align-items: center !important;
            gap: 12px;
        }

        .query-builder .sha-query-builder-empty-state-message {
            display: block;
            margin: 0;
            font-size: 14px;
            line-height: 22px;
            font-weight: 400;
            color: #585858;
            width: 239.79px;
            font-family: Inter, Roboto, Helvetica, Arial, sans-serif;
        }

        .query-builder .group--footer:has(> .sha-query-builder-empty-state) {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
        }

        .query-builder .group--footer > .sha-query-builder-empty-state {
            margin: 0;
        }

        .query-builder .group--footer > .sha-query-builder-empty-state--root {
            width: 100%;
        }

        .query-builder .sha-query-builder-empty-state-content {
            width: 100%;
            max-width: 100%;
            height: 88px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
            gap: 10px;
            padding: 0;
            background: #f7f7f7;
            border-radius: ${queryBuilderControlRadius};
        }

        .query-builder .sha-query-builder-empty-state-actions {
            display: inline-flex;
            justify-content: flex-start;
            align-items: flex-start;
            gap: 12px;
            flex: 0 0 auto;
        }

        .query-builder .group--footer > .sha-query-builder-empty-state--root .sha-query-builder-empty-state-actions .action--ADD-RULE.ant-btn,
        .query-builder .group--footer > .sha-query-builder-empty-state--root .sha-query-builder-empty-state-actions .action--ADD-GROUP.ant-btn {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            height: 36px !important;
            min-width: 160px !important;
            padding: 0 16px !important;
            border-radius: ${queryBuilderActionRadius} !important;
            font-size: 14px !important;
            font-weight: 500 !important;
            box-shadow: none !important;
            gap: 8px !important;
        }

        .query-builder .group--footer > .sha-query-builder-empty-state--root .sha-query-builder-empty-state-actions .action--ADD-RULE.ant-btn {
            background: #1890ff !important;
            border-color: #1890ff !important;
            color: #fff !important;
        }

        .query-builder .group--footer > .sha-query-builder-empty-state--root .sha-query-builder-empty-state-actions .action--ADD-GROUP.ant-btn {
            background: #fff !important;
            border-color: #1890ff !important;
            color: #1890ff !important;
        }

        .query-builder .group--footer > .sha-query-builder-empty-state--root .sha-query-builder-empty-state-actions .action--ADD-RULE.ant-btn .ant-btn-icon,
        .query-builder .group--footer > .sha-query-builder-empty-state--root .sha-query-builder-empty-state-actions .action--ADD-GROUP.ant-btn .ant-btn-icon {
            margin-right: 0 !important;
        }

        .query-builder .group--footer > .sha-query-builder-empty-state--root .sha-query-builder-empty-state-actions .action--ADD-RULE.ant-btn .ant-btn-icon .anticon,
        .query-builder .group--footer > .sha-query-builder-empty-state--root .sha-query-builder-empty-state-actions .action--ADD-GROUP.ant-btn .ant-btn-icon .anticon {
            font-size: 16px !important;
        }

        .query-builder .group--footer > .sha-query-builder-empty-state + .group--actions,
        .query-builder .group--footer > .sha-query-builder-empty-state + .group--actions.group--actions--br,
        .query-builder .group--footer > .sha-query-builder-empty-state + .group--actions.group--actions--tr {
            margin: 0 !important;
            width: auto !important;
            flex: 0 0 auto !important;
            justify-content: flex-start !important;
        }

        .query-builder .group--footer > .sha-query-builder-empty-state--root + .group--actions,
        .query-builder .group--footer > .sha-query-builder-empty-state--root + .group--actions.group--actions--br,
        .query-builder .group--footer > .sha-query-builder-empty-state--root + .group--actions.group--actions--tr {
            display: none !important;
        }

        .query-builder .group--footer > .sha-query-builder-empty-state + .group--actions .ant-btn-group {
            display: inline-flex !important;
            justify-content: flex-start !important;
            align-items: center !important;
            gap: 12px;
        }

        .query-builder .sha-query-builder-group-footer-logic {
            display: inline-flex;
            align-items: center;
            margin: 0;
            font-size: 14px;
            line-height: 1.43;
            font-weight: 500;
            color: rgba(0, 0, 0, 0.88);
            white-space: nowrap;
        }

        .query-builder .group--footer > .sha-query-builder-group-footer-logic {
            flex: 0 0 auto;
            align-self: center;
        }

        .query-builder .group--footer > .sha-query-builder-group-footer-logic ~ .group--actions,
        .query-builder .group--footer > .sha-query-builder-group-footer-logic ~ .group--actions.group--actions--br,
        .query-builder .group--footer > .sha-query-builder-group-footer-logic ~ .group--actions.group--actions--tr {
            margin-left: auto !important;
            width: auto !important;
            flex: 1 1 auto !important;
            justify-content: flex-end !important;
        }

        .query-builder-container.qb-empty .query-builder > .group-or-rule-container > .group > .group--header,
        .query-builder-container.qb-empty .query-builder > .group-or-rule-container > .group > .group--children {
            display: none !important;
        }

        .query-builder-container.qb-empty .query-builder > .group-or-rule-container > .group > .group--footer {
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
        }

        .query-builder-container.qb-empty .query-builder > .group-or-rule-container > .group > .group--footer .group--actions,
        .query-builder-container.qb-empty .query-builder > .group-or-rule-container > .group > .group--footer .group--actions.group--actions--br,
        .query-builder-container.qb-empty .query-builder > .group-or-rule-container > .group > .group--footer .group--actions.group--actions--tr {
            margin: 0 !important;
            width: 100% !important;
            justify-content: flex-start !important;
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
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 8px;
            min-height: 32px;
            margin: 0 0 12px;
            padding: 0;
        }

        .query-builder-container.qb-has-rules .query-builder > .group-or-rule-container > .group > .group--header::before {
            display: none;
        }

        .query-builder-container.qb-has-rules .query-builder > .group-or-rule-container > .group > .group--header .group--conjunctions {
            display: inline-flex !important;
            align-items: center;
            gap: 8px;
        }

        .query-builder-container.qb-has-rules .query-builder > .group-or-rule-container > .group > .group--header .group--conjunctions .ant-btn-group {
            display: inline-flex;
            gap: 6px;
        }

        .query-builder > .group-or-rule-container > .group > .group--header .group--conjunctions .group--drag-handler {
            width: 24px;
            min-width: 24px;
            height: 24px;
            border: 1px solid #d0d5dd;
            border-radius: ${queryBuilderActionRadius};
            background: #fff;
            color: #667085;
            padding: 0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
            margin: 0 !important;
            position: relative !important;
            top: 0 !important;
            left: 0 !important;
            transform: none !important;
            flex-shrink: 0;
        }

        .query-builder > .group-or-rule-container > .group > .group--header .group--conjunctions .group--drag-handler .anticon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
            font-size: 12px;
        }

        .query-builder .group > .group--header:not(.no--children) + .group--children {
            position: relative;
            padding-left: 0 !important;
        }

        .query-builder .group > .group--header:not(.no--children) + .group--children::before {
            content: none;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation {
            position: relative;
            display: flex;
            width: 100%;
            max-width: ${queryBuilderRuleWidth};
            min-width: 0;
            padding: 0;
            align-items: flex-start;
            gap: 10px;
            flex-shrink: 0;
            box-sizing: border-box;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .sha-query-builder-item-prefix {
            width: var(--qb-relation-width);
            min-width: var(--qb-relation-width);
            flex: 0 0 var(--qb-relation-width);
            min-height: 28px;
            padding-top: 2px;
            display: flex;
            align-items: center;
            justify-content: flex-start;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .sha-query-builder-item-prefix--where .sha-query-builder-item-prefix-label {
            color: ${token.colorPrimary};
            font-size: 14px;
            font-weight: 500;
            line-height: 20px;
            white-space: nowrap;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .sha-query-builder-item-prefix--relation .sha-query-builder-item-relation {
            width: 100%;
            display: inline-flex;
            align-items: center;
            pointer-events: auto;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container {
            flex: 1 1 auto;
            min-width: 0;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation--has-relation .sha-query-builder-item-relation .${prefixCls}-select-selector {
            min-height: 24px;
            border: 1px solid #c7ced8 !important;
            border-radius: ${queryBuilderControlRadius} !important;
            box-shadow: none !important;
            padding: 0 6px !important;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation--has-relation .sha-query-builder-item-relation .${prefixCls}-select-selection-item {
            line-height: 22px !important;
            font-size: 12px;
            font-weight: 500;
            color: ${token.colorPrimary};
        }

        .query-builder {
            --qb-relation-width: 64px;
            --qb-relation-gap: 8px;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation--has-relation .sha-query-builder-item-relation .${prefixCls}-select {
            width: 100%;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation--has-relation .sha-query-builder-item-relation .${prefixCls}-select-selector {
            min-height: 28px;
            padding: 0 8px !important;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation--has-relation .sha-query-builder-item-relation .${prefixCls}-select-selection-item {
            line-height: 26px !important;
            font-size: 13px;
        }

        .query-builder-container.qb-has-rules .query-builder > .group-or-rule-container > .group,
        .query-builder-container.qb-empty .query-builder > .group-or-rule-container > .group {
            background: transparent;
            border: 0;
            border-radius: 0;
            padding: 0;
        }

        .query-builder .group {
            background: transparent !important;
            border: 0 !important;
            border-radius: 0;
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
            border-radius: ${queryBuilderActionRadius};
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
            margin-bottom: 12px;
            font-family: Inter, Roboto, Helvetica, Arial, sans-serif;
            font-size: 16px;
            line-height: 22px;
            font-weight: 400;
            color: #000;
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
            border-radius: ${queryBuilderActionRadius};
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

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group {
            display: flex;
            width: 100%;
            min-width: 0;
            min-height: 133px;
            padding: 10px;
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
            background: rgba(43, 120, 228, 0.30) !important;
            border: 1px solid #7fa8dc !important;
            border-radius: 11px;
            position: relative;
            box-sizing: border-box;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--header {
            margin: 0 !important;
            padding: 0 !important;
            min-height: 0 !important;
            display: none !important;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--children {
            width: 100%;
            margin: 28px 0 0;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer {
            margin: 0;
            min-height: 0;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer .sha-query-builder-group-footer-logic {
            position: absolute;
            top: 8px;
            left: 8px;
            height: 24px;
            display: inline-flex;
            align-items: center;
            margin: 0 !important;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer .group--actions {
            position: absolute !important;
            top: 8px !important;
            right: 38px !important;
            width: auto !important;
            margin: 0 !important;
            justify-content: flex-start !important;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer .group--actions .ant-btn-group {
            gap: 6px !important;
            height: 24px !important;
            display: inline-flex !important;
            align-items: center !important;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer .group--actions .ant-btn {
            width: 24px !important;
            min-width: 24px !important;
            height: 24px !important;
            padding: 0 !important;
            border-radius: ${queryBuilderActionRadius} !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 0 !important;
            line-height: 1 !important;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer .group--actions .ant-btn .ant-btn-icon {
            margin: 0 !important;
            font-size: 12px !important;
            line-height: 1 !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer .group--actions .ant-btn > span:not(.ant-btn-icon) {
            display: none !important;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer .group--actions .action--ADD-RULE.ant-btn,
        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer .group--actions .action--ADD-GROUP.ant-btn {
            background: #fff !important;
            border: 1px solid #d0d5dd !important;
            color: ${token.colorPrimary} !important;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer .group--actions .action--DELETE.ant-btn {
            background: #fff !important;
            border: 1px solid #ffd1cc !important;
            color: ${token.colorError} !important;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer .sha-query-builder-group-extra-actions {
            position: absolute !important;
            top: 8px !important;
            right: 8px !important;
            width: 24px;
            height: 24px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer .sha-query-builder-group-extra-action {
            width: 24px;
            min-width: 24px;
            height: 24px;
            border: 1px solid #d0d5dd;
            border-radius: ${queryBuilderActionRadius};
            background: #fff;
            color: #667085;
            padding: 0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
            margin: 0 !important;
            position: relative !important;
            top: 0 !important;
            left: 0 !important;
            transform: none !important;
            flex-shrink: 0;
            cursor: grab;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer .sha-query-builder-group-extra-action .anticon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
            font-size: 12px;
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
        border-radius: ${queryBuilderActionRadius};
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: ${token.colorPrimaryBg};
        color: ${token.colorPrimary};
        border: 1px solid ${token.colorPrimaryBorder};
        font-size: 13px;
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
            border-radius: ${queryBuilderSurfaceRadius};
            padding: 12px;
        }

        .query-builder-container.qb-has-rules .qb-logic-heading {
            font-family: Inter, Roboto, Helvetica, Arial, sans-serif;
            font-size: 16px;
            line-height: 22px;
            font-weight: 400;
            color: #000;
            margin: 0 0 12px;
        }

        .query-builder-container.qb-has-rules,
        .query-builder-container.qb-empty {
            background: #f5f5f5;
            border: 1px solid #ededee;
            border-radius: ${queryBuilderSurfaceRadius};
            width: 100%;
            max-width: 966px;
            min-width: 0;
            min-height: 236px;
            height: auto;
            padding: 20px 10px !important;
            box-sizing: border-box;
        }

        .query-builder-container.qb-empty .query-builder > .group-or-rule-container > .group > .group--header,
        .query-builder-container.qb-empty .query-builder > .group-or-rule-container > .group > .group--children {
            display: none !important;
        }

        .query-builder-container.qb-empty .query-builder > .group-or-rule-container > .group > .group--footer {
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
        }

        .query-builder-container.qb-empty .query-builder > .group-or-rule-container > .group > .group--footer .group--actions,
        .query-builder-container.qb-empty .query-builder > .group-or-rule-container > .group > .group--footer .group--actions.group--actions--br,
        .query-builder-container.qb-empty .query-builder > .group-or-rule-container > .group > .group--footer .group--actions.group--actions--tr {
            margin: 0 !important;
            width: 100% !important;
            justify-content: flex-start !important;
        }

        .query-builder-container.qb-has-rules .qb-rule-layout {
            display: flex;
            align-items: flex-start;
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
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 8px;
            min-height: 32px;
            margin: 0 0 12px;
            padding: 0;
        }

        .query-builder-container.qb-has-rules .query-builder > .group-or-rule-container > .group > .group--header::before {
            display: none;
        }

        .query-builder-container.qb-has-rules .query-builder > .group-or-rule-container > .group > .group--header .group--conjunctions {
            display: inline-flex !important;
            align-items: center;
            gap: 8px;
        }

        .query-builder-container.qb-has-rules .query-builder > .group-or-rule-container > .group > .group--header .group--conjunctions .ant-btn-group {
            display: inline-flex;
            gap: 6px;
        }

        .query-builder > .group-or-rule-container > .group > .group--header .group--conjunctions .group--drag-handler {
            width: 24px;
            min-width: 24px;
            height: 24px;
            border: 1px solid #d0d5dd;
            border-radius: ${queryBuilderActionRadius};
            background: #fff;
            color: #667085;
            padding: 0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
            margin: 0 !important;
            position: relative !important;
            top: 0 !important;
            left: 0 !important;
            transform: none !important;
            flex-shrink: 0;
        }

        .query-builder > .group-or-rule-container > .group > .group--header .group--conjunctions .group--drag-handler .anticon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
            font-size: 12px;
        }

        .query-builder .group > .group--header:not(.no--children) + .group--children {
            position: relative;
            padding-left: 0 !important;
        }

        .query-builder .group > .group--header:not(.no--children) + .group--children::before {
            content: none;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation {
            position: relative;
            display: flex;
            width: 100%;
            max-width: ${queryBuilderRuleWidth};
            min-width: 0;
            padding: 0;
            align-items: flex-start;
            gap: 10px;
            flex-shrink: 0;
            box-sizing: border-box;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .sha-query-builder-item-prefix {
            width: var(--qb-relation-width);
            min-width: var(--qb-relation-width);
            flex: 0 0 var(--qb-relation-width);
            min-height: 28px;
            padding-top: 2px;
            display: flex;
            align-items: center;
            justify-content: flex-start;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .sha-query-builder-item-prefix--where .sha-query-builder-item-prefix-label {
            color: ${token.colorPrimary};
            font-size: 14px;
            font-weight: 500;
            line-height: 20px;
            white-space: nowrap;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .sha-query-builder-item-prefix--relation .sha-query-builder-item-relation {
            width: 100%;
            display: inline-flex;
            align-items: center;
            pointer-events: auto;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container {
            flex: 1 1 auto;
            min-width: 0;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation--has-relation .sha-query-builder-item-relation .${prefixCls}-select-selector {
            min-height: 24px;
            border: 1px solid #c7ced8 !important;
            border-radius: ${queryBuilderControlRadius} !important;
            box-shadow: none !important;
            padding: 0 6px !important;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation--has-relation .sha-query-builder-item-relation .${prefixCls}-select-selection-item {
            line-height: 22px !important;
            font-size: 12px;
            font-weight: 500;
            color: ${token.colorPrimary};
        }

        .query-builder {
            --qb-relation-width: 64px;
            --qb-relation-gap: 8px;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation--has-relation .sha-query-builder-item-relation .${prefixCls}-select {
            width: 100%;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation--has-relation .sha-query-builder-item-relation .${prefixCls}-select-selector {
            min-height: 28px;
            padding: 0 8px !important;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation--has-relation .sha-query-builder-item-relation .${prefixCls}-select-selection-item {
            line-height: 26px !important;
            font-size: 13px;
        }

        .query-builder-container.qb-has-rules .query-builder > .group-or-rule-container > .group,
        .query-builder-container.qb-empty .query-builder > .group-or-rule-container > .group {
            background: transparent;
            border: 0;
            border-radius: 0;
            padding: 0;
        }

        .query-builder .group {
            background: transparent !important;
            border: 0 !important;
            border-radius: 0;
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
            border-radius: ${queryBuilderActionRadius};
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
            margin: 0 0 12px;
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
            font-family: Inter, Roboto, Helvetica, Arial, sans-serif;
            font-size: 16px;
            line-height: 22px;
            font-weight: 400;
            color: #000;
            margin-bottom: 12px;
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
            display: inline-flex !important;
            align-items: center;
            gap: 8px;
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

        .query-builder > .group-or-rule-container > .group > .group--header.no--children + .group--children.one--child + .group--footer .sha-query-builder-empty-state-message {
            margin-bottom: 12px;
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
            border-radius: ${queryBuilderActionRadius};
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
            border-radius: ${queryBuilderActionRadius};
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
            background: transparent !important;
            border: 0 !important;
            border-radius: 0;
        }

        .query-builder > .group-or-rule-container > .group > .group--children .group .group {
            background: transparent !important;
            border: 0 !important;
        }

        .query-builder > .group-or-rule-container > .group > .group--children .group > .group--header {
            margin: 0;
            padding: 0;
            display: flex;
            align-items: center;
        }

        .query-builder > .group-or-rule-container > .group > .group--children .group > .group--header::before {
            display: none;
        }

        .query-builder > .group-or-rule-container > .group > .group--children .group > .group--children {
            padding: 0;
            margin: 0;
        }

        .query-builder > .group-or-rule-container > .group > .group--children .group .group--actions {
            margin-left: 0;
            width: 100%;
        }

        .query-builder > .group-or-rule-container > .group > .group--children .group .action--ADD-RULE,
        .query-builder > .group-or-rule-container > .group > .group--children .group .action--ADD-GROUP,
        .query-builder > .group-or-rule-container > .group > .group--children .group .action--DELETE {
            width: auto;
            min-width: 0;
            height: 36px;
            padding: 0 16px;
            border-radius: ${queryBuilderActionRadius};
            font-size: 14px;
            border: 1px solid transparent;
            background: transparent;
            color: inherit;
            box-shadow: none;
        }

        .query-builder > .group-or-rule-container > .group > .group--children .group .action--DELETE {
            border-color: transparent;
            color: ${token.colorError};
        }

        .query-builder > .group-or-rule-container > .group > .group--children .group .action--ADD-RULE .anticon,
        .query-builder > .group-or-rule-container > .group > .group--children .group .action--ADD-GROUP .anticon,
        .query-builder > .group-or-rule-container > .group > .group--children .group .action--DELETE .anticon {
            font-size: 16px;
        }

        .query-builder > .group-or-rule-container > .group > .group--children {
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .query-builder .group--header:not(.no--children):not(.hide--conjs)::before,
        .query-builder .group--children > .group-or-rule-container > .group-or-rule::before,
        .query-builder .group--children > .group-or-rule-container > .group-or-rule::after {
            display: none !important;
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

        .query-builder .group--conjunctions .sha-query-builder-conjunction-select {
            display: inline-flex;
            align-items: center;
        }

        .query-builder .group--conjunctions .sha-query-builder-conjunction-select .${prefixCls}-select {
            width: 84px;
        }

        .query-builder .group--conjunctions .sha-query-builder-conjunction-select .${prefixCls}-select-selector {
            min-height: 24px;
            border: 1px solid #c7ced8 !important;
            border-radius: ${queryBuilderControlRadius} !important;
            box-shadow: none !important;
            padding: 0 8px !important;
        }

        .query-builder .group--conjunctions .sha-query-builder-conjunction-select .${prefixCls}-select-selection-item {
            line-height: 22px !important;
            font-weight: 500;
            color: ${token.colorPrimary};
        }

        .query-builder .rule {
            background: #fff;
            border: 1px solid #d0d5dd;
            border-radius: ${queryBuilderControlRadius};
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
            flex: 3 1 0;
            max-width: none;
            min-width: 0;
            margin: 2px 0;
            border: 1px solid #c7ced8;
            border-radius: ${queryBuilderControlRadius};
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
            flex: 7 1 0;
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
            flex: 3 1 0;
            min-width: 0;
            margin: 2px 0;
            border: 1px solid #c7ced8;
            border-radius: ${queryBuilderControlRadius};
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
            flex: 4 1 0;
            min-width: 0;
            margin: 2px 0;
            border: 1px solid #c7ced8;
            border-radius: ${queryBuilderControlRadius};
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
            flex: 3 1 0;
            max-width: none;
            display: flex;
            align-items: stretch;
            min-width: 0;
            padding: 0;
            margin: 2px 0;
            border: 1px solid #c7ced8;
            border-radius: ${queryBuilderControlRadius};
            background: #fff;
            overflow: hidden;
        }

        .query-builder .rule--operator > * {
            flex: 1 1 auto;
            min-width: 0;
        }

        .query-builder .rule--value {
            flex: 4 1 0;
            width: auto;
            display: flex;
            align-items: stretch;
            padding: 0;
            margin: 2px 0;
            border: 1px solid #c7ced8;
            border-radius: ${queryBuilderControlRadius};
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
        .query-builder .rule--value .${prefixCls}-input-number,
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

        .query-builder .rule--value .${prefixCls}-input-number {
            min-height: 20px;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: transparent !important;
        }

        .query-builder .rule--value .sha-query-builder-mustache-expression-input {
            width: 100%;
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

        .sha-query-builder-source-dropdown-trigger {
            display: inline-flex;
            width: 100%;
            min-width: 0;
            pointer-events: auto !important;
            position: relative;
            z-index: 2;
        }

        .query-builder .widget--valuesrc,
        .query-builder .widget--valuesrc * {
            pointer-events: auto !important;
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
            width: 16px;
            min-width: 16px;
            height: 16px;
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

        .query-builder.qb-lite:not(.qb-dragging) .group .group--drag-handler,
        .query-builder.qb-lite:not(.qb-dragging) .group .group--actions {
            opacity: 1 !important;
            visibility: visible !important;
        }

        .query-builder.qb-lite .rule .rule--drag-handler,
        .query-builder.qb-lite .group .group--drag-handler {
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

        .query-builder .rule--value .widget--widget .rule--func--arg--expression {
            flex: 1 1 auto;
            min-width: 0;
            display: flex;
            align-items: stretch;
        }

        .query-builder .rule--value .widget--widget .rule--func--arg--expression .rule--widget,
        .query-builder .rule--value .widget--widget .rule--func--arg--expression .rule--widget > * {
            flex: 1 1 auto;
            min-width: 0;
            width: 100%;
        }

        .query-builder .rule--value .widget--widget .rule--func--arg--ignoreIfUnassigned {
            flex: 0 0 auto;
            margin: 0;
            padding: 0 8px;
            border-left: 1px solid #d0d5dd;
            display: flex;
            align-items: center;
            justify-content: center;
            background: transparent;
        }

        .query-builder .rule--value .widget--widget .rule--func--arg--ignoreIfUnassigned .rule--widget {
            width: auto;
            margin: 0;
        }

        .query-builder .rule--value .widget--widget .rule--func--arg--ignoreIfUnassigned .sha-query-builder-ignore-unassigned {
            padding-right: 0;
        }

        .query-builder .rule--value .sha-query-builder-boolean-segmented {
            width: 100%;
            max-width: 100%;
        }

        .query-builder .rule--value .sha-query-builder-boolean-segmented .${prefixCls}-segmented-group {
            width: 100%;
        }

        .query-builder .rule--value .sha-query-builder-boolean-segmented .${prefixCls}-segmented-item {
            flex: 1 1 50%;
            min-width: 0;
        }

        .query-builder .rule--value .sha-query-builder-boolean-segmented .${prefixCls}-segmented-item-label {
            min-height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 12px;
            white-space: nowrap;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group {
            display: flex;
            width: 100%;
            min-width: 0;
            min-height: 133px;
            padding: 10px;
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
            background: rgba(43, 120, 228, 0.30) !important;
            border: 1px solid #7fa8dc !important;
            border-radius: 11px;
            position: relative;
            box-sizing: border-box;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--header {
            margin: 0 !important;
            padding: 0 !important;
            min-height: 0 !important;
            display: none !important;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--children {
            width: 100%;
            margin: 28px 0 0;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer {
            margin: 0;
            min-height: 0;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer .group--actions {
            position: absolute !important;
            top: 8px !important;
            right: 38px !important;
            width: auto !important;
            margin: 0 !important;
            justify-content: flex-start !important;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer .group--actions .ant-btn-group {
            gap: 6px !important;
            height: 24px !important;
            display: inline-flex !important;
            align-items: center !important;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer .group--actions .ant-btn {
            width: 24px !important;
            min-width: 24px !important;
            height: 24px !important;
            padding: 0 !important;
            border-radius: ${queryBuilderActionRadius} !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 0 !important;
            line-height: 1 !important;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer .group--actions .ant-btn .ant-btn-icon {
            margin: 0 !important;
            font-size: 12px !important;
            line-height: 1 !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer .group--actions .ant-btn > span:not(.ant-btn-icon) {
            display: none !important;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer .group--actions .action--ADD-RULE.ant-btn,
        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer .group--actions .action--ADD-GROUP.ant-btn {
            background: #fff !important;
            border: 1px solid #d0d5dd !important;
            color: ${token.colorPrimary} !important;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer .group--actions .action--DELETE.ant-btn {
            background: #fff !important;
            border: 1px solid #ffd1cc !important;
            color: ${token.colorError} !important;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer .sha-query-builder-group-extra-actions {
            position: absolute !important;
            top: 8px !important;
            right: 8px !important;
            width: 24px;
            height: 24px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer .sha-query-builder-group-extra-action {
            width: 24px;
            min-width: 24px;
            height: 24px;
            border: 1px solid #d0d5dd;
            border-radius: ${queryBuilderActionRadius};
            background: #fff;
            color: #667085;
            padding: 0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
            margin: 0 !important;
            position: relative !important;
            top: 0 !important;
            left: 0 !important;
            transform: none !important;
            flex-shrink: 0;
            cursor: grab;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer .sha-query-builder-group-extra-action .anticon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
            font-size: 12px;
        }

        @media (max-width: 900px) {
            .query-builder .rule--body {
                flex-wrap: nowrap;
            }

            .query-builder .rule--field {
                flex: 1 1 auto;
            }

            .query-builder .rule--operator {
                flex: 3 1 0;
            }

            .query-builder .rule--value {
                flex: 4 1 auto;
            }

            .query-builder > .group-or-rule-container > .group > .group--header .group--actions .ant-btn-group {
                flex-wrap: wrap;
                justify-content: flex-start;
            }
        }

        .query-builder .action--ADD-RULE.ant-btn:not(.ant-btn-icon-only),
        .query-builder .action--ADD-GROUP.ant-btn:not(.ant-btn-icon-only) {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 8px !important;
        }

        .query-builder .action--ADD-RULE.ant-btn:not(.ant-btn-icon-only) .ant-btn-icon,
        .query-builder .action--ADD-GROUP.ant-btn:not(.ant-btn-icon-only) .ant-btn-icon {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            line-height: 1 !important;
            margin: 0 !important;
        }

        .query-builder .action--ADD-RULE.ant-btn:not(.ant-btn-icon-only) .ant-btn-icon .anticon,
        .query-builder .action--ADD-GROUP.ant-btn:not(.ant-btn-icon-only) .ant-btn-icon .anticon {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            line-height: 1 !important;
            margin: 0 !important;
        }

        .query-builder .rule.group-or-rule {
            display: flex;
            align-items: center;
            width: 100%;
            min-width: 0;
        }

        .query-builder .rule.group-or-rule > .sha-query-builder-rule-drag-placeholder.rule--drag-handler {
            order: -1;
            pointer-events: none;
            cursor: default;
        }

        .query-builder .rule.group-or-rule > .rule--drag-handler {
            margin: 0 !important;
            padding: 0 6px !important;
            border: 0 !important;
            align-self: center !important;
            flex: 0 0 auto;
        }

        .query-builder .rule.group-or-rule > .rule--body--wrapper {
            flex: 1 1 auto;
            min-width: 0;
            margin: 0 !important;
            padding: 0 8px !important;
            border-left: 1px solid #d0d5dd;
            border-right: 1px solid #d0d5dd;
        }

        .query-builder .rule.group-or-rule > .rule--header {
            margin: 0 !important;
            padding: 0 6px !important;
            border-left: 0 !important;
            border-right: 0 !important;
            display: inline-flex;
            align-items: center;
            align-self: center;
            flex: 0 0 auto;
        }

        .query-builder .rule.group-or-rule > .rule--header::before,
        .query-builder .rule.group-or-rule > .rule--header::after {
            content: none !important;
            display: none !important;
        }

        .query-builder .rule.group-or-rule > .rule--header .ant-btn-group {
            display: inline-flex;
            align-items: center;
            margin: 0 !important;
        }

        .query-builder .rule.group-or-rule > .rule--header .ant-btn-group > .ant-btn {
            margin-left: 0 !important;
        }

        .query-builder .rule.group-or-rule > .rule--header .action--DELETE.ant-btn {
            width: 24px !important;
            min-width: 24px !important;
            height: 24px !important;
            padding: 0 !important;
        }

        .query-builder-container.qb-empty .query-builder > .group-or-rule-container > .group > .group--footer:has(> .sha-query-builder-empty-state--root) {
            display: flex !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
        }

        .query-builder-container.qb-empty .query-builder > .group-or-rule-container > .group > .group--footer:has(> .sha-query-builder-empty-state--root) > .group--actions,
        .query-builder-container.qb-empty .query-builder > .group-or-rule-container > .group > .group--footer:has(> .sha-query-builder-empty-state--root) > .group--actions.group--actions--br,
        .query-builder-container.qb-empty .query-builder > .group-or-rule-container > .group > .group--footer:has(> .sha-query-builder-empty-state--root) > .group--actions.group--actions--tr {
            margin: 0 !important;
            width: auto !important;
            flex: 0 0 auto !important;
            justify-content: flex-start !important;
        }

        .query-builder-container.qb-empty .query-builder > .group-or-rule-container > .group > .group--footer:has(> .sha-query-builder-empty-state--root) > .group--actions .ant-btn-group {
            display: inline-flex !important;
            justify-content: flex-start !important;
            align-items: center !important;
            gap: 12px;
        }

        .query-builder .rule--field,
        .query-builder .rule--operator,
        .query-builder .rule--value {
            display: flex;
            align-items: stretch;
            min-height: 20px;
            min-width: 0;
        }

        .query-builder .rule--field > *,
        .query-builder .rule--operator > *,
        .query-builder .rule--value > * {
            min-width: 0;
        }

        .query-builder .rule--value .rule--widget,
        .query-builder .rule--value .widget--widget,
        .query-builder .rule--value .widget--widget > *:not(.widget--valuesrc) {
            width: 100% !important;
            height: 100% !important;
            min-width: 0;
            flex: 1 1 auto;
        }

        .query-builder .rule--field .${prefixCls}-select,
        .query-builder .rule--operator .${prefixCls}-select,
        .query-builder .rule--value .${prefixCls}-select,
        .query-builder .rule--value .${prefixCls}-input-number,
        .query-builder .rule--value .${prefixCls}-input,
        .query-builder .rule--value .sha-query-builder-mustache-expression-input {
            width: 100% !important;
            height: 100% !important;
            min-width: 0;
        }

        .query-builder .rule--field .${prefixCls}-select-selector,
        .query-builder .rule--operator .${prefixCls}-select-selector,
        .query-builder .rule--value .${prefixCls}-select-selector {
            height: 100% !important;
            min-height: 20px !important;
            display: flex !important;
            align-items: center !important;
        }

        .query-builder .rule--field .${prefixCls}-select-selection-wrap,
        .query-builder .rule--operator .${prefixCls}-select-selection-wrap,
        .query-builder .rule--value .${prefixCls}-select-selection-wrap {
            align-items: center !important;
        }

        .query-builder .rule--field .${prefixCls}-select-single .${prefixCls}-select-selection-item,
        .query-builder .rule--field .${prefixCls}-select-single .${prefixCls}-select-selection-placeholder,
        .query-builder .rule--operator .${prefixCls}-select-single .${prefixCls}-select-selection-item,
        .query-builder .rule--operator .${prefixCls}-select-single .${prefixCls}-select-selection-placeholder,
        .query-builder .rule--value .${prefixCls}-select-single .${prefixCls}-select-selection-item,
        .query-builder .rule--value .${prefixCls}-select-single .${prefixCls}-select-selection-placeholder {
            display: flex !important;
            align-items: center !important;
            line-height: 20px !important;
        }

        .query-builder .rule--field .${prefixCls}-select-single .${prefixCls}-select-selection-search,
        .query-builder .rule--operator .${prefixCls}-select-single .${prefixCls}-select-selection-search,
        .query-builder .rule--value .${prefixCls}-select-single .${prefixCls}-select-selection-search {
            display: flex;
            align-items: center;
            height: 100%;
        }

        .query-builder .rule--field .${prefixCls}-select-single .${prefixCls}-select-selection-search-input,
        .query-builder .rule--operator .${prefixCls}-select-single .${prefixCls}-select-selection-search-input,
        .query-builder .rule--value .${prefixCls}-select-single .${prefixCls}-select-selection-search-input {
            height: 100% !important;
        }

        .query-builder .rule--value .${prefixCls}-input,
        .query-builder .rule--value .sha-query-builder-mustache-expression-input {
            height: 100% !important;
            min-height: 20px !important;
            line-height: 20px !important;
            padding-top: 0 !important;
            padding-bottom: 0 !important;
            display: block;
        }

        .query-builder .rule--value .${prefixCls}-input-number-input-wrap {
            height: 100% !important;
            display: flex;
            align-items: center;
        }

        .query-builder .rule--value .${prefixCls}-input-number-input {
            height: 100% !important;
            min-height: 20px !important;
            line-height: 20px !important;
            padding-top: 0 !important;
            padding-bottom: 0 !important;
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
