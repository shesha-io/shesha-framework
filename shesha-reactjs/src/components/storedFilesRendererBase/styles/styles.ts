import { createStyles } from '@/styles';

export const useStyles = createStyles(({ token, css, cx, prefixCls }, { style, model, containerStyles, primaryColor }) => {
  const { background, backgroundImage, borderRadius: allRadius, borderWidth, borderTopWidth, width, minWidth, maxWidth,
    borderBottomWidth, borderLeftWidth, borderLeftColor, borderLeftStyle, borderRightColor, borderRightStyle, borderColor, borderTopStyle, borderTopColor,
    borderTop, boxShadow, borderBottom, borderBottomColor, borderBottomStyle, borderRight, borderRightWidth, backgroundColor, backgroundPosition,
    backgroundRepeat, backgroundSize, borderStyle, color, fontFamily, fontSize, fontWeight, height, maxHeight, minHeight, textAlign,
    borderTopRightRadius, borderBottomRightRadius, borderBottomLeftRadius, borderTopLeftRadius,
    ...rest
  } = style;

  const { width: containerWidth, height: containerHeight,
    maxHeight: containerMaxHeight, maxWidth: containerMaxWidth, minHeight: containerMinHeight,
    minWidth: containerMinWidth, marginTop, marginLeft, marginRight, marginBottom, paddingTop,
    paddingLeft, paddingRight, paddingBottom, ...restContainerStyles } = containerStyles;

  const { gap, layout, hideFileName, isDragger } = model;

  const storedFilesRendererBtnContainer = "stored-files-renderer-btn-container";
  const storedFilesRendererNoFiles = "stored-files-renderer-no-files";

  const borderRadius = [
    borderTopRightRadius ?? allRadius ?? '8px',
    borderBottomRightRadius ?? allRadius ?? '8px',
    borderBottomLeftRadius ?? allRadius ?? '8px',
    borderTopLeftRadius ?? allRadius ?? '8px',
  ].join(' ');

  const antUploadDragIcon = `${prefixCls}-upload-drag-icon`;
  const shaStoredFilesRenderer = cx("sha-stored-files-renderer", css`
    --thumbnail-width: ${layout ? (width ?? '54px') : '100%'};
    --thumbnail-height: ${layout ? (height ?? '54px') : '100%'};
    --ant-margin-xs: ${gap ?? '8px'} !important;
    --ant-border-radius-xs: ${borderRadius ?? '8px'} !important;
    --ant-border-radius-sm: ${borderRadius ?? '8px'} !important;
    --ant-border-radius-lg: ${borderRadius ?? '8px'} !important;
    --container-width: ${containerWidth};
    --container-max-width: ${containerMaxWidth};
    --container-min-width: ${containerMinWidth};
    --container-min-height: ${containerMinHeight};
    --container-max-height: ${containerMaxHeight};
    --container-height: ${containerHeight};
    --ant-upload-actions-color: ${token.colorError} !important;
    --ant-button-content-font-size: ${fontSize ?? '14px'} !important;
    --ant-button-font-weight: ${fontWeight ?? '400'} !important;
    --ant-font-family: ${fontFamily ?? 'Segoe UI'} !important;
    --ant-button-font-weight: ${fontWeight ?? '400'} !important;
    margin-top: ${marginTop};
    margin-left: ${marginLeft};
    margin-right: ${marginRight};
    margin-bottom: ${marginBottom};
    padding-top: ${paddingTop ?? '2px'};
    padding-left: ${paddingLeft ?? '2px'};
    padding-right: ${paddingRight ?? '2px'};
    padding-bottom: ${paddingBottom ?? '2px'};
    ${restContainerStyles}
    width: var(--container-width) !important;
    max-width: var(--container-max-width) !important;;
    min-width: var(--container-min-width) !important;
    height: var(--container-height) !important;
    max-height: var(--container-max-height) !important;
    min-height: var(--container-min-height) !important;
    overflow: auto;
    scrollbar-width: thin;
      &::-webkit-scrollbar {
        width: 8px;
        background-color: transparent;
      }

    
    .ant-upload:not(.ant-upload-disabled) {
      .icon {
        color: ${primaryColor ?? token.colorPrimary} !important;
      };
    }
  
    .ant-upload-list-item {
      --ant-line-width: 0px !important;
      --ant-padding-xs: 0px !important;
      --font-size: ${fontSize ?? '14px'} !important;
      --ant-font-size: ${fontSize ?? '14px'} !important;
      display: flex;
      width: ${layout ? (width ?? '54px') + ' !important' : ''};
      height: ${layout ? (height ?? '54px') + ' !important' : ''};

      :before {
        top: 0;
        width: 100% !important;
        height: 100% !important;
        border-radius: ${borderRadius ?? '8px'} !important;
        ${rest}
      }
    }

    .ant-upload-list-item-thumbnail {
      background: ${backgroundImage ?? (backgroundColor ?? '#fff')} !important;
      border: ${borderWidth} ${borderStyle} ${borderColor};
      border-top: ${borderTopWidth ?? borderWidth} ${borderTopStyle ?? borderStyle} ${borderTopColor ?? borderColor};
      border-right: ${borderRightWidth ?? borderWidth} ${borderRightStyle ?? borderStyle} ${borderRightColor ?? borderColor};
      border-left: ${borderLeftWidth ?? borderWidth} ${borderLeftStyle ?? borderStyle} ${borderLeftColor ?? borderColor};
      border-bottom: ${borderBottomWidth ?? borderWidth} ${borderBottomStyle ?? borderStyle} ${borderBottomColor ?? borderColor};
      box-shadow: ${boxShadow};
      border-radius: ${borderRadius ?? '8px'} !important;
      ${rest}

      img {
        width: var(--thumbnail-width, 54px) !important;
        height: var(--thumbnail-height, 54px) !important;
        border-radius: ${borderRadius ?? '8px'} !important;
        object-fit: cover !important;
        display: flex !important;
        justify-content: center !important;
      }
      .ant-image .anticon {
        border-radius: ${borderRadius ?? '8px'} !important;
        display: block !important;
      }
    }

    .ant-upload-list-item-name {
      display: ${hideFileName ? 'none !important' : 'block'};
      color: ${color ?? token.colorPrimary};
      font-family: ${fontFamily ?? 'Segoe UI'};
      font-size: ${fontSize ?? '14px'};
      font-weight: ${fontWeight ?? '400'};
      text-align: ${textAlign ?? 'center'};
      padding: 0 8px !important;
      width: ${(layout && width) ?? '54px'} !important;
      font-size: var(--font-size, 14px) !important;
    }

    .ant-upload-list-text {
      height: calc(var(--container-height) - 32px) !important;
      max-height: calc(var(--container-max-height) - calc(${isDragger ? '0px' : fontSize} * 4)) !important;
      min-height: calc(var(--container-min-height) - 32px) !important;
      width: calc(var(--container-width) - 32px) !important;
      max-width: calc(var(--container-max-width) - 32px) !important;
      min-width: calc(var(--container-min-width) - 32px) !important;
    }

    .ant-upload-drag:hover:not(.ant-upload-disabled) {
      border-color: ${token.colorPrimary} !important;
    }

    .${prefixCls}-upload {
      ${(layout && !isDragger) && 'width: var(--thumbnail-width) !important;'};
      ${(layout && !isDragger) && 'height: var(--thumbnail-height) !important'};
      ${rest}
      align-items: center;

      &.${prefixCls}-upload-btn {
        .${prefixCls}-upload-drag-icon {
          margin: unset;
        }
  
        .${storedFilesRendererNoFiles} {
          margin-bottom: 6px;
        }

        .ant-upload-select {
          align-content: center;
        }
      }
    }
  
    .ant-btn {
      color: ${primaryColor ?? token.colorPrimary} !important;
      padding: 0;
      * {
        font-size: ${fontSize ?? '14px'} !important;
        font-weight: ${fontWeight ?? '400'} !important;
        font-family: ${fontFamily ?? 'Segoe UI'} !important;
      }
    }
    .${storedFilesRendererBtnContainer} {
      display: flex;
      margin-top: 4px;
      justify-content: flex-end;
    }
  
    .${prefixCls}-upload-list {
      --ant-margin-xs: ${gap ?? '8px'} !important;
      padding: 2px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      scrollbar-width: thin;
      &::-webkit-scrollbar {
        width: 8px;
        background-color: transparent;
      }
    }
      
    .ant-upload-list-item-uploading {
      display: none;
    }

    .ant-upload-list-item-container {
      display: inline-block !important;
      &.ant-upload-animate-inline-appear,
      &.ant-upload-animate-inline-appear-active,
      &.ant-upload-animate-inline {
        display: none !important;
        animation: none !important;
        transition: none !important;
      }
      width: ${layout ? (width ?? '54px') + ' !important' : ''};
      height: ${layout ? (height ?? '54px') + ' !important' : ''};
    }

    .ant-upload-list-item-action {
      > .ant-btn-icon {
        > .anticon-delete {
          color: ${token.colorError} !important;
        }
      }
    }

    .thumbnail-stub {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      ${rest}
    }

    .ant-upload-list-item-name-stub { 
      position: absolute;
      bottom: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 100%;
    }
`);

  const antPreviewDownloadIcon = cx("ant-preview-download-icon", css`
    background: #0000001A;
    font-size: 24px;
    padding: 8px;
    border-radius: 100px;
    :hover {
      color: #fff;
    }
`);
  const shaStoredFilesRendererHorizontal = cx("sha-stored-files-renderer-horizontal", css`
    height: var(--container-height) !important;
    width: var(--container-width) !important;
    max-height: var(--container-max-height) !important;
    max-width: var(--container-max-width) !important;
    min-height: var(--container-min-height) !important;
    .${prefixCls}-upload-list {
      display: flex !important;
      flex-wrap: nowrap !important;
      flex-direction: row !important;
      flex-shrink: 0 !important;
      overflow-x: auto;
      overflow-y: clip !important;
      align-items: center !important;
      height: max-content !important;
      width: var(--container-width) !important;
      min-width: var(--container-min-width) !important;
      max-width: var(--container-max-width) !important;
    }

    .ant-upload-list-item-container {
      display: inline-block !important;
      max-width: var(--thumbnail-width) !important;
      height: var(--thumbnail-height) !important;
      border-radius: ${borderRadius ?? '8px'} !important;
      &.ant-upload-animate-inline-appear,
      &.ant-upload-animate-inline-appear-active,
      &.ant-upload-animate-inline {
        display: none !important;
        animation: none !important;
        transition: none !important;
      }
    }
`);

  const shaStoredFilesRendererVertical = cx("sha-stored-files-renderer-vertical", css`
    --container-width: max-content !important;
    max-width: max-content !important;
    width: max-content !important;
    min-width: max-content !important;
    height: var(--container-height) !important;
    max-height: var(--container-max-height) !important;
    min-height: var(--container-min-height) !important;
    .${prefixCls}-upload-list {
      display: flex !important;
      flex-direction: column-reverse !important;
      flex-wrap: nowrap !important;
      padding: 2px ${borderWidth ?? '2px'} !important;
      height: var(--container-height) !important;
      width: 100% !important;
      max-height: calc(var(--container-max-height) - 32px) !important;
      min-height: calc(var(--container-min-height) - 32px) !important;
    }

    .stored-files-renderer-btn-container {
      justify-content: flex-start;
      .ant-btn {
        padding: 0;
      }
    }

    .ant-upload-list-item-container {
      display: inline-block !important;
      width: var(--thumbnail-width) !important;
      height: var(--thumbnail-height) !important;
      border-radius: ${borderRadius ?? '8px'} !important;
      &.ant-upload-animate-inline-appear,
      &.ant-upload-animate-inline-appear-active,
      &.ant-upload-animate-inline {
        display: none !important;
        animation: none !important;
        transition: none !important;
      }
    }
`);

  const shaStoredFilesRendererGrid = cx("sha-stored-files-renderer-grid", css`
    max-width: var(--container-width) !important;
    max-height: var(--container-height) !important;

    .${prefixCls}-upload-list {
      align-items: center;
      padding: 2px;
      height: var(--container-height) !important;
      width: var(--container-width) !important;
      max-height: var(--container-max-height) !important;
      max-width: var(--container-max-width) !important;
      min-height: var(--container-min-height) !important;
      min-width: var(--container-min-width) !important;
      .${prefixCls}-upload-list-item {
        width: 100% !important;
        height: 100% !important;
        border-radius: ${borderRadius ?? '8px'} !important;
      }
    }

    .ant-upload-list-item-container {
      display: inline-block !important;
      width: var(--thumbnail-width) !important;
      height: var(--thumbnail-height) !important;
      border-radius: ${borderRadius ?? '8px'} !important;
      &.ant-upload-animate-inline-appear,
      &.ant-upload-animate-inline-appear-active,
      &.ant-upload-animate-inline {
        display: none !important;
        animation: none !important;
        transition: none !important;
      }
    }
`);

  return {
    shaStoredFilesRenderer,
    shaStoredFilesRendererHorizontal,
    shaStoredFilesRendererVertical,
    shaStoredFilesRendererGrid,
    storedFilesRendererBtnContainer,
    storedFilesRendererNoFiles,
    antUploadDragIcon,
    antPreviewDownloadIcon
  };
});