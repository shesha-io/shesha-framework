import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, prefixCls }) => {
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

    return {
        shaQueryBuilderField,
        shaQueryBuilderPlainWrapper,
        shaQueryBuilder,
        shaQqueryBuilderPlainWrapperBtnWrapper,
        shaQueryBuilderMarginTop8: shaQueryBuilderMarginTop8,
    };
});