import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, token, prefixCls }, { headerStyles, panelHeadType, bodyStyle, hideCollapseContent }) => {
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
    borderRadius,
    marginBottom,
    marginTop,
    marginLeft,
    marginRight,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
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
    ...headerRest
  } = headerStyles;

  const borderTopLeftRadius = borderRadius?.split(' ')[0] || 0;
  const borderTopRightRadius = borderRadius?.split(' ')[1] || 0;
  const borderBottomLeftRadius = borderRadius?.split(' ')[2] || 0;
  const borderBottomRightRadius = borderRadius?.split(' ')[3] || 0;

  const borderTopLeftRadiusHeader = headerBorderRadius?.split(' ')[0] || 0;
  const borderTopRightRadiusHeader = headerBorderRadius?.split(' ')[1] || 0;
  const borderBottomLeftRadiusHeader = headerBorderRadius?.split(' ')[2] || 0;
  const borderBottomRightRadiusHeader = headerBorderRadius?.split(' ')[3] || 0;

  const shaCollapsiblePanel = cx("ant-collapse-component", css`
         &.${hideWhenEmpty}:not(:has(.${prefixCls}-collapse-content .${prefixCls}-form-item:not(.${prefixCls}-form-item-hidden))) {
        display: none;
      }
      --primary-color: ${token.colorPrimary};
      --ant-collapse-content-padding: ${paddingTop} ${paddingRight} ${paddingBottom} ${paddingLeft};
      width: ${width};
      min-width: ${minWidth};
      max-width: ${maxWidth};
      height: max-content;
      min-height: ${minHeight};
      max-height: ${maxHeight};
      border-radius: ${borderTopLeftRadiusHeader} ${borderTopRightRadiusHeader} ${borderBottomLeftRadius} ${borderBottomRightRadius} !important;
      margin-bottom: ${marginBottom};
      margin-top: ${marginTop};
      margin-left: ${marginLeft};
      margin-right: ${marginRight};

    .ant-collapse-item {
      display: flex;
      flex-direction: column;
      box-shadow: ${boxShadow};
      ${rest}
    }
      
    .ant-collapse-content-box {
      width: ${width};
      min-width: ${minWidth};
      max-width: ${maxWidth};
      height: ${height};
      min-height: ${minHeight};
      max-height: ${maxHeight};
      background: ${backgroundImage || backgroundColor};
      position: relative;
      padding-top: ${paddingTop} !important;
      padding-bottom: ${paddingBottom} !important;
      padding-left: ${paddingLeft} !important;
      padding-right: ${paddingRight} !important;
      border-radius : ${borderTopLeftRadius} ${borderTopRightRadius} ${borderBottomLeftRadius} ${borderBottomRightRadius} !important;
      border-top: ${borderTopWidth || borderWidth} ${borderTopStyle || borderStyle} ${borderTopColor || borderColor};
      border-right: ${borderRightWidth || borderWidth} ${borderRightStyle || borderStyle} ${borderRightColor || borderColor};
      border-left: ${borderLeftWidth || borderWidth} ${borderLeftStyle || borderStyle} ${borderLeftColor || borderColor};
      border-bottom: ${borderBottomWidth || borderWidth} ${borderBottomStyle || borderStyle} ${borderBottomColor || borderColor};
    }

    .ant-collapse-header {
        position: relative;
        visibility: ${hideCollapseContent ? 'hidden' : 'visible'};
        border-radius : ${borderTopLeftRadiusHeader} ${borderTopRightRadiusHeader} ${borderBottomLeftRadiusHeader} ${borderBottomRightRadiusHeader} !important;
        background: ${headerBgImage || headerBgColor};
        height: ${headerHeight};
        min-height: ${headerMinHeight};
        max-height: ${headerMaxHeight};
        border-top: ${headerBorderTopWidth || headerBorderWidth} ${headerBorderTopStyle || headerBorderStyle} ${headerBorderTopColor || headerBorderColor};
        border-right: ${headerBorderRightWidth || headerBorderWidth} ${headerBorderRightStyle || headerBorderStyle} ${headerBorderRightColor || headerBorderColor};
        border-left: ${headerBorderLeftWidth || headerBorderWidth} ${headerBorderLeftStyle || headerBorderStyle} ${headerBorderLeftColor || headerBorderColor};
        border-bottom: ${headerBorderBottomWidth || headerBorderWidth} ${headerBorderBottomStyle || headerBorderStyle} ${headerBorderBottomColor || headerBorderColor};
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
      }

    }

    `);

  return {
    shaCollapsiblePanel,
    noContentPadding,
    hideWhenEmpty,
  };
});