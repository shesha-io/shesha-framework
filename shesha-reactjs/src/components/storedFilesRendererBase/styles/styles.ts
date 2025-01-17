import { createStyles } from '@/styles';

export const useStyles = createStyles(({ token, css, cx, prefixCls }, { borderSize, borderColor, borderType, fontColor, fontSize, width, height, maxHeight, pictureHeight, pictureRadius, pictureWidth, layout }) => {
  const uploadListMaxHeight = "max-content"; // @sha-upload-list-max-height

  const storedFilesRendererBtnContainer = "stored-files-renderer-btn-container";
  const storedFilesRendererNoFiles = "stored-files-renderer-no-files";

  const antUploadDragIcon = `${prefixCls}-upload-drag-icon`;
  const shaStoredFilesRenderer = cx("sha-stored-files-renderer", css`

    width: ${width};
    height: ${height};

     --ant-line-width: ${borderSize};
     --ant-line-type: ${borderType};
     --ant-color-border: ${borderColor};
    .ant-upload:not(.ant-upload-disabled) {
          .icon {
            color: ${fontColor ?? token.colorPrimary} !important
        };
    }
    
    .ant-upload-list-item-container {
      width: ${pictureWidth ?? '101px'} !important;
      height: ${pictureHeight ?? '101px'} !important;
    }

    .ant-upload-list-item-name {
      color: ${fontColor ?? token.colorPrimary};
    }

    .ant-upload-drag:hover:not(.ant-upload-disabled)  {
      border-color: ${token.colorPrimary} !important;
    }

        .${prefixCls}-upload {
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
          height: ${height};
          max-height: ${height ?? uploadListMaxHeight};
        }
    `);

  const shaStoredFilesRendererHorizontal = cx("sha-stored-files-renderer-horizontal", css` 
    .${prefixCls}-upload-list {
          flex-wrap: nowrap !important;
          flex-shrink: 0 !important;
          overflow-x: auto;

          .${prefixCls}-upload {
            z-index: 10 !important;
            position: sticky !important;
            right: 0 !important;
            width: ${pictureWidth ?? '101px'} !important;
            height: ${pictureHeight ?? '101px'} !important;
          }

          .${prefixCls}-upload-list-item {
            padding: 0;
          }
        }
    `);

  const shaStoredFilesRendererVertical = cx("sha-stored-files-renderer-horizontal", css` 
    .${prefixCls}-upload-list {
          flex-direction: column !important;
          flex-wrap: nowrap !important;
          flex-shrink: 0;

          .${prefixCls}-upload {
            position: sticky !important;
            bottom: 0 !important;
            width: ${pictureWidth ?? '101px'} !important;
            height: ${pictureHeight ?? '101px'} !important;
          }

          .${prefixCls}-upload-list-item {
            width: ${pictureWidth ?? '101px'} !important;
            height: ${pictureHeight ?? '101px'} !important;
          }
        }
    `);

  const shaStoredFilesRendererGrid = cx("sha-stored-files-renderer-horizontal", css` 
    .${prefixCls}-upload-list {
          .${prefixCls}-upload {
            position: sticky !important;
            bottom: 0 !important;
          }

          .${prefixCls}-upload-list-item {
            width: ${pictureWidth ?? '101px'} !important;
            height: ${pictureHeight ?? '101px'} !important;
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