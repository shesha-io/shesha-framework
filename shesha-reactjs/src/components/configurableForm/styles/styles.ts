import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css, cx, prefixCls, token }) => {
    // .sha-components-container-inner
    const shaComponentsContainerInner = "sha-components-container-inner";
    // .sha-components-container
    const shaComponentsContainer = cx("sha-components-container"); 

    const shaForm = cx("sha-form", css`
        .${shaComponentsContainer} {
            min-height: 28px;
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
          margin-left: 10px;
          color: #fff;
          font-weight: 400;
        }
        background: #10239e;
        border: none;
        min-width: 300px;
        width: 350px;
        height: 32px;
        border-radius: 0px;
        position: absolute;
        left: -2px;
        transition: .2s;
    `);

    const shaCurvedEnd = cx("sha-curved-end", css`
        height: 32px;
        width: 30px;
        background-color: #10239e;
        transform: skew(-30deg);
        position: absolute;
        left: 340px;
        top: 0px;
        border-bottom-right-radius: 7px;
`   );

    const shaEditModeContainer = cx("sha-edit-mode-container", css`
        transition: .1s,
        borderRadius: 5px,
        overflow: hidden,
    `);

    return {
        shaForm,
        shaComponentsContainer,
        shaComponentsContainerInner,
        shaFormInfoCard,
        shaFormInfoCardTitle,
        shaCurvedEnd,
        shaEditModeContainer
    };
});