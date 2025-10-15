import { createStyles, sheshaStyles } from '@/styles';

import qb_compact_styles from './css/compact_styles.css';

export const useStyles = createStyles(({ css, cx, prefixCls }) => {
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
