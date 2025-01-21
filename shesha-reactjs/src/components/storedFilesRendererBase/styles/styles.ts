import { createStyles } from '@/styles';

export const useStyles = createStyles(({ token, css, cx, prefixCls }, { borderSize, borderColor, borderType, fontColor, fontSize, width, height, thumbnailHeight, borderRadius, thumbnailWidth, layout, gap, hideFileName }) => {
  const uploadListMaxHeight = "max-content"; // @sha-upload-list-max-height

  const storedFilesRendererBtnContainer = "stored-files-renderer-btn-container";
  const storedFilesRendererNoFiles = "stored-files-renderer-no-files";

  const antUploadDragIcon = `${prefixCls}-upload-drag-icon`;
  const shaStoredFilesRenderer = cx("sha-stored-files-renderer", css`
    --thumbnail-width: ${thumbnailWidth ?? '101px'};
    --thumbnail-height: ${thumbnailHeight ?? '101px'};
    --font-size: ${fontSize ?? '14px'};
    --ant-margin-xs: ${gap ?? '8px'}

    max-width: ${width};
    max-height: ${height};

    .ant-upload:not(.ant-upload-disabled) {
          .icon {
            color: ${fontColor ?? token.colorPrimary} !important;
        };
    }
    
    .ant-upload-list-item {
      --ant-line-width: 0px !important;
      gap: ${gap ?? '10px'};

      :before {
        position: relative;
        top: 0;
        width: 100% !important;
        border-radius: ${borderRadius ?? '8px'} !important;
        height: var(--thumbnail-height, 101px) + var(--font-size, 16px) + 5px) !important;
      }
    }

    .ant-upload-list-item-container {
      display: flex !important;
      flex-direction: column !important;
      justify-content: center !important;
      width: var(--thumbnail-width, 101px) !important;
      height: calc(var(--thumbnail-height, 101px) + var(--font-size, 16px) + 5px) !important;
    }

    .ant-upload-list-item-thumbnail {
      width: var(--thumbnail-width, 101px) !important;
      height: var(--thumbnail-height, 101px) !important;
      border: ${borderSize ?? '1px'} ${borderType ?? 'solid'} ${borderColor ?? token.colorPrimary};
      border-radius: ${borderRadius ?? '8px'} !important;
      margin-bottom: 10px;
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
      font-size: ${fontSize};
      margin-top: 4px;
       width: ${(layout && thumbnailWidth) ?? '101px'} !important;
    }

    .ant-upload-drag:hover:not(.ant-upload-disabled)  {
      border-color: ${token.colorPrimary} !important;
      }

        .${prefixCls}-upload {
            ${layout && `width: ${thumbnailWidth ?? '101px'} !important`};
            ${layout && `height: ${thumbnailHeight ?? '101px'} !important`};

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
          max-height: ${height ?? uploadListMaxHeight};
          width: 100%;
          ::-webkit-scrollbar {
              display: none;
          }
        }
    `);

  const shaStoredFilesRendererHorizontal = cx("sha-stored-files-renderer-horizontal", css` 
    .${prefixCls}-upload-list {
          display: flex !important;
          flex-wrap: nowrap !important;
          flex-direction: row-reverse !important;
          flex-shrink: 0 !important;
          overflow-x: auto;
      }
    `);

  const shaStoredFilesRendererVertical = cx("sha-stored-files-renderer-horizontal", css` 
    .${prefixCls}-upload-list {
          flex-direction: column !important;
          flex-wrap: nowrap !important;
        }
    `);

  const shaStoredFilesRendererGrid = cx("sha-stored-files-renderer-horizontal", css` 
    .${prefixCls}-upload-list {

          .${prefixCls}-upload-list-item {
            width: ${thumbnailWidth ?? '101px'} !important;
            height: ${thumbnailHeight ?? '101px'} !important;
            justify-content
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
    antUploadDragIcon
  };
});