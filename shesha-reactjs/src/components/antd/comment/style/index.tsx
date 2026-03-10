import * as React from 'react';
import type { CSSInterpolation } from '@ant-design/cssinjs';
import { useStyleRegister } from '@ant-design/cssinjs';
import { theme as antdTheme, ConfigProvider } from 'antd';
import type { GlobalToken } from 'antd/lib/theme/interface';
import { resetComponent } from 'antd/lib/style';

interface MergedToken extends GlobalToken {
  componentCls: string;
}

// ============================== Export ==============================
const genSharedButtonStyle = (token: MergedToken): CSSInterpolation => {
  const {
    componentCls,
    colorBgContainer,
    fontSize,
    fontSizeSM,
    padding,
    paddingXS,
    marginSM,
    marginXXS,
    controlHeight,
    lineHeightSM,
    colorText,
    colorTextSecondary,
    colorTextTertiary,
    motionDurationSlow,
  } = token;

  return {
    [componentCls]: {
      ...resetComponent(token) as any,

      position: 'relative',
      backgroundColor: colorBgContainer,

      [`${componentCls}-inner`]: {
        display: 'flex',
        paddingBlock: padding,
      },

      [`${componentCls}-avatar`]: {
        position: 'relative',
        flexShrink: 0,
        marginInlineEnd: marginSM,
        cursor: 'pointer',

        img: {
          width: controlHeight,
          height: controlHeight,
          borderRadius: '50%',
        },
      },

      [`${componentCls}-content`]: {
        "position": 'relative',
        "flex": 'auto',
        "minWidth": 0,
        "wordWrap": 'break-word',

        '&-author': {
          "display": 'flex',
          "flexWrap": 'wrap',
          "justifyContent": 'flex-start',
          "marginBottom": marginXXS,

          '& > a, & > span': {
            paddingInlineEnd: paddingXS,
            fontSize: fontSizeSM,
            lineHeight: lineHeightSM,
          },

          '&-name': {
            "color": colorTextSecondary,
            fontSize,
            "transition": `color ${motionDurationSlow}`,

            '> *': {
              "color": colorTextSecondary,
              '&:hover': {
                color: colorTextSecondary,
              },
            },
          },
          '&-time': {
            color: colorTextTertiary,
            whiteSpace: 'nowrap',
            cursor: 'auto',
          },
        },
        '&-detail p': {
          whiteSpace: 'pre-wrap',
          marginBlock: 0,
        },
      },

      [`${componentCls}-actions`]: {
        "marginTop": marginSM,
        "marginBottom": 0,
        "paddingInlineStart": 0,

        '> li': {
          "display": 'inline-block',
          "color": colorTextSecondary,

          '> span': {
            "marginInlineEnd": marginSM,
            "color": colorTextSecondary,
            "fontSize": fontSizeSM,
            "cursor": 'pointer',
            "transition": `color ${motionDurationSlow}`,
            "userSelect": 'none',

            '&:hover': {
              color: colorText,
            },
          },
        },
      },

      [`${componentCls}-nested`]: {
        marginInlineStart: 44,
      },
    },
  };
};

export default function useStyle(
  prefixCls: string,
): [(node: React.ReactNode) => React.ReactElement, string] {
  const { theme, token, hashId } = antdTheme.useToken();
  const { iconPrefixCls } = React.useContext(ConfigProvider.ConfigContext) ?? {};

  return [
    useStyleRegister(
      { theme, token, hashId, path: ['compatible', 'Comment', prefixCls, iconPrefixCls] },
      () => {
        const mergedToken = {
          componentCls: `.${prefixCls}`,
          ...token,
        };
        return [genSharedButtonStyle(mergedToken)];
      },
    ),
    hashId,
  ];
}
