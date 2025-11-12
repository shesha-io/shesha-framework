import { createStyles } from '@/styles';

export const useStyles = createStyles(({ token, css, cx, prefixCls }, { style, model, containerStyles }) => {
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
  const storedFilesRendererWrapper = cx("stored-files-renderer-wrapper", css`
    margin-top: ${marginTop};
    margin-left: ${marginLeft};
    margin-right: ${marginRight};
    margin-bottom: ${marginBottom};
    padding-top: ${paddingTop ?? '2px'};
    padding-left: ${paddingLeft ?? '2px'};
    padding-right: ${paddingRight ?? '2px'};
    padding-bottom: ${paddingBottom ?? '2px'};
  `);

  const shaStoredFilesRenderer = cx("sha-stored-files-renderer", css`
    --sha-thumbnail-width: ${layout ? (width ?? '54px') : '100%'};
    --sha-thumbnail-height: ${layout ? (height ?? '54px') : '100%'};
    --sha-gap: ${gap ?? '8px'};
    --sha-border-radius: ${borderRadius ?? '8px'};
    --sha-container-width: ${containerWidth};
    --sha-container-max-width: ${containerMaxWidth};
    --sha-container-min-width: ${containerMinWidth};
    --sha-container-min-height: ${containerMinHeight};
    --sha-container-max-height: ${containerMaxHeight};
    --sha-container-height: ${containerHeight};
    --sha-font-size: ${fontSize ?? '14px'};
    --sha-font-weight: ${fontWeight ?? '400'};
    --sha-font-family: ${fontFamily ?? 'Segoe UI'};
    ${restContainerStyles}
    width: var(--sha-container-width) !important;
    max-width: var(--sha-container-max-width) !important;
    min-width: var(--sha-container-min-width) !important;
    height: var(--sha-container-height) !important;
    min-height: var(--sha-container-min-height) !important;
    
    .ant-upload:not(.ant-upload-disabled) {
      .icon {
        color: ${color ?? token.colorPrimary} !important;
      };
    }
  
    .ant-upload-list-item {
      border-width: 0px !important;
      padding: 0px !important;
      margin: 0px !important;
      font-size: var(--sha-font-size) !important;
      display: flex;
      width: ${layout ? (width ?? '54px') + ' !important' : ''};
      height: ${layout ? (height ?? '54px') + ' !important' : ''};

      :before {
        top: 0;
        width: 100% !important;
        height: 100% !important;
        border-radius: var(--sha-border-radius) !important;
        ${rest}
      }
    }

    .ant-upload-list-item-thumbnail {
      ${rest}
      background: ${background ?? backgroundImage ?? (backgroundColor ?? 'transparent')} !important;
      border: ${borderWidth} ${borderStyle} ${borderColor};
      border-top: ${borderTopWidth ?? borderWidth} ${borderTopStyle ?? borderStyle} ${borderTopColor ?? borderColor};
      border-right: ${borderRightWidth ?? borderWidth} ${borderRightStyle ?? borderStyle} ${borderRightColor ?? borderColor};
      border-left: ${borderLeftWidth ?? borderWidth} ${borderLeftStyle ?? borderStyle} ${borderLeftColor ?? borderColor};
      border-bottom: ${borderBottomWidth ?? borderWidth} ${borderBottomStyle ?? borderStyle} ${borderBottomColor ?? borderColor};
      box-shadow: ${boxShadow};
      border-radius: var(--sha-border-radius) !important;
      background-position: ${backgroundPosition} !important;
      background-repeat: ${backgroundRepeat} !important;
      background-size: ${backgroundSize} !important;

      img {
        width: var(--sha-thumbnail-width, 54px) !important;
        height: var(--sha-thumbnail-height, 54px) !important;
        border-radius: var(--sha-border-radius) !important;
        object-fit: cover !important;
        display: flex !important;
        justify-content: center !important;
      }
      .ant-image .anticon {
        border-radius: var(--sha-border-radius) !important;
        display: block !important;
      }
    }

    .ant-upload-list-item-name {
      display: ${hideFileName ? 'none !important' : 'block'};
      color: ${color ?? token.colorPrimary};
      font-family: var(--sha-font-family);
      font-size: var(--sha-font-size) !important;
      font-weight: var(--sha-font-weight);
      text-align: ${textAlign ?? 'center'} !important;
      padding: 0 8px !important;
      width: ${(layout && width) ?? '54px'} !important;
    }

    .ant-upload-list-text {
      height: calc(var(--sha-container-height) - 32px) !important;
      max-height: calc(var(--sha-container-max-height) - calc(${isDragger ? '0px' : fontSize ?? '14px'} * 4)) !important;
      min-height: calc(var(--sha-container-min-height) - 32px) !important;
      width: calc(var(--sha-container-width) - 32px) !important;
      max-width: calc(var(--sha-container-max-width) - 32px) !important;
      min-width: calc(var(--sha-container-min-width) - 32px) !important;
    }

    .ant-upload-drag:hover:not(.ant-upload-disabled) {
      border-color: ${token.colorPrimary} !important;
    }

    .ant-upload-drag {
      height: max-content !important;
    }

    .${prefixCls}-upload {
      ${(layout && !isDragger) && 'width: var(--sha-thumbnail-width) !important;'};
      ${(layout && !isDragger) && 'height: var(--sha-thumbnail-height) !important'};
      ${rest}
      align-items: center;

      &.${prefixCls}-upload-btn {
        padding: 8px 0px;
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
      color: ${color ?? token.colorPrimary} !important;
      padding: 0;
      * {
        font-size: var(--sha-font-size) !important;
        font-weight: var(--sha-font-weight) !important;
        font-family: var(--sha-font-family) !important;
      }
    }
    .${storedFilesRendererBtnContainer} {
      display: flex;
      margin-top: 4px;
      justify-content: flex-end;
    }
  
    .${prefixCls}-upload-list {
      gap: var(--sha-gap);
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
      display: flex !important;
      flex-direction: row;
      width: 100%;
      &.ant-upload-animate-inline-appear,
      &.ant-upload-animate-inline-appear-active,
      &.ant-upload-animate-inline {
        display: none !important;
        animation: none !important;
        transition: none !important;
      }
      width: ${layout ? (width ?? '54px') + ' !important' : ''};
      height: ${layout ? (height ?? '54px') + ' !important' : ''};
      justify-content: ${textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : (textAlign ?? 'center')};
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
    height: var(--sha-container-height) !important;
    width: var(--sha-container-width) !important;
    max-height: var(--sha-container-max-height) !important;
    max-width: var(--sha-container-max-width) !important;
    min-height: var(--sha-container-min-height) !important;
    .${prefixCls}-upload-list {
      display: flex !important;
      flex-wrap: nowrap !important;
      flex-direction: row !important;
      flex-shrink: 0 !important;
      overflow-x: auto;
      overflow-y: clip !important;
      align-items: center !important;
      height: max-content !important;
      width: var(--sha-container-width) !important;
      min-width: var(--sha-container-min-width) !important;
      max-width: var(--sha-container-max-width) !important;
    }

    .ant-upload-list-item-container {
      display: inline-block !important;
      max-width: var(--sha-thumbnail-width) !important;
      height: var(--sha-thumbnail-height) !important;
      border-radius: var(--sha-border-radius) !important;
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
    --sha-container-width: max-content !important;
    max-width: max-content !important;
    width: max-content !important;
    min-width: max-content !important;
    height: var(--sha-container-height) !important;
    max-height: var(--sha-container-max-height) !important;
    min-height: var(--sha-container-min-height) !important;
    .${prefixCls}-upload-list {
      display: flex !important;
      flex-direction: column !important;
      flex-wrap: nowrap !important;
      padding: 2px ${borderWidth ?? '2px'} !important;
      height: calc(var(--sha-container-height) - ${model.downloadZip ? "32px" : "0px"}) !important;
      width: 100% !important;
      max-height: calc(var(--sha-container-max-height) - ${model.downloadZip ? "32px" : "0px"}) !important;
      min-height: calc(var(--sha-container-min-height) - 32px) !important;
    }

    .stored-files-renderer-btn-container {
      justify-content: flex-start;
      .ant-btn {
        padding: 0;
      }
    }

    .ant-upload-list-item-container {
      display: inline-block !important;
      width: var(--sha-thumbnail-width) !important;
      height: var(--sha-thumbnail-height) !important;
      border-radius: var(--sha-border-radius) !important;
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
    max-width: var(--sha-container-width) !important;
    max-height: var(--sha-container-height) !important;

    .${prefixCls}-upload-list {
      align-items: center;
      display: flex;
      flex-wrap: wrap;
      align-content: flex-start;
      flex-direction: row !important;
      padding: 2px;
      height: calc(var(--sha-container-height) - ${model.downloadZip ? "32px" : "0px"}) !important;
      width: var(--sha-container-width) !important;
      max-height: calc(var(--sha-container-max-height) - ${model.downloadZip ? "32px" : "0px"}) !important;
      max-width: var(--sha-container-max-width) !important;
      min-height: var(--sha-container-min-height) !important;
      min-width: var(--sha-container-min-width) !important;
      .${prefixCls}-upload-list-item {
        width: 100% !important;
        height: 100% !important;
        border-radius: var(--sha-border-radius) !important;
        margin-top: 0px !important;
        margin-bottom: 8px !important;
      }
    }

    .ant-upload-list-item-container {
      display: inline-block !important;
      width: var(--sha-thumbnail-width) !important;
      height: var(--sha-thumbnail-height) !important;
      border-radius: var(--sha-border-radius) !important;
      &.ant-upload-animate-inline-appear,
      &.ant-upload-animate-inline-appear-active,
      &.ant-upload-animate-inline {
        display: none !important;
        animation: none !important;
        transition: none !important;
      }
    }
`);

  const thumbnailReadOnly = cx("ant-upload-list-item thumbnail-readonly", css`
      text-align: center;
      align-items: center;
      justify-content: center;
      background-color: #00000005 !important;
      border: 1px dashed #d9d9d9 !important;
      border-radius: 8px !important;
  `);

  return {
    shaStoredFilesRenderer,
    shaStoredFilesRendererHorizontal,
    shaStoredFilesRendererVertical,
    shaStoredFilesRendererGrid,
    storedFilesRendererBtnContainer,
    storedFilesRendererNoFiles,
    antUploadDragIcon,
    antPreviewDownloadIcon,
    thumbnailReadOnly,
    storedFilesRendererWrapper,
  };
});
