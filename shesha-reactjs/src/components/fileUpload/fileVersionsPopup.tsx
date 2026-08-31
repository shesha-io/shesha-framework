import { FC } from 'react';
import { HistoryOutlined } from '@ant-design/icons';
import { Popover, Skeleton, Button } from 'antd';
import { DateDisplay } from '@/components/';
import { useStoredFileGetFileVersions, StoredFileVersionInfoDto } from '@/apis/storedFile';
import filesize from 'filesize';
import { useFileUpload } from '@/providers';
import { isAjaxSuccessResponse } from '@/interfaces/ajaxResponse';
import { isDefined, isNotNullOrWhiteSpace, isNullOrWhiteSpace } from '@/utils/nullables';

interface IProps {
  readonly fileId: string;
  /** Class for the portalled popover, so the caller can style it alongside the component. */
  readonly popupClassName?: string | undefined;
}

export const FileVersionsPopup: FC<IProps> = ({ fileId, popupClassName }) => {
  const {
    loading: loading,
    refetch: fetchHistory,
    /* error: fetchError, */ data: serverData,
  } = useStoredFileGetFileVersions({
    fileId,
    lazy: true,
  });

  const { downloadFile } = useFileUpload();

  if (isNullOrWhiteSpace(fileId)) return null;

  const handleVisibleChange = (open: boolean): void => {
    if (open && !serverData)
      fetchHistory().catch((error) => {
        console.error('Failed to fetch history', error);
        throw error;
      });
  };

  const uploads = serverData && isAjaxSuccessResponse(serverData) ? serverData.result : undefined;

  const handleVersionDownloadClick = (fileVersion: StoredFileVersionInfoDto): void => {
    downloadFile({ fileId, versionNo: fileVersion.versionNo, fileName: fileVersion.fileName ?? "" }).catch((error) => {
      console.error('Failed to download file', error);
      throw error;
    });
  };

  const content = (
    <Skeleton loading={loading}>
      <ul>
        {uploads &&
          uploads.map((item, i) => (
            <li key={i}>
              <strong>Version {i + 1}</strong> Uploaded {isNotNullOrWhiteSpace(item.dateUploaded) && <DateDisplay>{item.dateUploaded}</DateDisplay>}{' '}
              by {item.uploadedBy}
              <br />
              <Button type="link" onClick={() => handleVersionDownloadClick(item)}>
                {item.fileName} {isDefined(item.size) && <>({filesize(item.size)})</>}
              </Button>
            </li>
          ))}
      </ul>
    </Skeleton>
  );

  return (
    <Popover
      content={content}
      title="History"
      onOpenChange={handleVisibleChange}
      {...(isNotNullOrWhiteSpace(popupClassName) ? { classNames: { root: popupClassName } } : {})}
    >
      <HistoryOutlined />
    </Popover>
  );
};

export default FileVersionsPopup;
