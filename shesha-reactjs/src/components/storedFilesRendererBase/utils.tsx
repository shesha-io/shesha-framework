import {
  StoredFileReplacementDto,
  StoredFileVersionInfoDto,
  useStoredFileGetFileVersions,
  useStoredFileGetReplacementHistory
} from '@/apis/storedFile';
import { ConfigurableForm, DateDisplay } from '@/components';
import { listType } from '@/designer-components/attachmentsEditor/attachmentsEditor';
import { FormIdentifier } from '@/providers/form/models';
import { IDownloadFilePayload, IStoredFile } from '@/providers/storedFiles/contexts';
import { HistoryOutlined } from '@ant-design/icons';
import { Button, Popover, Skeleton, Typography } from 'antd';
import filesize from 'filesize';
import React, { FC } from 'react';

const { Text } = Typography;

export interface IFileVersionsButtonProps {
  fileId: string;
  onDownload: (versionNo: number, fileName: string) => void;
  versionDownloadFile: (payload: IDownloadFilePayload) => void;
}

export interface IExtraContentProps {
  file: IStoredFile;
  formId?: FormIdentifier;
}


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



export const getListTypeAndLayout = (
  type: listType | undefined,  isDragger: boolean
): 'text' | 'picture' | 'picture-card' => {
  return type === 'text' || !type || isDragger ? 'text' : 'picture-card';
};


export interface IFetchedFileResult {
  /** The blob URL for the fetched file. Must be revoked when no longer needed. */
  url: string;
  /** Cleanup function to revoke the blob URL and free memory */
  revoke: () => void;
}

export const createFetchStoredFile = (httpHeaders: Record<string, string>) => {
  return async (url: string): Promise<IFetchedFileResult> => {
    const response = await fetch(`${url}&skipMarkDownload=true`, {
      headers: { ...httpHeaders, 'Content-Type': 'application/octet-stream' },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
    }
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    return {
      url: blobUrl,
      revoke: () => URL.revokeObjectURL(blobUrl),
    };
  };
};

export const FileVersionsButton: FC<IFileVersionsButtonProps> = ({ fileId, onDownload, versionDownloadFile }) => {
  const {
    loading: loadingVersions,
    refetch: fetchVersions,
    data: versionsData,
  } = useStoredFileGetFileVersions({
    fileId,
    lazy: true,
  });

  const {
    loading: loadingReplacements,
    refetch: fetchReplacements,
    data: replacementsData,
  } = useStoredFileGetReplacementHistory({
    fileId,
    lazy: true,
  });


  const versions = versionsData?.result;
  const replacements = replacementsData?.result;

  // Combine and sort versions and replacements into a unified history
  // Current file versions first (sorted by version number descending - highest first)
  // Then replaced files (sorted by replacement date descending - most recent first)
  const unifiedHistory = React.useMemo(() => {
    const historyItems: Array<{
      type: 'version' | 'replacement';
      data: StoredFileVersionInfoDto | StoredFileReplacementDto;
      sortKey: number;
    }> = [];

    // Add current file versions with their version numbers as sort key (higher version = higher sort key)
    if (versions && versions.length > 0) {
      versions.forEach(version => {
        historyItems.push({
          type: 'version',
          data: version,
          sortKey: version.versionNo ?? 0,
        });
      });
    }

    // Add replaced files with negative sort keys (so they appear after versions)
    // Use negative of index to maintain order (most recent first)
    if (replacements && replacements.length > 0) {
      replacements.forEach((replacement, index) => {
        historyItems.push({
          type: 'replacement',
          data: replacement,
          sortKey: -(index + 1), // Negative to ensure they come after versions
        });
      });
    }

    // Sort: versions first (by version number descending), then replacements (by index ascending = most recent first)
    return historyItems.sort((a, b) => {
      if (a.type === 'version' && b.type === 'version') {
        // Both are versions: sort by version number descending (highest first)
        return (b.data as StoredFileVersionInfoDto).versionNo! - (a.data as StoredFileVersionInfoDto).versionNo!;
      } else if (a.type === 'replacement' && b.type === 'replacement') {
        // Both are replacements: sort by replacement date descending (most recent first)
        const dateA = new Date((a.data as StoredFileReplacementDto).replacementDate || 0).getTime();
        const dateB = new Date((b.data as StoredFileReplacementDto).replacementDate || 0).getTime();
        return dateB - dateA;
      } else {
        // Versions always come before replacements
        return a.type === 'version' ? -1 : 1;
      }
    });
  }, [versions, replacements]);

  if (fileId == null) return null;

  const handleVisibleChange = (visible: boolean) => {
    if (visible && !versionsData) {
      fetchVersions();
    }
    if (visible && !replacementsData) {
      fetchReplacements();
    }
  };

  const handleVersionDownloadClick = (fileVersion: StoredFileVersionInfoDto) => {
    onDownload(fileVersion.versionNo, fileVersion.fileName);
  };

  const handleReplacementDownloadClick = (replacement: StoredFileReplacementDto) => {
    if(replacement.replacedFileId) {
      versionDownloadFile({fileId: replacement.replacedFileId, versionNo: null, fileName: replacement.replacedFileName });
    }
  };

  const isLoading = loadingVersions || loadingReplacements;

  const content = (
    <Skeleton loading={isLoading}>
      <div style={{ maxWidth: '400px' }}>
        {/* Show unified version history */}
        {unifiedHistory.length > 0 && (
          <>
            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
              {unifiedHistory.map((item, i) => {
                // Calculate version number using index (highest version number first)
                const versionNumber = unifiedHistory.length - i;
                
                if (item.type === 'version') {
                  const version = item.data as StoredFileVersionInfoDto;
                  return (
                    <li key={`version-${version.versionNo ?? i}`}>
                      <strong>Version {versionNumber}</strong> Uploaded{' '}
                      {version.dateUploaded && <DateDisplay date={version.dateUploaded} />} by {version.uploadedBy}
                      <br />
                      <Button
                        type="link"
                        style={{
                          padding: 0,
                          height: 'auto',
                          whiteSpace: 'normal',
                          textAlign: 'left',
                          wordBreak: 'break-word'
                        }}
                        onClick={() => handleVersionDownloadClick(version)}
                      >
                        {version.fileName} ({filesize(version.size || 0)})
                      </Button>
                    </li>
                  );
                } else {
                  const replacement = item.data as StoredFileReplacementDto;
                  return (
                    <li key={`replacement-${replacement.id ?? i}`}>
                      <strong>Version {versionNumber}</strong> Replaced on{' '}
                      {replacement.replacementDate && <DateDisplay date={replacement.replacementDate} />}
                      <br />
                      <Button
                        type="link"
                        style={{
                          padding: 0,
                          height: 'auto',
                          whiteSpace: 'normal',
                          textAlign: 'left',
                          wordBreak: 'break-word'
                        }}
                        onClick={() => handleReplacementDownloadClick(replacement)}
                      >
                        {replacement.replacedFileName} ({filesize(replacement.replacedFileSize || 0)})
                      </Button>
                    </li>
                  );
                }
              })}
            </ul>
          </>
        )}

        {unifiedHistory.length === 0 && (
          <Text type="secondary">No history available</Text>
        )}
      </div>
    </Skeleton>
  );

  return (
    <Popover content={content} title="Version History" trigger="click" onOpenChange={handleVisibleChange}>
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
