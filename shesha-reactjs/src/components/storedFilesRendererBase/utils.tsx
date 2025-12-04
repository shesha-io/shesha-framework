import React, { FC } from 'react';
import { Button, Popover, Skeleton } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';
import filesize from 'filesize';
import { ConfigurableForm, DateDisplay } from '@/components';
import { useStoredFileGetFileVersions, StoredFileVersionInfoDto } from '@/apis/storedFile';
import { IStoredFile } from '@/providers/storedFiles/contexts';
import { FormIdentifier } from '@/providers/form/models';
import { listType } from '@/designer-components/attachmentsEditor/attachmentsEditor';

export interface IFileVersionsButtonProps {
  fileId: string;
  onDownload: (versionNo: number, fileName: string) => void;
}

export interface IExtraContentProps {
  file: IStoredFile;
  formId?: FormIdentifier;
}


/**
 * Creates a placeholder file object for stub/preview rendering in design mode.
 *
 * @returns A mock IStoredFile with example properties
 */
export const createPlaceholderFile = (): IStoredFile => ({
  uid: 'placeholder-file-1',
  name: 'example-file.pdf',
  status: 'done',
  url: '',
  type: 'application/pdf',
  size: 1024000,
  id: 'placeholder-id',
  fileCategory: 'documents',
  temporary: false,
  userHasDownloaded: false,
});

/**
 * Determines the appropriate Ant Design Upload list type based on configuration.
 *
 * @param type - The configured list type from component props
 * @param isDragger - Whether the component is in dragger mode
 * @returns The Upload component list type to use
 */
export const getListTypeAndLayout = (
  type: listType | undefined, isDragger: boolean
): 'text' | 'picture' | 'picture-card' => {
  return type === 'text' || !type || isDragger ? 'text' : 'picture-card';
};


/**
 * Fetches a stored file and returns a blob URL for display/preview.
 *
 * **Important**: The returned URL is created via `URL.createObjectURL()`. Callers are
 * responsible for calling `URL.revokeObjectURL()` on the returned string when the URL
 * is no longer needed to prevent memory leaks.
 *
 * @param url - The file URL to fetch
 * @param httpHeaders - Optional HTTP headers to include in the request
 * @returns A Promise resolving to a blob URL (string) that can be used in img src, etc.
 * @throws {Error} If the fetch fails (non-ok response status)
 */
export const fetchStoredFile = async (
  url: string,
  httpHeaders: Record<string, string> = {}
): Promise<string> => {
  const response = await fetch(url, {
    headers: { ...httpHeaders, "Content-Type": "application/octet-stream" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export const FileVersionsButton: FC<IFileVersionsButtonProps> = ({ fileId, onDownload }) => {
  const {
    loading,
    refetch: fetchHistory,
    data: serverData,
  } = useStoredFileGetFileVersions({
    fileId,
    lazy: true,
  });

  if (fileId == null) return null;

  const handleVisibleChange = (visible: boolean) => {
    if (visible) {
      fetchHistory();
    }
  };

  const uploads = serverData?.result;

  const handleVersionDownloadClick = (fileVersion: StoredFileVersionInfoDto) => {
    onDownload(fileVersion.versionNo, fileVersion.fileName);
  };

  const content = (
    <Skeleton loading={loading}>
      <ul>
        {uploads &&
          uploads.map((item, i) => (
            <li key={item.versionNo ?? i}>
              <strong>Version {i + 1}</strong> Uploaded{' '}
              {item.dateUploaded && <DateDisplay>{item.dateUploaded}</DateDisplay>} by {item.uploadedBy}
              <br />
              <Button type="link" onClick={() => handleVersionDownloadClick(item)}>
                {item.fileName} ({filesize(item.size)})
              </Button>
            </li>
          ))}
      </ul>
    </Skeleton>
  );

  return (
    <Popover content={content} title="History" trigger="hover" onOpenChange={handleVisibleChange}>
      <Button size="small" icon={<HistoryOutlined />} title="View history" />
    </Popover>
  );
};

export const ExtraContent: FC<IExtraContentProps> = ({ file, formId }) => {
  if (!formId) {
    return null;
  }

  return <ConfigurableForm formId={formId} mode="readonly" initialValues={file} />;
};
