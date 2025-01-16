import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, token, prefixCls }, { bodyStyle, headerStyle }) => {
  const extraMargin = "28px";

  const noContentPadding = "no-content-padding";
  const hideWhenEmpty = "hide-empty";

  const shaCollapsiblePanel = cx("", css`
      &.${hideWhenEmpty}:not(:has(.${prefixCls}-collapse-content .${prefixCls}-form-item:not(.${prefixCls}-form-item-hidden))) {
        display: none;
      }

      &.${prefixCls}-collapse-icon-position-left {
        .${prefixCls}-collapse-header-text {
          margin-left: ${extraMargin};
        }
      }
    
      &.${prefixCls}-collapse-icon-position-right {
        .${prefixCls}-collapse-extra {
          margin-right: ${extraMargin};
        }
      }
    
      &.${noContentPadding} {
        .${prefixCls}-collapse-content-box {
          padding: unset;
          padding-top: 16px;
        }
      }
    
      &.ant-collapse-item {
          width: ${bodyStyle?.width} !important;
          min-width: ${bodyStyle?.minWidth};
          max-width: ${bodyStyle?.maxWidth};
          height: ${bodyStyle?.height};
          min-height: ${bodyStyle?.minHeight};
          max-height: ${bodyStyle?.maxHeight};
          margin-bottom: ${bodyStyle?.marginBottom};
          margin-top: ${bodyStyle?.marginTop};
          margin-left: ${bodyStyle?.marginLeft};
          margin-right: ${bodyStyle?.marginRight};
          border-radius: ${bodyStyle.borderRadius};
          border: ${bodyStyle.border};

          > .ant-collapse-header {
            border-top-left-radius: ${bodyStyle.borderTopLeftRadius ?? token.borderRadiusLG}px;
            border-top-right-radius: ${bodyStyle.borderTopRightRadius ?? token.borderRadiusLG}px;
            background-color: #f0f0f0;
            margin:'auto 0px';
            min-height: 50px;
            height: auto;
            width: auto;
            padding: 0;
            padding-left:10px;
            padding-top:5px;
          }
        }


    `);

  return {
    shaCollapsiblePanel,
    noContentPadding,
    hideWhenEmpty,
  };
});