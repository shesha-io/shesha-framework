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
               font-weight: 400;
               flex: 1;
               transform: skew(45deg);
               max-width: 230px;
               white-space: nowrap;
               overflow: hidden;
               text-overflow: ellipsis;
           }
           background: #10239e;
           border: none;
           border-right: 20px #10239e solid;
           position: absolute;
           left: -22px;
           transition: .2s;
           display: flex;
           padding: 4px;
           padding-left: 30px;
           flex-direction: row;
           justify-content: space-between;
           z-index: 3;
           position: relative;
           height: 32px;
           transform: skew(-45deg);
           border-bottom-right-radius: 15px;
           width: auto;
       `);
   
       const shaCurvedEnd = cx("sha-curved-end", css`
           height: 32px;
           width: 60px;
           background-color: #10239e;
           transform: skew(-30deg);
           position: absolute;
           left: 335px;
           top: 0px;
           border-bottom-right-radius: 7px;
           z-index: 2;
           & > :last-child {
               margin-top: 10px;
               transform: skew(30deg);
           }
   `   );

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
        shaCurvedEnd,
        shaEditModeContainer,
        shaIconBackground
    };
});