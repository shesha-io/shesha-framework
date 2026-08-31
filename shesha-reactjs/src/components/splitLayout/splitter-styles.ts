import { createStyles } from "antd-style";

export const useSplitterStyles = createStyles(({ token, css }) => {
  const splitterSize = '5px';
  const color = token.colorBgLayout;
  const hoverColor = token.colorPrimaryHover;
  const activeColor = token.colorPrimary;

  return {
    vscodeDragger: css`
    &.ant-splitter-vertical {
      >.ant-splitter-bar {
        .ant-splitter-bar-dragger:not(.ant-splitter-bar-dragger-disabled) {
          height: ${splitterSize};
          width: 100%;
        }
      }
    }
    &.ant-splitter-horizontal {
      >.ant-splitter-bar {
        .ant-splitter-bar-dragger:not(.ant-splitter-bar-dragger-disabled) {
          width: ${splitterSize};
        }
      }
    }  
    .ant-splitter-bar {
      .ant-splitter-bar-dragger:not(.ant-splitter-bar-dragger-disabled) {
        background: ${color};
        transition: all 0.2s;
        &.ant-splitter-bar-dragger-active {
          background: ${activeColor} !important;
          ::before {
            background: ${activeColor} !important;
          }
        }
      }

      &:hover {
        >.ant-splitter-bar-dragger:not(.ant-splitter-bar-dragger-disabled) {
          border-radius: 2px;
          background: ${hoverColor};
          ::before {
            background: ${hoverColor} !important;
          }
        }
      }
    }
  `,
  };
});
