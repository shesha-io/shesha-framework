import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
  const shaPackageUploadDrag = "sha-package-upload-drag";
  const shaPackageUploadFileThumbnail = "sha-package-upload-file-thumbnail";
  const shaPackageUploadFile = cx("sha-package-upload-file", css`
        height: 66px;
        padding: 8px;
        border: 1px solid #d9d9d9;
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        
        .${shaPackageUploadFileThumbnail} {
            margin: 0 8px;
        }
  `);
  return {
    shaPackageUploadDrag,
    shaPackageUploadFileThumbnail,
    shaPackageUploadFile,
  };
});
