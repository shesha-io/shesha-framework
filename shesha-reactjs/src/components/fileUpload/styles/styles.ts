import { createStyles } from '@/styles';

export const useStyles = createStyles(({ token, css, cx, prefixCls }, { style, model }) => {

  const {
    background = 'transparent',
    backgroundImage,
    borderRadius = '8px',
    borderWidth = '0',
    borderTopWidth,
    width,
    minWidth,
    maxWidth,
    borderBottomWidth,
    borderLeftWidth,
    borderLeftColor,
    borderLeftStyle,
    borderRightColor,
    borderRightStyle,
    borderColor = 'transparent',
    borderTopStyle,
    borderTopColor,
    borderTop,
    boxShadow,
    borderBottom,
    borderBottomColor,
    borderBottomStyle,
    borderRight,
    borderRightWidth,
    backgroundColor = '#fff',
    backgroundPosition,
    backgroundRepeat,
    backgroundSize,
    borderStyle = 'solid',
    color,
    fontFamily = 'Segoe UI',
    fontSize = '14px',
    fontWeight = '400',
    height,
    maxHeight,
    minHeight,
    textAlign = 'center',
    ...rest
  } = style || {};

  const { gap, layout, hideFileName, isDragger } = model;

  const storedFilesRendererBtnContainer = "stored-files-renderer-btn-container";
  const storedFilesRendererNoFiles = "stored-files-renderer-no-files";

  const antUploadDragIcon = `${prefixCls}-upload-drag-icon`;
  const shaStoredFilesRenderer = cx("sha-stored-files-renderer", css`
    --thumbnail-width: ${layout ? (width ?? height ?? '54px') : '100%'};
    --thumbnail-height: ${layout ? (height ?? width ?? '54px') : '100%'};
    --ant-margin-xs: ${gap ?? '8px'} !important;
    --ant-border-radius-xs: ${borderRadius ?? '8px'} !important;
    --ant-border-radius-sm: ${borderRadius ?? '8px'} !important;
    --ant-border-radius-lg:  ${borderRadius ?? '8px'} !important;
    --ant-button-content-font-size: ${fontSize ?? '14px'} !important;
    --ant-button-font-weight: ${fontWeight ?? '400'} !important;
    --ant-font-family: ${fontFamily ?? 'Segoe UI'} !important;
    --ant-button-font-weight: ${fontWeight ?? '400'} !important;
      ${rest}
      max-height: auto;
    
    .ant-upload:not(.ant-upload-disabled) {
          .icon {
            color: ${token.colorPrimary} !important;
        };
    }
  
    .ant-upload-list-item {
      --ant-line-width: 0px !important;
      --ant-padding-xs: 0px !important;
      --font-size: ${fontSize ?? '14px'} !important;
      --ant-font-size: ${fontSize ?? '14px'} !important;
      border-radius: ${borderRadius ?? '8px'} !important;
      display: flex;

      :before {
        top: 0;
        width: 100% !important;
        border-radius: ${borderRadius ?? '8px'} !important;
        height: 100% !important;
      }
    }

    .ant-upload-list-item-thumbnail {
      border-radius: ${borderRadius ?? '8px'} !important;
      padding: 0 !important;
      background: ${background ?? (backgroundImage ?? (backgroundColor || '#fff'))} !important;
      border: ${borderWidth} ${borderStyle} ${borderColor};
      border-top: ${borderTopWidth || borderWidth} ${borderTopStyle || borderStyle} ${borderTopColor || borderColor};
      border-right: ${borderRightWidth || borderWidth} ${borderRightStyle || borderStyle} ${borderRightColor || borderColor};
      border-left: ${borderLeftWidth || borderWidth} ${borderLeftStyle || borderStyle} ${borderLeftColor || borderColor};
      border-bottom: ${borderBottomWidth || borderWidth} ${borderBottomStyle || borderStyle} ${borderBottomColor || borderColor};
      box-shadow: ${boxShadow};
     
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
      max-height: calc(var(--container-max-height) - calc(${fontSize} * 4)) !important;
      min-height: calc(var(--container-min-height) - 32px) !important;
      width: calc(var(--container-width) - 32px) !important;
      max-width: calc(var(--container-max-width) - 32px) !important;
      min-width: calc(var(--container-min-width) - 32px) !important;
    }

    .ant-upload-drag:hover:not(.ant-upload-disabled)  {
      border-color: ${token.colorPrimary} !important;
      }

        .${prefixCls}-upload {
            ${(layout && !isDragger) && 'width: var(--thumbnail-width) !important;'};
            ${(layout && !isDragger) && 'height: var(--thumbnail-height) !important'};
            border-radius: ${borderRadius ?? '8px'} !important;
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
          padding: 0;
          *{
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
          padding: 2px !important; /*to remove scroller*/
          --ant-margin-xs: ${gap ?? '8px'} !important;
          overflow-y: auto;
        }
          
        .ant-upload-list-item-uploading {
          display: none;
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

  const antPreviewDownloadIcon = cx("ant-preview-download-icon", css`
      background: #0000001A;
      font-size: 24px;
      padding: 8px;
      border-radius: 100px;
      :hover {
        color: #fff;
      }
    `);

    const thumbnailControls = cx("thumbnail-controls", css`
       width: 90px !important;   
       height: 90px !important;
       object-fit: cover;
       border-radius: 8px;
    `);

    const overlayThumbnailControls = cx("overlay-thumbnail-controls", css`
      position: absolute;
      top: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.6);
      height: 100%;
      width:100%;
      opacity: 0;
      border-radius: 8px;
      transition: opacity 0.3s ease;
      display: flex;
      justify-content: center;
      align-items: center;
      &:hover {
       opacity: 1;
      }
    `);

  return {
    shaStoredFilesRenderer,
    storedFilesRendererBtnContainer,
    storedFilesRendererNoFiles,
    antUploadDragIcon,
    antPreviewDownloadIcon,
    thumbnailControls,
    overlayThumbnailControls
  };
});