import { createStyles } from '@/styles';

export const useStyles = createStyles(({ token, css, cx, prefixCls }, { borderSize, borderColor, borderType, fontColor, fontSize, width, height, thumbnailHeight, borderRadius, thumbnailWidth, layout, gap, hideFileName, isDragger, styles }) => {
  const uploadListMaxHeight = "80px"; // @sha-upload-list-max-height

  const storedFilesRendererBtnContainer = "stored-files-renderer-btn-container";
  const storedFilesRendererNoFiles = "stored-files-renderer-no-files";

  const antUploadDragIcon = `${prefixCls}-upload-drag-icon`;
  const shaStoredFilesRenderer = cx("sha-stored-files-renderer", css`
    --thumbnail-width: ${thumbnailWidth ?? thumbnailHeight ?? '54px'};
    --thumbnail-height: ${thumbnailHeight ?? thumbnailWidth ?? '54px'};
    --ant-margin-xs: ${gap ?? '8px'} !important;
    --ant-border-radius-xs: ${borderRadius ?? '8px'} !important;
    --ant-border-radius-sm: ${borderRadius ?? '8px'} !important;
    --ant-border-radius-lg:  ${borderRadius ?? '8px'} !important;
    --container-width: ${width};
    --container-height: ${height};
      ${styles}

    .sha-stored-files-renderer {
      max-height: var(--container-height) !important;
      max-width: var(--container-width) !important;
      display: inline-block;
    }
   

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
      border: ${borderSize ?? 0} ${borderType ?? 'solid'} ${borderColor ?? token.colorPrimary} !important;

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
      color: ${fontColor ?? token.colorPrimary};
      padding: 0 8px !important;
      width: ${(layout && thumbnailWidth) ?? '54px'} !important;
      font-size: var(--font-size, 14px) !important;
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
            padding: 8px 0;
      
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
      
        .${storedFilesRendererBtnContainer} {
          display: flex;
          margin-top: 4px;
          justify-content: flex-end;
        }
      
        .${prefixCls}-upload-list {
          padding: 2px !important;
          --ant-margin-xs: ${gap ?? '8px'} !important;
          overflow-y: auto;
          max-height: ${height ?? `calc(${uploadListMaxHeight}  + 32px)`};
        }

        .ant-upload-list-item-uploading {
          display: none;
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
    height: max-content;
    width: var(--container-width) !important;
    .${prefixCls}-upload-list {
          display: flex !important;
          flex-wrap: nowrap !important;
          flex-direction: row !important;
          flex-shrink: 0 !important;
          overflow-x: auto;
          overflow-y: clip !important;
          align-items: center !important;
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

  const shaStoredFilesRendererVertical = cx("sha-stored-files-renderer-horizontal", css`
      width: max-content;
      padding: 0 ${borderSize ?? '2px'} !important;
    .${prefixCls}-upload-list {
          display: flex !important;
          flex-direction: column !important;
          flex-wrap: nowrap !important;
          padding: 0 ${borderSize ?? '2px'} !important;
          height: calc(var(--height) - 32px) !important;
        }

    .ant-upload-list-item-container {
      display: flex !important;
      flex-direction: column !important;
      justify-content: center !important;
      width: var(--thumbnail-width) !important;
      height: var(--thumbnail-height) !important;
      &.ant-upload-animate-inline-appear,
        &.ant-upload-animate-inline-appear-active,
        &.ant-upload-animate-inline {
          display: none !important;
          animation: none !important;
          transition: none !important;
        }
    }

    .stored-files-renderer-btn-container {
      justify-content: flex-start;
      .ant-btn {
        padding: 0;
      }
     }

    `);

  const shaStoredFilesRendererGrid = cx("sha-stored-files-renderer-horizontal", css` 
    max-width: var(--container-width) !important;
    max-height: var(--container-height) !important;

    .${prefixCls}-upload-list {
      align-items: center;
      padding: 2px;
      max-height: calc(var(--container-height) - 32px) !important;
          .${prefixCls}-upload-list-item {
            width: 100% !important;
            height: 100% !important;
          }
        }

      .ant-upload-list-item-container {
        display: flex !important;
        flex-direction: column !important;
        justify-content: center !important;
        width: var(--thumbnail-width) !important;
        height: var(--thumbnail-height) !important;
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