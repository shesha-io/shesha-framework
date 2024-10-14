import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, token, prefixCls }) => {
  const extraMargin = "28px";

  const noContentPadding = "no-content-padding";
  const hideWhenEmpty = "hide-empty";

  const shaCollapsiblePanel = cx("sha-collapsible-panel", css`
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
    
      &:not(.${prefixCls}-collapse-ghost) {
        > .${prefixCls}-collapse-item {
          > .${prefixCls}-collapse-header {
            border-left: 3px solid ${token.colorPrimary};
            border-top-left-radius: ${token.borderRadiusLG}px;
            border-top-right-radius: ${token.borderRadiusLG}px;
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
            background-color: #f0f0f0;
            height: 45px;
            margin:'auto 0px';
          }
        }
      }
    
      &.${prefixCls}-collapse-ghost {
        > .${prefixCls}-collapse-item {
          > .${prefixCls}-collapse-header {
            padding: 4px 0px;
            border-bottom: 2px solid ${token.colorPrimary};
            border-bottom-left-radius: unset;
            border-bottom-right-radius: unset;
          }
          > .${prefixCls}-collapse-content {
            > .${prefixCls}-collapse-content-box {
              padding: 5px 0;
            }
          }
        }
      }
    
      .${prefixCls}-collapse-item {
        &.${prefixCls}-collapse-item-active {
        }
    
        .${prefixCls}-collapse-header {
          min-height: 25px;
          font-size: 15px;
          font-weight: 500;
          position: relative;
          display: flex;
          justify-content: space-between;
          align-items: center;
          .${prefixCls}-collapse-extra {
            float: unset;
          }
    
          .${prefixCls}-collapse-header-text {
            flex-grow: 1;
            margin: auto 0;
            margin-left: -5px;
          }
        }
    
        .${prefixCls}-collapse-content {
          border-top: unset;
          background: white;
    
          &.${noContentPadding} {
            padding: unset;
          }
    
          &.${prefixCls}-collapse-content-active {
          }
        }
      }
    
      .${prefixCls}-collapse-header-text {
        font-size: 14px;
        min-height: 30px;
        line-height: 2;
      }
    
      .${prefixCls}-blend-btn {
        border: none;
        height: 24px;
      }
    
      .${prefixCls}-collapse-arrow {
        padding-top: 3px !important;
        margin-top: -3px !important;
      }    
    `);

  return {
    shaCollapsiblePanel,
    noContentPadding,
    hideWhenEmpty,
  };
});