import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css, cx, prefixCls }) => {
    // .sha-components-container-inner
    const shaComponentsContainerInner = "sha-components-container-inner";
    // .sha-components-container
    const shaComponentsContainer = cx("sha-components-container"); 

    const shaForm = cx("sha-form", css`
        .${shaComponentsContainer} {
            min-height: 32px;
            &.horizontal {
                .${shaComponentsContainerInner} {
                    display: flex;
                    flex-wrap: wrap;

                    &.ant-form-item {
                        margin-bottom: unset;
                    }
                }
            }
        }
    `);

    // .sha-form-info-card
    const shaFormInfoCardTitle = "sha-form-info-card-title";
    const shaFormInfoCard = cx("sha-form-info-card", css`
        >.${prefixCls}-card-body {
          padding: unset !important;  
        }
        .${shaFormInfoCardTitle} {
          margin-left: 10px;
        }
    `);
    
    return {
        shaForm,
        shaComponentsContainer,
        shaComponentsContainerInner,
        shaFormInfoCard,
        shaFormInfoCardTitle,
    };
});