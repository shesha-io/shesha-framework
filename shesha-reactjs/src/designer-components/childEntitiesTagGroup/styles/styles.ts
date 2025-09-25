import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, prefixCls }) => {
  const childEntityTagBtnWidth = "45px";

  const childEntityTagAdd = "child-entity-tag-add";
  const childEntityTagFullWidth = "child-entity-tag-full-width";
  const globalTablefilter = "global-tablefilter";
  const childEntityTagContainer = cx("child-entity-tag-container", css`
        width: 100%;
      
        .${prefixCls}-tag,
        .${prefixCls}-tag a,
        .${prefixCls}-tag a:hover {
          text-wrap: wrap;
          width: 100%;
        }
      
        .${prefixCls}-input-group {
          .${prefixCls}-select {
            width: calc(100% - ${childEntityTagBtnWidth});
          }
      
          .${childEntityTagAdd} {
            width: ${childEntityTagBtnWidth};
          }
        }
      
        .${childEntityTagFullWidth} {
          .${prefixCls}-select {
            width: 100%;
          }
        }
      
        .${globalTablefilter} {
          padding-right: unset !important;
        }
    `);
  return {
    childEntityTagContainer,
    childEntityTagAdd,
    childEntityTagFullWidth,
    globalTablefilter,
  };
});
