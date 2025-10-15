import { createStyles, sheshaStyles } from '@/styles';


export const useStyles = createStyles(({ css, cx, token }) => {
  const toolbarItem = "toolbar-item";
  const shaActionBtnGroup = cx("sha-action-btn-group", css`
        button.${toolbarItem} {
            padding-left: 10px !important;
        
            &:last-child {
                padding-left: ${sheshaStyles.paddingSM}px;
            }
        
            ::before & {
                content: '|';
                padding-left: ${sheshaStyles.paddingSM}px;
                color: lightgrey;
            }
        
            &:not(.disabled) {
                &:hover {
                    border-radius: 5px;
                    color: ${token.colorPrimary};
                    background-color: ${token.colorPrimaryBgHover};
                }                
            }
        
            :first-child {
                ::before & {
                    content: unset;
                }
            }
        }
  `);
  return {
    shaActionBtnGroup,
    toolbarItem,
  };
});
