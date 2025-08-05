import { createStyles } from '@/styles';
import { sheshaStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, token, iconPrefixCls }) => {
    const shaIconPickerSelectedIcon = "sha-icon-picker-selected-icon";
    const shaIconPickerParent = "sha-icon-pciker-parent";
    const shaIconPicker = cx("sha-icon-picker", css`
        .${shaIconPickerSelectedIcon} {
            &:not(.sha-readonly) {
                cursor: pointer;
            }
    
            .${iconPrefixCls} {
                margin-right: ${sheshaStyles.paddingLG}px;
            }

            .ant-btn {
                background: transparent;
                &:hover {
                    background: transparent;
                }
            }
        }
    `);
    const shaIconPickerSearch = "sha-icon-picker-search";
    const shaIconPickerSearchInputContainer = "sha-icon-picker-search-input-container";
    const shaIconPickerIconList = "sha-icon-picker-icon-list";
    const shaIconPickerIconListGroup = "sha-icon-picker-icon-list-group";
    const shaIconPickerIconListGroupHeader = "sha-icon-picker-icon-list-group-header";
    const shaIconPickerIconListGroupBody = "sha-icon-picker-icon-list-group-body";
    const shaIconPickerIconListIcon = "sha-icon-picker-icon-list-icon";
    const shaIconPickerIconListIconName = "sha-icon-picker-icon-list-icon-name";

    const shaIconPickerModal = cx("sha-icon-picker-modal", css`
        .${shaIconPickerSearch} {
            display: flex;
            margin-bottom: ${sheshaStyles.paddingLG}px;
    
            .${shaIconPickerSearchInputContainer} {
                margin-left: ${sheshaStyles.paddingLG}px;
                flex: 1;
            }
        }

        .${shaIconPickerParent} {
            box-sizing: 'border-box', 
            z-index: 2,
            display: 'flex',
            justify-content: 'center',
            align-items: 'center',
            transition: '.3s',
        }
    
        .${shaIconPickerIconList} {
            max-height: 600px;
            overflow-y: auto;
    
            .${shaIconPickerIconListGroup} {
                .${shaIconPickerIconListGroupHeader} {
                    font-size: 16px;
                    font-weight: 500;
                    margin: ${sheshaStyles.paddingLG}px 0;
                }
    
                .${shaIconPickerIconListGroupBody} {
                    display: grid;
                    grid-template-columns: auto auto auto auto;
    
                    .${shaIconPickerIconListIcon} {
                        &:hover {
                        background: ${token.colorPrimaryBgHover};
                        border-radius: 4px;
    
                        .${iconPrefixCls},
                        .${shaIconPickerIconListIconName} {
                            transform: scale(1.25);
                        }
                    }
    
                    padding: 12px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    cursor: pointer;
    
                    .${iconPrefixCls} {}
    
                    .${shaIconPickerIconListIconName} {
                        margin-top: 12px;
                    }
                }
            }
        }
      }    
    `);
    

    return {
        shaIconPicker,
        shaIconPickerSelectedIcon,
        shaIconPickerModal,
        shaIconPickerSearch,
        shaIconPickerSearchInputContainer,
        shaIconPickerIconList,
        shaIconPickerIconListGroup,
        shaIconPickerIconListGroupHeader,
        shaIconPickerIconListGroupBody,
        shaIconPickerIconListIcon,
        shaIconPickerIconListIconName,
        shaIconPickerParent
    };
});