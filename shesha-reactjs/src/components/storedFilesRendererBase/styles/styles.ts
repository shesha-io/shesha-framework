import { createStyles } from "antd-style";

export const useStyles = createStyles(({ token, css, cx, prefixCls }) => {
    const uploadListMaxHeight = "80px"; // @sha-upload-list-max-height
    
    const storedFilesRendererBtnContainer = "stored-files-renderer-btn-container";
    const storedFilesRendererNoFiles = "stored-files-renderer-no-files";

  const antUploadDragIcon = `${prefixCls}-upload-drag-icon`;
    const shaStoredFilesRenderer = cx("sha-stored-files-renderer", css`

    .ant-upload:not(.ant-upload-disabled) {
          .icon {
            color: ${token.colorPrimary} !important
        };
    }
    .ant-upload-list-item-name {
      color: ${token.colorPrimary};
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
          height: 100%;
          max-height: ${uploadListMaxHeight};
        }

    `);
    
    return {
        shaStoredFilesRenderer,
        storedFilesRendererBtnContainer,
        storedFilesRendererNoFiles,
        antUploadDragIcon
    };
});