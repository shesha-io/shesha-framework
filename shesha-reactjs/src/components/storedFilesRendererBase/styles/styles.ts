import { createStyles } from '@/styles';

export const useStyles = createStyles(({ token, css, cx, prefixCls }, { style, model, containerStyles, primaryColor, downloadedFileStyles }) => {
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

  const { gap, layout, isDragger } = model;

  const storedFilesRendererBtnContainer = "stored-files-renderer-btn-container";
  const storedFilesRendererNoFiles = "stored-files-renderer-no-files";
  const borderRadius = [
    borderTopRightRadius ?? allRadius ?? '8px',
    borderBottomRightRadius ?? allRadius ?? '8px',
    borderBottomLeftRadius ?? allRadius ?? '8px',
    borderTopLeftRadius ?? allRadius ?? '8px',
  ].join(' ');

  // Thumbnail file name - shows #282828 background on overflow
  const fileName = cx("item-file-name", css`
    color: ${color ?? token.colorPrimary} !important;
    font-size: ${fontSize ?? '14px'} !important;
    font-weight: ${fontWeight ?? '400'} !important;
    font-family: ${fontFamily ?? 'Segoe UI'} !important;
    text-align: ${textAlign ?? 'left'} !important;
    margin: 2px 0px;
    position: relative;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    cursor: pointer;
    &:hover {
      background-color: #282828 !important;
      opacity: 1 !important;
      overflow: visible;
      width: max-content;
      border-radius: 4px;
      padding: 0 8px;
      z-index: 999 !important;
      white-space: nowrap;
    }
  `);

  // Text listType wrapper - shows #f2f2f2 background on hover
  const fileNameWrapper = cx("file-name-wrapper", css`
    display: flex;
    cursor: pointer;
    &:hover {
      background-color: #f2f2f2 !important;
      border-radius: 4px;
    }
    > .item-file-name {
      &:hover {
        background-color: transparent !important;
        padding: 0;
      }
    }
  `)

  const downloadedFile = cx("downloaded-file", css`
    position: relative;
    display: flex;

    .ant-upload-list-item-container {
      opacity: 0.8;
      position: relative;
    }

    .ant-upload-list-item-thumbnail {
      opacity: 0.8;
      border: 2px solid ${downloadedFileStyles?.color ?? token.colorSuccess} !important;
      box-shadow: 0 0 0 1px ${downloadedFileStyles?.color ?? token.colorSuccess}20;
    }

    .item-file-name {
      color: ${downloadedFileStyles?.color ?? color} !important;
      font-size: ${downloadedFileStyles?.fontSize ?? fontSize} !important;
      font-weight: ${downloadedFileStyles?.fontWeight ?? fontWeight} !important;
      font-family: ${downloadedFileStyles?.fontFamily ?? fontFamily} !important;
      text-align: ${downloadedFileStyles?.textAlign ?? textAlign} !important;
    }

    .ant-upload-list-item-action {
      .anticon-download {
        color: ${downloadedFileStyles?.color ?? token.colorSuccess} !important;
      }
    }

    /* Hide download status icon on hover */
    &:hover .downloaded-icon {
      display: none;
    }
  `);

  const downloadedIcon = cx("downloaded-icon", css`
    position: absolute;
    top: 4px;
    right: 4px;
    background: ${downloadedFileStyles?.color ?? token.colorSuccess};
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    z-index: 1;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  `);

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
    overflow: auto;
    scrollbar-width: thin;
    scrollbar-gutter: stable;
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
        ${rest}
        display: none;
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
      border-radius: ${borderRadius ?? '8px'} !important;
      width: var(--thumbnail-width, 54px) !important;
      height: var(--thumbnail-height, 54px) !important;

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
      ${layout ? 'display: none !important' : ''};
    }

    .ant-upload-list {
      height: calc(${containerHeight} - 32px) !important;
      max-height: calc(var(--container-max-height) - calc(${isDragger ? '0px' : fontSize} * 4) - 40px) !important;
      min-height: calc(var(--container-min-height) - 32px) !important;
      width: calc(var(--container-width) - 32px) !important;
      max-width: calc(var(--container-max-width) - 32px) !important;
      min-width: calc(var(--container-min-width) - 32px) !important;
    }

    .ant-upload-list-text {
     >.downloaded-icon {
      position: relative;
      top: unset;
      right: unset;
     }
    }

    .ant-upload-drag:hover:not(.ant-upload-disabled) {
      border-color: ${token.colorPrimary} !important;
    }

    .${prefixCls}-upload {
      ${rest}
      ${(layout && !isDragger) && 'width: var(--thumbnail-width) !important;'};
      ${(layout && !isDragger) && 'height: var(--thumbnail-height) !important;'};
     
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
          width: var(--thumbnail-width, 54px) !important;
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
      height: auto !important;
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

`);

  const shaStoredFilesRendererHorizontal = cx("sha-stored-files-renderer-horizontal", css`
    width: var(--container-width) !important;
    max-width: var(--container-max-width) !important;
    .${prefixCls}-upload-list {
      display: flex !important;
      flex-wrap: nowrap !important;
      flex-direction: row !important;
      flex-shrink: 0 !important;
      overflow-x: auto;
      overflow-y: clip !important;
      align-items: stretch !important;
      width: var(--container-width) !important;
      min-width: var(--container-min-width) !important;
      max-width: calc(var(--container-max-width) - 40px) !important;
      max-height: calc(var(--container-max-height) - 40px) !important;
      height: ${containerHeight} !important;
      max-width: var(--container-max-width) !important;
      min-height: var(--container-min-height) !important;
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
    .${prefixCls}-upload-list {
      display: flex !important;
      flex-direction: column-reverse !important;
      flex-wrap: nowrap !important;
      padding: 2px ${borderWidth ?? '2px'} !important;
      height: ${containerHeight} !important;
      width: 100% !important;
      max-height: calc(var(--container-max-height) - 72px) !important;
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
    max-height: ${containerHeight} !important;

    .${prefixCls}-upload-list {
      display: flex !important;
      flex-direction: row !important;
      flex-wrap: wrap !important;
      align-items: stretch !important;
      align-content: flex-start !important;
      padding: 2px;
      height: ${containerHeight} !important;
      width: var(--container-width) !important;
      max-height: calc(var(--container-max-height) - 40px) !important;
      max-width: var(--container-max-width) !important;
      min-height: var(--container-min-height) !important;
      min-width: var(--container-min-width) !important;
      overflow-y: auto !important;
      overflow-x: hidden !important;
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
    downloadedFile,
    downloadedIcon,
    antUploadDragIcon,
    thumbnailReadOnly,
    fileName,
    fileNameWrapper,
  };
});