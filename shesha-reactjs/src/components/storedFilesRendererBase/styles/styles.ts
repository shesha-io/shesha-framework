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

  const thumbnailWidth = layout ? (width ?? '54px') : '100%';
  const thumbnailHeight = layout ? (height ?? '54px') : '100%';
  const gapValue = gap ?? '8px';
  const fontSizeValue = fontSize ?? '14px';
  const fontWeightValue = fontWeight ?? '400';
  const fontFamilyValue = fontFamily ?? 'Segoe UI';
  const downloadZipBtnHeight = model.downloadZip ? '32px' : '0px';

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
    ${restContainerStyles}
    ${containerWidth ? `width: ${containerWidth} !important;` : ''}
    ${containerMaxWidth ? `max-width: ${containerMaxWidth} !important;` : ''}
    ${containerMinWidth ? `min-width: ${containerMinWidth} !important;` : ''}
    ${containerHeight ? `height: ${containerHeight} !important;` : ''}
    ${containerMinHeight ? `min-height: ${containerMinHeight} !important;` : ''}
    
    .ant-upload:not(.ant-upload-disabled) {
      .icon {
        color: ${color ?? token.colorPrimary} !important;
      };
    }
  
    .ant-upload-list-item {
      border-width: 0px !important;
      padding: 0px !important;
      margin: 0px !important;
      font-size: ${fontSizeValue} !important;
      display: flex;
      ${layout ? `width: ${width ?? '54px'} !important;` : ''}
      ${layout ? `height: ${height ?? '54px'} !important;` : ''}

      :before {
        top: 0;
        width: 100% !important;
        height: 100% !important;
        border-radius: ${borderRadius ?? '8px'} !important;
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
      border-radius: ${borderRadius ?? '8px'} !important;
      background-position: ${backgroundPosition} !important;
      background-repeat: ${backgroundRepeat} !important;
      background-size: ${backgroundSize} !important;

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
      display: ${hideFileName ? 'none !important' : 'block'};
      color: ${color ?? token.colorPrimary};
      font-family: ${fontFamilyValue};
      font-size: ${fontSizeValue} !important;
      font-weight: ${fontWeightValue};
      text-align: ${textAlign ?? 'center'} !important;
      padding: 0 8px !important;
      width: ${(layout && width) ?? '54px'} !important;
    }

    .ant-upload-list-text {
      ${containerHeight ? `height: calc(${containerHeight} - 32px) !important;` : ''}
      ${containerMaxHeight ? `max-height: calc(${containerMaxHeight} - calc(${isDragger ? '0px' : fontSizeValue} * 4)) !important;` : ''}
      ${containerMinHeight ? `min-height: calc(${containerMinHeight} - 32px) !important;` : ''}
      ${containerWidth ? `width: calc(${containerWidth} - 32px) !important;` : ''}
      ${containerMaxWidth ? `max-width: calc(${containerMaxWidth} - 32px) !important;` : ''}
      ${containerMinWidth ? `min-width: calc(${containerMinWidth} - 32px) !important;` : ''}
    }

    .ant-upload-drag:hover:not(.ant-upload-disabled) {
      border-color: ${token.colorPrimary} !important;
    }

    .ant-upload-drag {
      height: max-content !important;
    }

    .${prefixCls}-upload {
      ${(layout && !isDragger) ? `width: ${thumbnailWidth} !important;` : ''};
      ${(layout && !isDragger) ? `height: ${thumbnailHeight} !important;` : ''};
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
        font-size: ${fontSizeValue} !important;
        font-weight: ${fontWeightValue} !important;
        font-family: ${fontFamilyValue} !important;
      }
    }
    .${storedFilesRendererBtnContainer} {
      display: flex;
      margin-top: 4px;
      justify-content: flex-end;
    }
  
    .${prefixCls}-upload-list {
      gap: ${gapValue};
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
    ${containerHeight ? `height: ${containerHeight} !important;` : ''}
    ${containerWidth ? `width: ${containerWidth} !important;` : ''}
    ${containerMaxHeight ? `max-height: ${containerMaxHeight} !important;` : ''}
    ${containerMaxWidth ? `max-width: ${containerMaxWidth} !important;` : ''}
    ${containerMinHeight ? `min-height: ${containerMinHeight} !important;` : ''}
    .${prefixCls}-upload-list {
      display: flex !important;
      flex-wrap: nowrap !important;
      flex-direction: row !important;
      flex-shrink: 0 !important;
      overflow-x: auto;
      overflow-y: clip !important;
      align-items: center !important;
      height: max-content !important;
      ${containerWidth ? `width: ${containerWidth} !important;` : ''}
      ${containerMinWidth ? `min-width: ${containerMinWidth} !important;` : ''}
      ${containerMaxWidth ? `max-width: ${containerMaxWidth} !important;` : ''}
    }

    .ant-upload-list-item-container {
      display: inline-block !important;
      max-width: ${thumbnailWidth} !important;
      height: ${thumbnailHeight} !important;
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
    ${containerHeight ? `height: ${containerHeight} !important;` : ''}
    ${containerMaxHeight ? `max-height: ${containerMaxHeight} !important;` : ''}
    ${containerMinHeight ? `min-height: ${containerMinHeight} !important;` : ''}
    .${prefixCls}-upload-list {
      display: flex !important;
      flex-direction: column !important;
      flex-wrap: nowrap !important;
      padding: 2px ${borderWidth ?? '2px'} !important;
      ${containerHeight ? `height: calc(${containerHeight} - ${downloadZipBtnHeight}) !important;` : ''}
      width: 100% !important;
      ${containerMaxHeight ? `max-height: calc(${containerMaxHeight} - ${downloadZipBtnHeight}) !important;` : ''}
      ${containerMinHeight ? `min-height: calc(${containerMinHeight} - ${downloadZipBtnHeight}) !important;` : ''}
    }

    .stored-files-renderer-btn-container {
      justify-content: flex-start;
      .ant-btn {
        padding: 0;
      }
    }

    .ant-upload-list-item-container {
      display: inline-block !important;
      width: ${thumbnailWidth} !important;
      height: ${thumbnailHeight} !important;
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
    ${containerMaxWidth ? `max-width: ${containerMaxWidth} !important;` : ''}
    ${containerMaxHeight ? `max-height: ${containerMaxHeight} !important;` : ''}

    .${prefixCls}-upload-list {
      align-items: center;
      display: flex;
      flex-wrap: wrap;
      align-content: flex-start;
      flex-direction: row !important;
      padding: 2px;
      ${containerHeight ? `height: calc(${containerHeight} - ${downloadZipBtnHeight}) !important;` : ''}
      ${containerWidth ? `width: ${containerWidth} !important;` : ''}
      ${containerMaxHeight ? `max-height: calc(${containerMaxHeight} - ${downloadZipBtnHeight}) !important;` : ''}
      ${containerMaxWidth ? `max-width: ${containerMaxWidth} !important;` : ''}
      ${containerMinHeight ? `min-height: ${containerMinHeight} !important;` : ''}
      ${containerMinWidth ? `min-width: ${containerMinWidth} !important;` : ''}
      .${prefixCls}-upload-list-item {
        width: 100% !important;
        height: 100% !important;
        border-radius: ${borderRadius ?? '8px'} !important;
        margin-top: 0px !important;
        margin-bottom: 8px !important;
      }
    }

    .ant-upload-list-item-container {
      display: inline-block !important;
      width: ${thumbnailWidth} !important;
      height: ${thumbnailHeight} !important;
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
    antUploadDragIcon,
    antPreviewDownloadIcon,
    thumbnailReadOnly,
    storedFilesRendererWrapper,
  };
});
