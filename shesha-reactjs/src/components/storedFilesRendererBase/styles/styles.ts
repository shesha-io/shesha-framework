import { createStyles } from '@/styles';

export const useStyles = createStyles(({ token, css, cx, prefixCls }, { style, model, containerStyles, primaryColor, downloadedFileStyles }) => {
  const { background, backgroundImage, borderRadius: allRadius, borderWidth = '1px', borderTopWidth, width, minWidth, maxWidth,
    borderBottomWidth, borderLeftWidth, borderLeftColor, borderLeftStyle, borderRightColor, borderRightStyle, borderColor = '#d9d9d9', borderTopStyle, borderTopColor,
    borderTop, boxShadow, borderBottom, borderBottomColor, borderBottomStyle, borderRight, borderRightWidth, backgroundColor, backgroundPosition,
    backgroundRepeat, backgroundSize, borderStyle = 'solid', color, fontFamily, fontSize, fontWeight, height, maxHeight, minHeight, textAlign,
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

  const fileName = cx("item-file-name", css`
    display: ${model.hideFileName ? 'none' : 'flex'};
    color: ${color ?? token.colorPrimary} !important;
    font-size: ${fontSize ?? '14px'} !important;
    font-weight: ${fontWeight ?? '400'} !important;
    font-family: ${fontFamily ?? 'Segoe UI'} !important;
    text-align: ${textAlign ?? 'left'} !important;
    justify-content: ${textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start'} !important;
    margin: 2px 0px;
    position: relative;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    cursor: pointer;
    &:hover {
      background-color: #f0f0f0 !important;
      opacity: 1 !important;
      overflow: visible;
      width: max-content;
      min-width: 100%;
      border-radius: 4px;
      padding: 0 8px;
      z-index: 999 !important;
      white-space: nowrap;
      justify-content: ${textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start'} !important;
    }
  `);

  const fileNameWrapper = cx("file-name-wrapper", css`
    display: ${model.hideFileName ? 'none' : 'flex'};
    cursor: pointer;
    &:hover {
      background-color: #f0f0f0 !important;
      border-radius: ${borderRadius ?? '4px'} !important;
    }
    > .item-file-name {
      &:hover {
        background-color: transparent !important;
        padding: 0;
      }
    }
  `);

  const downloadedFile = cx("downloaded-file", css`
    position: relative;
    display: flex;

    .ant-upload-list-item-container {
      opacity: 0.8;
      position: relative;
    }

    .ant-upload-list-item-thumbnail {
      opacity: 0.8;
      border: 2px solid ${downloadedFileStyles?.color ?? token.colorSuccess};
      box-shadow: 0 0 0 1px ${downloadedFileStyles?.color ?? token.colorSuccess}20;
      ${downloadedFileStyles}
    }

    .item-file-name {
      display: ${model.hideFileName ? 'none' : 'flex'};
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
    position: ${layout ? 'absolute' : 'relative'};
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

  const thumbnailWidth = layout ? (width ?? '54px') : '100%';
  const thumbnailHeight = layout ? (height ?? '54px') : '100%';
  const marginGap = gap ?? '8px';

  const antUploadDragIcon = `${prefixCls}-upload-drag-icon`;
  const shaStoredFilesRenderer = cx("sha-stored-files-renderer", css`
    margin-top: ${marginTop};
    margin-left: ${marginLeft};
    margin-right: ${marginRight};
    margin-bottom: ${marginBottom};
    padding-top: ${paddingTop ?? '2px'};
    padding-left: ${paddingLeft ?? '2px'};
    padding-right: ${paddingRight ?? '2px'};
    padding-bottom: ${paddingBottom ?? '2px'};
    height: ${containerHeight ?? 'auto'} !important;
    width: ${containerWidth ?? '100%'} !important;
    max-height: ${containerMaxHeight ?? 'auto'} !important;
    max-width: ${containerMaxWidth ?? '100%'} !important;
    min-height: ${containerMinHeight ?? 'auto'} !important;
    min-width: ${containerMinWidth ?? '100%'} !important;
    display: flex;
    flex-direction: column;
    ${restContainerStyles}
    overflow: auto;
    scrollbar-width: thin;
    scrollbar-gutter: stable;
      &::-webkit-scrollbar {
        width: 8px;
        background-color: transparent;
      }

    .ant-upload-wrapper {
      flex: 1 !important;
    }

    .ant-upload:not(.ant-upload-disabled) {
      .icon {
        color: ${primaryColor ?? token.colorPrimary} !important;
      };
    }
  
    .ant-upload-list-item {
      display: flex;
      padding: 0 !important;
      border: unset !important;
      border: ${borderWidth} ${borderStyle} ${borderColor} !important;
      border-top: ${borderTopWidth ?? borderWidth} ${borderTopStyle ?? borderStyle} ${borderTopColor ?? borderColor};
      border-right: ${borderRightWidth ?? borderWidth} ${borderRightStyle ?? borderStyle} ${borderRightColor ?? borderColor};
      border-left: ${borderLeftWidth ?? borderWidth} ${borderLeftStyle ?? borderStyle} ${borderLeftColor ?? borderColor};
      border-bottom: ${borderBottomWidth ?? borderWidth} ${borderBottomStyle ?? borderStyle} ${borderBottomColor ?? borderColor};
      
      :before {
        ${rest}
        display: none;
      }
    }

    .ant-upload-list-item-thumbnail {
      ${rest}
      background: ${background ?? backgroundImage ?? (backgroundColor ?? 'transparent')} !important;
      background-size: ${backgroundSize ?? 'cover'} !important;
      background-position: ${backgroundPosition ?? 'center'} !important;
      background-repeat: ${backgroundRepeat ?? 'no-repeat'} !important;
      box-shadow: ${boxShadow};
      border-radius: ${borderRadius ?? '8px'} !important;
      height: ${thumbnailHeight} !important;
      
      img {
        width: ${thumbnailWidth} !important;
        height: ${thumbnailHeight} !important;
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

    .ant-upload-list-text {
      > .downloaded-icon {
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
      ${(layout && !isDragger) && `width: ${thumbnailWidth} !important;`};
      ${(layout && !isDragger) && `height: ${thumbnailHeight} !important;`};

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
          width: ${thumbnailWidth} !important;
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
      width: ${containerWidth};
      max-width: ${containerMaxWidth};
      min-width: ${containerMinWidth};
    }
  
    .${prefixCls}-upload-list {
      ${layout ? `gap: ${marginGap}` : 'unset'};
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
      ${rest}
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: max-content;
    }

`);

  const shaStoredFilesRendererHorizontal = cx("sha-stored-files-renderer-horizontal", css`
      height: max-content;
    .${prefixCls}-upload-list {
      display: flex !important;
      flex-wrap: nowrap !important;
      flex-direction: row !important;
      flex-shrink: 0 !important;
      overflow-x: auto;
      overflow-y: clip !important;
      align-items: stretch !important;
      // width: ${containerWidth} !important;
      // min-width: ${containerMinWidth} !important;
      // max-width: ${containerMaxWidth} !important;
      // max-height: calc(${containerMaxHeight} - 40px) !important;
      // height: ${containerHeight} !important;
      // min-height: ${containerMinHeight} !important;
    }

    .ant-upload-list-item-container {
      display: inline-block !important;
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
    max-width: max-content !important;
    width: max-content !important;
    min-width: max-content !important;
    .${prefixCls}-upload-list {
      display: flex !important;
      flex-direction: column !important;
      flex-wrap: nowrap !important;
      padding: 2px ${borderWidth ?? '2px'} !important;
      // height: ${containerHeight} !important;
      width: 100% !important;
      // max-height: calc(${containerMaxHeight} - 72px) !important;
      // min-height: calc(${containerMinHeight} - 32px) !important;
    }

    .stored-files-renderer-btn-container {
      justify-content: flex-start;
      .ant-btn {
        padding: 0;
      }
    }

    .ant-upload-list-item-container {
      display: inline-block !important;
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
    .${prefixCls}-upload-list {
      display: flex !important;
      flex-direction: row !important;
      flex-wrap: wrap !important;
      align-items: stretch !important;
      align-content: flex-start !important;
      padding: 2px;
      // width: ${containerWidth} !important;
      // max-height: calc(${containerMaxHeight} - 40px) !important;
      // max-width: ${containerMaxWidth} !important;
      // height: calc(${containerHeight} - 32px) !important;
      // min-height: ${containerMinHeight} !important;
      // min-width: ${containerMinWidth} !important;
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
