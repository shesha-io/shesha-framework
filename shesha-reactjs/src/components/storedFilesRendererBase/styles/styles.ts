import { createStyles } from '@/styles';

export const useStyles = createStyles(({ token, css, cx, prefixCls }, { borderSize, borderColor, borderType, fontColor, fontSize, width, height, thumbnailHeight, borderRadius, thumbnailWidth, layout, hideFileName }) => {
  const uploadListMaxHeight = "max-content"; // @sha-upload-list-max-height

  const storedFilesRendererBtnContainer = "stored-files-renderer-btn-container";
  const storedFilesRendererNoFiles = "stored-files-renderer-no-files";

  const antUploadDragIcon = `${prefixCls}-upload-drag-icon`;
  const shaStoredFilesRenderer = cx("sha-stored-files-renderer", css`

    max-width: ${width};
    max-height: ${height};

    .anticon anticon-file-pdf {
    --ant-color-text-description: red !important;
    }

    .ant-upload:not(.ant-upload-disabled) {
          .icon {
            color: ${fontColor ?? token.colorPrimary} !important;
        };
    }
    
    .ant-upload-list-item {
      height: max-content !important;
      padding: 0 !important;
      ${layout && `border-radius: ${borderRadius ?? '8px'} !important`};
      --ant-line-width: 0px !important;

      :before {
        width: ${thumbnailWidth ?? '101px'} !important; 
        height: ${thumbnailHeight ?? '101px'} !important;
      }
    }
    .ant-upload-list-item-container {
      ${layout && `width: ${thumbnailWidth ?? '101px'} !important`};
      ${layout && `height: ${thumbnailHeight ?? '101px'} !important`};
    }

    .ant-upload-list-item-name {
      display: ${hideFileName ? 'none !important' : 'block'};
      color: ${fontColor ?? token.colorPrimary};
      font-size: ${fontSize};
       width: ${(layout && thumbnailWidth) ?? '101px'} !important;
    }

    .ant-image {
      * {
          border-radius: ${borderRadius ?? '8px'} !important;
          border: ${borderSize} ${borderType} ${borderColor} !important;
      }
    }

    .ant-upload-drag:hover:not(.ant-upload-disabled)  {
      border-color: ${token.colorPrimary} !important;
    }

        .${prefixCls}-upload {
            width: ${(layout && thumbnailWidth) ?? '101px'} !important;
            height: ${(layout && thumbnailHeight) ?? '101px'} !important;
            ${layout && 'background: #ffffff !important'};
            border-radius: ${borderRadius ?? '8px'} !important;
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
          max-height: ${height ?? uploadListMaxHeight};
          ::-webkit-scrollbar {
              display: none;
          }
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
            ${layout && `width: ${thumbnailWidth ?? '101px'} !important`};
            ${layout && `height: ${thumbnailHeight ?? '101px'} !important`};
          }

          .${prefixCls}-upload-list-item {
            padding: 0;
            ${layout && `width: ${thumbnailWidth ?? '101px'} !important`};
            ${layout && `height: ${thumbnailHeight ?? '101px'} !important`};
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
          }

          .${prefixCls}-upload-list-item {
            ${layout && `width: ${thumbnailWidth ?? '101px'} !important`};
            ${layout && `height: ${thumbnailHeight ?? '101px'} !important`};
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
            width: ${thumbnailWidth ?? '101px'} !important;
            height: ${thumbnailHeight ?? '101px'} !important;
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