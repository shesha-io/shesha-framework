import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css, cx, token, prefixCls }) => {
    const shaUpload = "sha-upload";
    const shaUploadHasFile = "sha-upload-has-file";
    const shaUploadListItemError = "sha-upload-list-item-error";
    const shaUploadUploading = "sha-upload-uploading";
    const shaUploadHistoryControl = "sha-upload-history-control";
    const shaUploadReplaceControl = "sha-upload-replace-control";
    const shaUploadRemoveControl = "sha-upload-remove-control";
    const shaUploadListItemInfo = "sha-upload-list-item-info";

    const antUploadDragIcon = `${prefixCls}-upload-drag-icon`;
    const antUploadText = `${prefixCls}-upload-text`;
    const antUploadHint = `${prefixCls}-upload-hint`;

    const shaFileUploadContainer = cx("sha-file-upload-container", css`
        .${shaUpload} {
          &.${shaUploadHasFile} {
            .${prefixCls}-upload-select {
              position: absolute;
              top: -1000px;
              left: -1000px;
            }
      
            &.${prefixCls}-upload-drag {
              padding: unset;
              border: unset;
      
              .${prefixCls}-upload-btn {
                padding: unset;
              }
            }
          }
      
          .${prefixCls}-upload-list {
            .${shaUploadListItemError} {
              a {
                color: ${token.colorError};
              }
            }
          }
        }
      
        .${shaUploadUploading} {
          margin-right: 5px;
        }
      
        .${shaUploadHistoryControl},
        .${shaUploadReplaceControl},
        .${shaUploadRemoveControl} {
          margin-left: 5px;
        }
    `);
    return {
        shaFileUploadContainer,
        shaUpload,
        shaUploadHasFile,
        shaUploadListItemError,
        shaUploadUploading,
        shaUploadHistoryControl,
        shaUploadReplaceControl,
        shaUploadRemoveControl,
        shaUploadListItemInfo,
        antUploadDragIcon,
        antUploadText,
        antUploadHint,
    };
});