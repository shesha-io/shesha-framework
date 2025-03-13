import { addPx } from '@/components/sectionSeparator/utils';
import { createStyles } from '@/styles';
import { CSSProperties } from 'react';

export const useStyles = createStyles(({ css, cx, token, prefixCls }, {
  headerStyle = {} as CSSProperties,
  panelHeadType,
  bodyStyle = {} as CSSProperties,
  hideCollapseContent,
  isSimpleDesign,
  ghost
}) => {
  const noContentPadding = "no-content-padding";
  const hideWhenEmpty = "hide-empty";

  const {
    borderWidth,
    borderStyle,
    borderColor,
    borderTopWidth,
    borderTopStyle,
    borderTopColor,
    borderBottomWidth,
    borderBottomStyle,
    borderBottomColor,
    borderRightWidth,
    borderRightStyle,
    borderRightColor,
    borderLeftWidth,
    borderLeftStyle,
    borderLeftColor,
    backgroundColor,
    backgroundImage,
    boxShadow,
    width,
    height,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    borderRadius = '8px 8px 8px 8px',
    marginBottom,
    marginTop,
    marginLeft,
    marginRight,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    overflow,
    border,
    ...rest
  } = bodyStyle;

  const {
    backgroundImage: headerBgImage,
    backgroundColor: headerBgColor,
    height: headerHeight,
    minHeight: headerMinHeight,
    maxHeight: headerMaxHeight,
    color: headerColor = token.colorTextLabel,
    fontFamily,
    textAlign,
    fontSize,
    fontWeight,
    borderWidth: headerBorderWidth,
    borderStyle: headerBorderStyle,
    borderColor: headerBorderColor,
    borderTopWidth: headerBorderTopWidth = panelHeadType === 'parent' ? '3px' : '',
    borderTopStyle: headerBorderTopStyle,
    borderTopColor: headerBorderTopColor = panelHeadType === 'parent' ? token.colorPrimary : '',
    borderBottomWidth: headerBorderBottomWidth,
    borderBottomStyle: headerBorderBottomStyle,
    borderBottomColor: headerBorderBottomColor,
    borderRightWidth: headerBorderRightWidth,
    borderRightStyle: headerBorderRightStyle,
    borderRightColor: headerBorderRightColor,
    borderLeftWidth: headerBorderLeftWidth = panelHeadType === 'child' ? '3px' : '',
    borderLeftStyle: headerBorderLeftStyle,
    borderLeftColor: headerBorderLeftColor = panelHeadType === 'child' ? token.colorPrimary : '',
    borderRadius: headerBorderRadius,
    paddingBottom: headerPaddingBottom = '8px',
    paddingTop: headerPaddingTop = '8px',
    paddingLeft: headerPaddingLeft = '8px',
    paddingRight: headerPaddingRight = '8px',
    overflow: headerOverflow,
    ...headerRest
  } = headerStyle;

  const initialValue = isSimpleDesign || ghost ? 0 : 8;
  const hasBorder = borderWidth || borderTopWidth || borderBottomWidth || borderLeftWidth || borderRightWidth;
  const borderTopLeftRadius = addPx(borderRadius)?.split(' ')[0] || initialValue;
  const borderTopRightRadius = addPx(borderRadius)?.split(' ')[1] || initialValue;
  const borderBottomLeftRadius = addPx(borderRadius)?.split(' ')[2] || initialValue;
  const borderBottomRightRadius = addPx(borderRadius)?.split(' ')[3] || initialValue;

  const shaCollapsiblePanel = cx("ant-collapse-component", css`
         &.${hideWhenEmpty}:not(:has(.${prefixCls}-collapse-content .${prefixCls}-form-item:not(.${prefixCls}-form-item-hidden))) {
        display: none;
      }
        
      ${(!isSimpleDesign && hasBorder) && '--ant-line-width: 0px !important;'};
      --primary-color: ${token.colorPrimary};
      --ant-collapse-content-padding: ${paddingTop || 16}px ${paddingRight || 16}px ${paddingBottom || 16}px ${paddingLeft || 16}px !important;
      width: ${width};
      min-width: ${minWidth};
      max-width: ${maxWidth};
      height: max-content;
      min-height: ${minHeight};
      max-height: ${maxHeight};
      border-radius: ${borderTopLeftRadius} ${borderTopRightRadius} ${borderBottomLeftRadius} ${borderBottomRightRadius} !important;
      margin-bottom: ${marginBottom};
      margin-top: ${marginTop};
      margin-left: ${marginLeft};
      margin-right: ${marginRight};

    .ant-collapse-item {
      display: flex;
      flex-direction: column;
      box-shadow: ${boxShadow};
      border-radius: ${borderTopLeftRadius} ${borderTopRightRadius} ${borderBottomLeftRadius} ${borderBottomRightRadius} !important;
    }
    
    .ant-collapse-content-box {
      ${rest}
      width: ${width};
      min-width: ${minWidth};
      max-width: ${maxWidth};
      height: ${height};
      min-height: ${minHeight};
      max-height: ${maxHeight};
      background: ${backgroundImage || backgroundColor};
      position: relative;
      overflow: ${overflow ?? 'auto'};
      padding-top: ${paddingTop} !important;
      padding-bottom: ${paddingBottom} !important;
      padding-left: ${paddingLeft} !important;
      padding-right: ${paddingRight} !important;
      border-radius : 0 0 ${borderBottomLeftRadius} ${borderBottomRightRadius} !important;
      border-top: ${borderTopWidth || borderWidth} ${borderTopStyle || borderStyle} ${borderTopColor || borderColor};
      border-right: ${borderRightWidth || borderWidth} ${borderRightStyle || borderStyle} ${borderRightColor || borderColor};
      border-left: ${borderLeftWidth || borderWidth} ${borderLeftStyle || borderStyle} ${borderLeftColor || borderColor};
      border-bottom: ${borderBottomWidth || borderWidth} ${borderBottomStyle || borderStyle} ${borderBottomColor || borderColor};
  }

    .ant-collapse-header[aria-expanded="false"] {
      border-radius: ${isSimpleDesign || ghost ? 0 : borderTopLeftRadius} ${isSimpleDesign || ghost ? 0 : borderTopRightRadius} ${isSimpleDesign || ghost ? 0 : borderBottomRightRadius} ${isSimpleDesign || ghost ? 0 : borderBottomLeftRadius} !important;
    }

    .ant-collapse-header[aria-expanded="true"] {
      border-radius : ${isSimpleDesign || ghost ? 0 : borderTopLeftRadius} ${isSimpleDesign || ghost ? 0 : borderTopRightRadius} 0 0 !important;
    }

    .ant-collapse-header {
        ${headerRest}
        position: relative;
        visibility: ${hideCollapseContent ? 'hidden' : 'visible'};
        background: ${headerBgImage || headerBgColor};
        height: ${headerHeight};
        min-height: ${headerMinHeight};
        max-height: ${headerMaxHeight};
        border-top: ${headerBorderTopWidth || headerBorderWidth} ${headerBorderTopStyle || headerBorderStyle} ${headerBorderTopColor || headerBorderColor};
        border-right: ${headerBorderRightWidth || headerBorderWidth} ${headerBorderRightStyle || headerBorderStyle} ${headerBorderRightColor || headerBorderColor};
        border-left: ${headerBorderLeftWidth || headerBorderWidth} ${headerBorderLeftStyle || headerBorderStyle} ${headerBorderLeftColor || headerBorderColor};
        border-bottom: ${headerBorderBottomWidth || headerBorderWidth} ${headerBorderBottomStyle || headerBorderStyle} ${headerBorderBottomColor || headerBorderColor};
        padding-top: ${headerPaddingTop} !important;
        padding-right: ${headerPaddingRight} !important;
        padding-bottom: ${headerPaddingBottom} !important;
        padding-left: ${headerPaddingLeft} !important;
        ${headerRest}

      .ant-collapse-header-text {
        color: ${headerColor};
        font-family: ${fontFamily};
        text-align: ${textAlign};
        font-size: ${fontSize};
        font-weight: ${fontWeight};
        align-self: center;
      }

      .ant-collapse-extra {
        align-self: center;
      }

      .ant-collapse-expand-icon {
        align-self: center;
        margin-right: 8px;
      }
    }

    &.${prefixCls}-collapse-ghost {
        > .${prefixCls}-collapse-item {
          > .${prefixCls}-collapse-header {
           --ant-collapse-header-padding: 5px 0px !important;
            border-bottom: 2px solid ${token.colorPrimary};
            border-bottom-left-radius: unset;
            border-bottom-right-radius: unset;
            border-top: ${panelHeadType === 'parent' ? `${headerBorderTopWidth} solid var(--primary-color)` : 'none'};
            border-left: ${panelHeadType === 'child' ? `${headerBorderTopWidth} solid  var(--primary-color)` : 'none'};
            font-weight: ${fontWeight || 'bold'};
          }
          > .${prefixCls}-collapse-content {
            > .${prefixCls}-collapse-content-box {
              padding: 5px 0;
            }
          }
        }
      }

    `);

  const shaSimpleDesign = cx(css`
      &.${hideWhenEmpty}:not(:has(.${prefixCls}-collapse-content .${prefixCls}-form-item:not(.${prefixCls}-form-item-hidden))) {
          display: none;
      }

      width: ${width};
      min-width: ${minWidth};
      max-width: ${maxWidth};
      height: max-content;
      min-height: ${minHeight};
      max-height: ${maxHeight};
      margin-bottom: ${marginBottom};
      margin-top: ${marginTop};
      margin-left: ${marginLeft};
      margin-right: ${marginRight};


      .ant-collapse-header-text {
        color: ${headerColor};
        font-family: ${fontFamily};
        text-align: ${textAlign};
        font-size: ${fontSize};
        font-weight: ${fontWeight};
      };

      --primary-color: ${token.colorPrimary};
      &.${prefixCls}-collapse-ghost {
        > .${prefixCls}-collapse-item {
          > .${prefixCls}-collapse-header {
           --ant-collapse-header-padding: ${headerStyle?.padding || '12px 16px'} !important;
            padding: 12px 16px !important;
            border-top: ${panelHeadType === 'parent' ? `3px solid var(--primary-color)` : 'none'};
            border-left: ${panelHeadType === 'child' ? `3px solid  var(--primary-color)` : 'none'};
            font-size: ${panelHeadType === 'parent' ? '13px' : '16px'};
            font-weight: 'bold';
          }
        }
      }

      .${prefixCls}-collapse-content-box {
        padding: 5px 0;
        width: ${width};
        min-width: ${minWidth};
        max-width: ${maxWidth};
        height: max-content;
        min-height: ${minHeight};
        max-height: ${maxHeight};
        overflow: ${overflow ?? 'auto'};
        padding-top: ${paddingTop} !important;
        padding-bottom: ${paddingBottom} !important;
        padding-left: ${paddingLeft} !important;
        padding-right: ${paddingRight} !important;
      }

      .ant-collapse-header {
        border-top: ${panelHeadType === 'parent' ? `3px solid var(--primary-color)` : 'none'};
        border-left: ${panelHeadType === 'child' ? `3px solid  var(--primary-color)` : 'none'};
        font-size: ${panelHeadType === 'parent' ? '13px' : '16px'};
        height: ${headerHeight};
        min-height: ${headerMinHeight};
        max-height: ${headerMaxHeight}
        width: ${width};
        min-width: ${minWidth};
        max-width: ${maxWidth};
        `);

  return {
    shaCollapsiblePanel,
    noContentPadding,
    hideWhenEmpty,
    shaSimpleDesign
  };
});