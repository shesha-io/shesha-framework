import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css, cx, prefixCls}) => {
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
               color: #fff;
               font-size: 12px;
               font-weight: 400;
               flex: 1;
               transform: skew(45deg);
               max-width: 230px;
               white-space: nowrap;
               overflow: hidden;
               text-overflow: ellipsis;
               margin: 0px;
               padding: 0px;
               text-shadow: 0px 0px 2px #000;
           }
           background: rgba(16, 35, 158, .8);
           border: none;
           position: absolute;
           left: -22px;
           transition: .2s;
           display: flex;
           padding: 4px;
           padding-left: 30px;
           padding-right: 20px;
           flex-direction: row;
           justify-content: space-between;
           z-index: 3;
           position: relative;
           height: 31px;
           transform: skew(-45deg);
           border-bottom-right-radius: 15px;
           width: auto;
       `);
   
    const shaIconBackground = cx("sha-icon-background", css`
        width: 22px;
        height: 22px;
        borderRadius: 5px;
        position: absolute;
        width: 100%;
        text-align: center;
        top: 0px;
        left: 0px;
    }`
    );

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
        shaEditModeContainer,
        shaIconBackground
    };
});