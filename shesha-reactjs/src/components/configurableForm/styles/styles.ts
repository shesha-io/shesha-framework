import { createGlobalStyle } from 'antd-style';

const formClassNames = {
    shaForm: 'sha-form',
    shaComponentsContainer: 'sha-components-container',
    shaComponentsContainerInner: 'sha-components-container-inner',
    shaFormInfoCard: 'sha-form-info-card',
    shaFormInfoCardTitle: 'sha-form-info-card-title',
    shaError: 'sha-error',
};

const hookResponse = {
    styles: formClassNames,
};

export const useStyles = () => {
    return hookResponse;
};

export const ShaFormStyles = createGlobalStyle`
    .${formClassNames.shaForm} {
        .${formClassNames.shaComponentsContainer} {
            min-height: 32px;
            &.horizontal {
                .${formClassNames.shaComponentsContainerInner} {
                    display: flex;
                    flex-wrap: wrap;

                    &.ant-form-item {
                        margin-bottom: unset;
                    }
                }
            }            
            .${formClassNames.shaError} {
                background: none;
                border: none;
                padding: 0;

                .${(p) => p.theme.prefixCls}-alert-message {
                    color: #dc3545;
                    font-family: "Roboto", sans-serif;
                    font-size: 15px;
                    text-align: center;
                }

                .${(p) => p.theme.prefixCls}icon {
                    display: none;
                }
            }
        }
    }

    .${formClassNames.shaFormInfoCard} {       
        display: flex;
        align-items: center;
        justify-content: space-between;
        z-index: 2;
        position: absolute;
        transition: 0.3s;
        height: 27px;
        background: rgba(0, 0, 255, 0.75);
        max-width: 100%;
        width: auto;
        padding: 0 10px 0 20px;
        margin-left: -12px;
        border-bottom-right-radius: 20px;
        transform: skew(-30deg);

        >.${(p) => p.theme.prefixCls}-card-body {
            padding: unset !important; 
        }
        .${formClassNames.shaFormInfoCardTitle} {
            margin-left: 10px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            flex-grow: 1;
            color: #fff;
            font-size: 12px;
            text-shadow: 0px 0px 2px rgba(0, 0, 0, 0.45);
        }
    }
`;
