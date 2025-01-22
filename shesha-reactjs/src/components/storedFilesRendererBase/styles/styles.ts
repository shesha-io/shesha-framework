import { createStyles } from '@/styles';

export const useStyles = createStyles(({ token, css, cx, prefixCls }, { borderSize, borderColor, borderType, fontColor, fontSize, width, height, thumbnailHeight, borderRadius, thumbnailWidth, layout, gap, hideFileName, isDragger }) => {
  const uploadListMaxHeight = "80px"; // @sha-upload-list-max-height

  const storedFilesRendererBtnContainer = "stored-files-renderer-btn-container";
  const storedFilesRendererNoFiles = "stored-files-renderer-no-files";

  const antUploadDragIcon = `${prefixCls}-upload-drag-icon`;
  const shaStoredFilesRenderer = cx("sha-stored-files-renderer", css`
    --thumbnail-width: ${thumbnailWidth ?? '101px'};
    --thumbnail-height: ${thumbnailHeight ?? '101px'};
    --font-size: ${fontSize ?? '14px'};
    --ant-font-size: ${fontSize ?? '14px'} important;
    --ant-margin-xs: ${gap ?? '8px'} !important;
    --width: ${width};
    --height: ${height};

    max-width: ${width};
    max-height: ${height ?? 'max-content'};

    .ant-upload:not(.ant-upload-disabled) {
          .icon {
            color: ${token.colorPrimary} !important;
        };
    }
    
    .ant-upload-list-item {
      --ant-line-width: 0px !important;
      --ant-padding-xs: 0px !important;

      :before {
        position: relative;
        top: 0;
        width: var(--thumbnail-width, 101px) !important;
        border-radius: ${borderRadius ?? '8px'} !important;
        height: calc(var(--thumbnail-height, 101px) + var(--font-size, 16px) + 5px)) !important;
      }

    }

    .ant-upload-list-item-thumbnail {
      width: var(--thumbnail-width, 101px) !important;
      height: var(--thumbnail-height, 101px) !important;
      border: ${borderSize ?? '1px'} ${borderType ?? 'solid'} ${borderColor ?? token.colorPrimary};
      border-radius: ${borderRadius ?? '8px'} !important;
      padding: 0 !important;
      
      img {
        width: var(--thumbnail-width, 101px) !important;
        height: var(--thumbnail-height, 101px) !important;
        border-radius: ${borderRadius ?? '8px'} !important;
        object-fit: cover !important;
       }
      .ant-image {
        border-radius: ${borderRadius ?? '8px'} !important;
      }
    }

    .ant-upload-list-item-name {
      display: ${hideFileName ? 'none !important' : 'block'};
      color: ${fontColor ?? token.colorPrimary};
      padding: 0 8px !important; 
      width: ${(layout && thumbnailWidth) ?? '101px'} !important;
    }

    .ant-upload-drag:hover:not(.ant-upload-disabled)  {
      border-color: ${token.colorPrimary} !important;
      }

        .${prefixCls}-upload {
            ${(layout && !isDragger) && 'width: var(--thumbnail-width) !important;'};
            ${(layout && !isDragger) && 'height: var(--thumbnail-height) !important'};
            align-items: center;

          &.${prefixCls}-upload-btn {
            padding: 8px 0;
      
            .${prefixCls}-upload-drag-icon {
              margin: unset;
            }
      
            .${storedFilesRendererNoFiles} {
              margin-bottom: 6px;
            }
          }
        }
      
        .${storedFilesRendererBtnContainer} {
          display: flex;
          margin-top: 4px;
          justify-content: flex-end;
        }
      
        .${prefixCls}-upload-list {
          overflow-y: auto;
          gap: ${gap ?? '10px'};
          max-height: ${height ?? `calc(${uploadListMaxHeight}  + 32px)`};
          width: 100%;
        }

        .ant-upload-list-text {
          height: 100% !important;
          max-height: calc(var(--height, 101px) + 32px) !important;
        }
    `);

  const shaStoredFilesRendererHorizontal = cx("sha-stored-files-renderer-horizontal", css` 
    .${prefixCls}-upload-list {
          display: flex !important;
          flex-wrap: nowrap !important;
          flex-direction: row !important;
          flex-shrink: 0 !important;
          overflow-x: auto;
          align-items: center !important;
      }

      .ant-upload-list-item-container {
        display: inline-block !important;
        height: calc(var(--thumbnail-height, 101px) + var(--font-size, 16px) + 5px) !important;
    }
    `);

  const shaStoredFilesRendererVertical = cx("sha-stored-files-renderer-horizontal", css` 
    .${prefixCls}-upload-list {
          display: flex !important;
          flex-direction: column !important;
          flex-wrap: nowrap !important;
          padding: 0 ${borderSize ?? '2px'} !important;
          height: calc(var(--thumbnail-height, 101px) * 1.3) !important;
        }
          
    .ant-upload-list-item-container {
      display: flex !important;
      flex-direction: column !important;
      justify-content: center !important;
      height: calc(var(--thumbnail-height, 101px) + var(--font-size, 16px) + 5px) !important;
    }
    `);

  const shaStoredFilesRendererGrid = cx("sha-stored-files-renderer-horizontal", css` 
    .${prefixCls}-upload-list {
      align-items: center;
      padding-bottom: 5px;
          .${prefixCls}-upload-list-item {
            width: ${thumbnailWidth ?? '101px'} !important;
            height: ${thumbnailHeight ?? '101px'} !important;
          }
        }

      .ant-upload-list-item-container {
        display: flex !important;
        flex-direction: column !important;
        justify-content: center !important;
        width: ${thumbnailWidth ?? '101px'} !important;
        height: calc(var(--thumbnail-height, 101px) + var(--font-size, 16px) + 5px) !important;
    }
    `);

  return {
    shaStoredFilesRenderer,
    shaStoredFilesRendererHorizontal,
    shaStoredFilesRendererVertical,
    shaStoredFilesRendererGrid,
    storedFilesRendererBtnContainer,
    storedFilesRendererNoFiles,
    antUploadDragIcon
  };
});