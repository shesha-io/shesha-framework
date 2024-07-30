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
        >.${(p) => p.theme.prefixCls}-card-body {
          padding: unset !important;  
        }
    .${formClassNames.shaFormInfoCard} {
        .${formClassNames.shaFormInfoCardTitle} {
          margin-left: 10px;
        }
    }
`;
