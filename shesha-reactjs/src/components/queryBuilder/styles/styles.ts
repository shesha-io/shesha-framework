import { createStyles } from "antd-style";
import { sheshaStyles } from '@/styles';
import qb_compact_styles from './css/compact_styles.css';

export const useStyles = createStyles(({ css, cx, prefixCls }) => {
    const shaQueryBuilderBtns = "sha-query-builder-btns";
    const shaQueryBuilder = cx("sha-query-builder", css`
        ${qb_compact_styles}

        background-image: white !important;
        padding: ${sheshaStyles.paddingLG}px;
    
        .query-builder-container {
            padding: unset !important;
    
            .query-builder {
                margin: ${sheshaStyles.paddingLG}px 0 ${sheshaStyles.paddingLG}px * 2 0 !important;
            }
    
            .ant-btn-group {
                button {
                    margin-left: ${sheshaStyles.paddingSM}px;
                }
            }
        }
    
        .${shaQueryBuilderBtns} {
            display: flex;
            justify-content: flex-end;
    
            button {
                margin-left: ${sheshaStyles.paddingLG}px;
            }
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
    `);

    return {
        shaQueryBuilder,
        shaQueryBuilderBtns,
    };
});