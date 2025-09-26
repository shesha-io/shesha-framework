import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, prefixCls, token }) => {
  const sider = "sha-code-editor-sider";
  const menu = "sha-code-editor-menu";
  const workspace = "sha-code-editor-workspace";
  const workspaceSplit = "sha-code-editor-workspace-split";
  const code = "sha-code-editor-code";
  const tree = "sha-code-editor-tree";

  const background = "#2e3138";

  const codeEditor = cx("sha-code-editor", css`
        position: relative;
        flex-grow: 1;
        display: flex;
        min-height: 400px;
        
        .${sider} {
            display: flex;
            flex-direction: column;
            
            overflow-x: hidden;
            overflow-y:auto;
            overscroll-behavior: contain;
            scrollbar-width: thin;
          
            background-color: ${background};
            width: 50px;
            height:100%;

            .${prefixCls}-btn {
                &:hover {
                    color: #f0f0f0 !important;
                }
                &.active {
                    color: #f0f0f0 !important;
                }
                &.inactive {
                    color: #828388 !important;
                }
            }
        }

        .${workspace} {
            position: absolute;
            top:0;
            bottom:0;
            right:0px;
            left: 50px;
            border: 1px solid gray;
            overscroll-behavior: contain;
            scrollbar-width: thin;
            .${tree} {
                min-width: 100px;
                background-color: ${background};
                overflow-y: auto;
                scrollbar-width: thin;
                
                .${prefixCls}-tree {
                    background-color: transparent;
                    border-radius: 0px;
                    color: ${token.colorTextLightSolid};
                }
                .${prefixCls}-tree-indent-unit {
                    width: 12px;
                }
                .${prefixCls}-tree-switcher {
                    width: 12px;
                }
                .${prefixCls}-tree-iconEle {
                    svg {
                        width: 18px;
                        height: 18px;
                        padding: 3px;
                    }
                }
            }
            .${code} {
                min-width: 100px;                
                height: 100%;
            }
            .${workspaceSplit} {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: row;
                -webkit-box-sizing: border-box;
                -moz-box-sizing: border-box;
                box-sizing: border-box;

                .gutter {
                    background-color: ${background};
                }
            }
        }
  `);
  return {
    codeEditor,
    sider,
    menu,
    workspace,
    workspaceSplit,
    code,
    tree,
  };
});
