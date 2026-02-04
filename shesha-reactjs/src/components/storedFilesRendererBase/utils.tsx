import React, { FC } from 'react';
import { Button, Popover, Skeleton, Typography, UploadFile } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';
import filesize from 'filesize';
import { ConfigurableForm, DateDisplay } from '@/components';
import { useStoredFileGetFileVersions, StoredFileVersionInfoDto } from '@/apis/storedFile';
import { IStoredFile } from '@/providers/storedFiles/contexts';
import { FormIdentifier } from '@/providers/form/models';
import { listType } from '@/designer-components/attachmentsEditor/attachmentsEditor';
import { buildUrl } from '@/utils/url';

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
  type: listType | undefined, isDragger: boolean,
): 'text' | 'picture' | 'picture-card' => {
  return type === 'text' || !type || isDragger ? 'text' : 'picture-card';
};


/**
 * Result object returned by fetchStoredFile containing the object URL and cleanup function.
 */
export interface IFetchStoredFileResult {
  /** The blob URL that can be used in img src, etc. */
  url: string;
  /** Cleanup function that revokes the object URL to prevent memory leaks. Must be called when the URL is no longer needed. */
  revoke: () => void;
}

/**
 * Fetches a stored file and returns a blob URL for display/preview along with a cleanup function.
 *
 * **Important**: The returned object contains a `revoke()` function that MUST be called when
 * the URL is no longer needed to prevent memory leaks. The revoke function is safe to call
 * multiple times.
 *
 * @param url - The file URL to fetch
 * @param httpHeaders - Optional HTTP headers to include in the request
 * @returns A Promise resolving to an object containing the blob URL and revoke function
 * @throws {Error} If the fetch fails (non-ok response status)
 *
 * @example
 * ```typescript
 * const { url, revoke } = await fetchStoredFile('/api/files/123');
 * try {
 *   // Use the URL...
 *   imgElement.src = url;
 * } finally {
 *   // Always clean up
 *   revoke();
 * }
 * ```
 */
export const fetchStoredFile = async (
  url: string,
  httpHeaders: Record<string, string> = {},
): Promise<IFetchStoredFileResult> => {
  const fetchUrl = buildUrl(url, { skipMarkDownload: 'true' });
  const response = await fetch(fetchUrl, {
    headers: { ...httpHeaders },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  let revoked = false;
  const revoke = (): void => {
    if (!revoked) {
      URL.revokeObjectURL(objectUrl);
      revoked = true;
    }
  };

  return { url: objectUrl, revoke };
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

  const handleVisibleChange = (visible: boolean): void => {
    if (visible) {
      fetchHistory();
    }
  };

  const uploads = serverData?.success ? serverData.result : [];

  const handleVersionDownloadClick = (fileVersion: StoredFileVersionInfoDto): void => {
    if (fileVersion.versionNo != null && fileVersion.fileName != null) {
      onDownload(fileVersion.versionNo, fileVersion.fileName);
    }
  };

  const content = (
    <Skeleton loading={loading}>
      <ul>
        {uploads &&
          uploads.map((item, i) => (
            <li key={item.versionNo ?? `version-${i}`}>
              <strong>Version {item.versionNo}</strong> Uploaded{' '}
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

const { Text } = Typography;

// Helper component to render file name with ellipsis and title
export const FileNameDisplay: FC<{ file: UploadFile; className?: string }> = ({ file, className }) => {

  const sizeStr = file?.size ? filesize(file?.size) : null;
  const title = sizeStr ? `${file.name} (${sizeStr})` : file.name;

  return (
    <div className={className} style={{ overflow: 'hidden', flex: 1 }}>
      <Text
        ellipsis
        title={title}
        style={{ display: 'block' }}
      >
        {file.name}
      </Text>
    </div>
  );
};