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
        .query-builder .group,
        .query-builder .rule_group {
            background: #f5f5f5;
            border-color: #e8e8e8;
        }

        .group--header.no--children .group--actions.group--actions--tr {
            margin-left: 0;
            margin-top: 4px;
            width: 100%;
            flex: 1 1 100%;
            justify-content: flex-start;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
            padding-left: 0;
        }

        .group--header.no--children .group--actions.group--actions--tr::before {
            content: "No filter conditions are applied";
            display: block;
            align-self: flex-start;
            margin: 0;
            padding: 0 0 0 4px;
            font-size: 14px;
            line-height: 1.43;
            color: rgba(0, 0, 0, 0.45);
        }

        .group--header.no--children .group--actions.group--actions--tr .ant-btn-group {
            align-self: flex-start;
            margin-left: 0;
        }

        .group--actions .ant-btn-group {
            display: inline-flex;
            gap: 10px;
        }

        .group--actions .ant-btn-group .ant-btn + .ant-btn {
            margin-left: 0;
        }

        .group--actions .group--add-rule.ant-btn,
        .group--actions .action--ADD-RULE.ant-btn {
            height: 32px;
            width: 130px;
            padding: 0 16px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            line-height: 1;
            background-color: ${token.colorPrimary};
            border-color: ${token.colorPrimary};
            color: #fff;
            box-shadow: 0 2px 0 rgba(0, 0, 0, 0.043);
        }

        .group--actions .group--add-group.ant-btn,
        .group--actions .action--ADD-GROUP.ant-btn {
            height: 32px;
            width: 145px;
            padding: 0 16px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            line-height: 1;
            background-color: #fff;
            border-color: ${token.colorPrimary};
            color: ${token.colorPrimary};
            box-shadow: 0 2px 0 rgba(0, 0, 0, 0.016);
        }

        .group--actions .group--add-rule.ant-btn .anticon,
        .group--actions .action--ADD-RULE.ant-btn .anticon,
        .group--actions .group--add-group.ant-btn .anticon,
        .group--actions .action--ADD-GROUP.ant-btn .anticon {
            font-size: 12px;
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
