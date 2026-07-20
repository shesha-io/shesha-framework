import {
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  PictureOutlined,
  SyncOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { App, Button, Space, Upload, UploadFile } from 'antd';
import { Image } from 'antd/lib';
import { UploadProps } from 'antd/lib/upload/Upload';
import filesize from 'filesize';
import React, { CSSProperties, FC, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { ListType } from '@/designer-components/attachmentsEditor/attachmentsEditor';
import { getFileIcon, isImageType } from '@/icons/fileIcons';
import { useFileUploadState, useFileUpload, useTheme } from '@/providers';
import { useHttpClient } from '@/providers/sheshaApplication/publicApi/http/hooks';
import { fetchStoredFile, resolveThumbnailSize } from '@/components/storedFilesRendererBase/utils';
import { isFileTypeAllowed } from '@/utils/fileValidation';
import FileVersionsPopup from './fileVersionsPopup';
import { DraggerStub } from './stubs';
import { useStyles } from './styles/styles';
import { isDefined, isNotNullOrWhiteSpace, isNullOrWhiteSpace } from '@/utils/nullables';
import { getFileExtension, storedFileModel2UploadFile } from '@/utils/storedFile/utils';
import { StoredFileModel, STORED_FILE_URLS } from '@/utils/storedFile/models';
import { buildUrl } from '@/utils';
const { Dragger } = Upload;

export interface IFileUploadProps {
  allowUpload?: boolean | undefined;
  allowReplace?: boolean | undefined;
  allowDelete?: boolean | undefined;
  callback?: () => void;
  isStub?: boolean | undefined;
  allowedFileTypes?: string[] | undefined;
  isDragger?: boolean | undefined;
  listType?: ListType | undefined;
  thumbnailWidth?: string | undefined;
  thumbnailHeight?: string | undefined;
  borderRadius?: number | undefined;
  hideFileName?: boolean | undefined;
  styles?: CSSProperties | undefined;
  type?: string | undefined;
}

export const FileUpload: FC<IFileUploadProps> = ({
  type = "",
  allowUpload = true,
  allowReplace = true,
  allowDelete = true,
  callback,
  isStub = false,
  allowedFileTypes = [],
  isDragger = false,
  listType = 'text',
  thumbnailWidth,
  thumbnailHeight,
  hideFileName = false,
  styles: stylesProp,
}) => {
  const {
    downloadFile,
    deleteFile,
    uploadFile,
  } = useFileUpload();
  const fileInfo = useFileUploadState();
  const uploadFileModel = useMemo<UploadFile | undefined>(() => fileInfo ? storedFileModel2UploadFile(fileInfo) : undefined, [fileInfo]);

  const { styles } = useStyles({
    style: stylesProp,
    model: {
      layout: listType === 'thumbnail' && !isDragger,
      isDragger,
      hideFileName,
      listType,
    },
  });
  const { theme } = useTheme();
  const appPrimaryColor = typeof theme.application?.primaryColor === 'string' ? theme.application.primaryColor : undefined;
  const uploadDraggerSpanRef = useRef<HTMLSpanElement>(null);
  const hiddenUploadInputRef = useRef<HTMLInputElement>(null);
  const { message, modal } = App.useApp();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState({ url: '', uid: '', name: '' });
  const httpClient = useHttpClient();
  // Stable key for a file that survives the temporary uid -> persisted id transition on upload
  // (the model's uid changes to the server id once persisted), so blob caches don't get mixed up.
  const fileBlobKey = (file: { name: string; size?: number | null }): string => `${file.name}_${file.size ?? 0}`;
  // Cache of locally created blob URLs for the original uploaded image, keyed by fileBlobKey.
  const uploadedFileBlobUrls = useRef<Map<string, string>>(new Map());
  // Track pending file uploads to cache their blob URLs
  const pendingFileBlob = useRef<{ file: File; blobUrl: string } | null>(null);
  // Cache of fetched full-resolution preview blob URLs, keyed by file id. Lets repeat previews
  // of the same file reuse the already-downloaded image instead of hitting the server again.
  const previewImageCache = useRef<Map<string, string>>(new Map());
  const downloadUrl = buildUrl(fileInfo?.url ?? '');
  // The backend returns a degenerate 1x1 thumbnail when width/height are omitted, so always send
  // concrete dimensions derived from the configured thumbnail size (with a safe default).
  const thumbnailUrl = buildUrl(STORED_FILE_URLS.DOWNLOAD_THUMBNAIL, {
    id: fileInfo?.id ?? '',
    width: resolveThumbnailSize(thumbnailWidth),
    height: resolveThumbnailSize(thumbnailHeight),
    fitOption: 1, // 1: FitToHeight
  });

  // Clean up blob URLs on unmount
  useEffect(() => {
    const blobUrlsMap = uploadedFileBlobUrls.current;
    const previewCache = previewImageCache.current;
    const thumbnailCache = fetchedThumbnails.current;

    return () => {
      blobUrlsMap.forEach((blobUrl) => {
        URL.revokeObjectURL(blobUrl);
      });
      blobUrlsMap.clear();

      if (pendingFileBlob.current) {
        URL.revokeObjectURL(pendingFileBlob.current.blobUrl);
        pendingFileBlob.current = null;
      }

      previewCache.forEach((blobUrl) => {
        URL.revokeObjectURL(blobUrl);
      });
      previewCache.clear();

      thumbnailCache.forEach((blobUrl) => {
        URL.revokeObjectURL(blobUrl);
      });
      thumbnailCache.clear();
    };
  }, []);

  // Watch for new file uploads and cache their blob URLs, and prune blobs from any previous file
  // (e.g. after replace/delete + re-upload) so a stale image is never shown for the current file.
  useEffect(() => {
    const isUploading = fileInfo?.status === 'uploading';

    if (isUploading && pendingFileBlob.current) {
      const { file, blobUrl } = pendingFileBlob.current;
      uploadedFileBlobUrls.current.set(fileBlobKey(file), blobUrl);
      pendingFileBlob.current = null;
    }

    // Local original-image blob to keep: only the one matching the current file's name/size.
    const liveBlobKey = isDefined(fileInfo) ? fileBlobKey(fileInfo) : undefined;
    // Server-derived blobs (preview + fetched thumbnail) are keyed by file id. While a file is
    // (re)uploading its previous server content is stale, so don't preserve any id-keyed blobs
    // in that case; they'll be re-fetched once the new version is persisted.
    const livePreviewId = isUploading ? undefined : fileInfo?.id;

    uploadedFileBlobUrls.current.forEach((url, key) => {
      if (key !== liveBlobKey) {
        URL.revokeObjectURL(url);
        uploadedFileBlobUrls.current.delete(key);
      }
    });
    previewImageCache.current.forEach((url, id) => {
      if (id !== livePreviewId) {
        URL.revokeObjectURL(url);
        previewImageCache.current.delete(id);
      }
    });
    fetchedThumbnails.current.forEach((url, id) => {
      if (id !== livePreviewId) {
        URL.revokeObjectURL(url);
        fetchedThumbnails.current.delete(id);
      }
    });
  }, [fileInfo]);

  // Thumbnail image shown in thumbnail mode. For files just uploaded in this session we
  // already have a local blob URL (used directly); for persisted files the thumbnail endpoint
  // requires auth, so the effect below fetches it through the httpClient and swaps in the
  // resulting blob URL rather than pointing <Image> at the raw endpoint (which would fail).
  // Intentionally read the blob cache ref during render; it is keyed by a stable name/size key
  // and only mutated alongside fileInfo changes, so the value stays consistent for a given file.
  const cachedThumbnailBlobUrl = isDefined(fileInfo) ? uploadedFileBlobUrls.current.get(fileBlobKey(fileInfo)) : undefined;
  // Server-fetched thumbnail for the current persisted file. Kept in state (the render source)
  // and tagged with the file id so a previous file's thumbnail is never shown after
  // replace/delete + re-upload. The ref Map mirrors fetched blobs for revocation on unmount.
  const [fetchedThumbnail, setFetchedThumbnail] = useState<{ id: string; url: string } | null>(null);
  const fetchedThumbnails = useRef<Map<string, string>>(new Map());
  const fetchedThumbnailUrl = fetchedThumbnail?.id === fileInfo?.id ? (fetchedThumbnail?.url ?? '') : '';
  const imageUrl = cachedThumbnailBlobUrl ?? fetchedThumbnailUrl;

  useEffect(() => {
    // Thumbnails are only displayed in thumbnail mode, so don't download them otherwise. Also skip
    // the server fetch for transient files, non-images, or when a local blob already exists.
    if (listType !== 'thumbnail' || isNotNullOrWhiteSpace(cachedThumbnailBlobUrl) || isNullOrWhiteSpace(fileInfo?.id) || !isImageType(fileInfo.type ?? '')) {
      return undefined;
    }

    const fileId = fileInfo.id;
    // Reuse a previously fetched thumbnail for this file instead of downloading again.
    const cached = fetchedThumbnails.current.get(fileId);
    if (isNotNullOrWhiteSpace(cached)) {
      setFetchedThumbnail({ id: fileId, url: cached });
      return undefined;
    }

    // No cached thumbnail for this file (new or just invalidated by a replace): clear any stale
    // displayed thumbnail so a revoked/old blob isn't shown while the fresh one is fetched.
    setFetchedThumbnail((prev) => (prev?.id === fileId ? null : prev));

    let isCancelled = false;
    const loadThumbnail = async (): Promise<void> => {
      try {
        const { url } = await fetchStoredFile(httpClient, thumbnailUrl);
        if (isCancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        fetchedThumbnails.current.set(fileId, url);
        setFetchedThumbnail({ id: fileId, url });
      } catch (error) {
        console.error('Failed to fetch thumbnail', error);
      }
    };
    loadThumbnail().catch((error) => console.error('Failed to fetch thumbnail', error));

    return () => {
      isCancelled = true;
    };
  }, [fileInfo, thumbnailUrl, httpClient, cachedThumbnailBlobUrl, listType]);

  const onCustomRequest: UploadProps['customRequest'] = ({ file, onSuccess, onError }): void => {
    if (file instanceof File) {
      // For image files, create a blob URL directly from the File object to avoid
      // an immediate server round-trip for the thumbnail right after upload
      const fileExt = `.${getFileExtension(file).toLowerCase()}`;

      if (isImageType(fileExt)) {
        const blobUrl = URL.createObjectURL(file);
        // Store pending blob URL - it will be cached when fileInfo updates to 'uploading'
        pendingFileBlob.current = { file, blobUrl };
      }

      uploadFile({ file }).then(() => {
        callback?.();
        onSuccess?.(null);
      }).catch((error: unknown) => {
        // Clean up pending blob URL if upload failed
        if (pendingFileBlob.current) {
          URL.revokeObjectURL(pendingFileBlob.current.blobUrl);
          pendingFileBlob.current = null;
        }
        console.error('Failed to upload file', error);
        onError?.(error instanceof Error ? error : new Error(String(error)));
      });
    } else {
      const error = new Error('File is not an instance of File. Please check the file object.');
      onError?.(error);
    }
  };

  const onReplaceClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>): void => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragger) {
      if (hiddenUploadInputRef.current) {
        hiddenUploadInputRef.current.click();
      }
    } else {
      if (uploadDraggerSpanRef.current) {
        uploadDraggerSpanRef.current.click();
      }
    }
  };

  const showDeleteConfirmation = (): void => {
    modal.confirm({
      title: 'Delete Attachment',
      content: 'Are you sure you want to delete this attachment?',
      okText: 'Yes',
      cancelText: 'Cancel',
      okType: 'danger',
      onOk: () => {
        deleteFile().catch((error) => {
          console.error('Failed to delete file', error);
          throw error;
        });
      },
    });
  };

  const onDeleteClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>): void => {
    e.preventDefault();
    showDeleteConfirmation();
  };

  const onPreview = (): void => {
    if (!fileInfo)
      return;

    // For a freshly uploaded file we already have a local blob URL of the original image,
    // so reuse it instead of downloading the file again from the server.
    const cachedBlobUrl = uploadedFileBlobUrls.current.get(fileBlobKey(fileInfo));
    if (isNotNullOrWhiteSpace(cachedBlobUrl)) {
      setPreviewImage({ url: cachedBlobUrl, uid: fileInfo.id ?? '', name: fileInfo.name });
      setPreviewOpen(true);
      return;
    }

    // Persisted file: the download endpoint requires auth headers, so fetch it through the
    // httpClient (which carries the backend base URL + auth) and preview the resulting blob URL
    // rather than pointing <Image> at the raw endpoint, which would fail.
    if (isNullOrWhiteSpace(fileInfo.id)) {
      message.error('Preview URL not available');
      return;
    }

    // Reuse a previously downloaded full image for this file to avoid re-hitting the server.
    const previouslyFetched = previewImageCache.current.get(fileInfo.id);
    if (isNotNullOrWhiteSpace(previouslyFetched)) {
      setPreviewImage({ url: previouslyFetched, uid: fileInfo.id, name: fileInfo.name });
      setPreviewOpen(true);
      return;
    }

    const fileId = fileInfo.id;
    setPreviewImage({ url: '', uid: fileId, name: fileInfo.name });
    setPreviewOpen(true);

    fetchStoredFile(httpClient, downloadUrl)
      .then(({ url: fullImageUrl }) => {
        previewImageCache.current.set(fileId, fullImageUrl);
        setPreviewImage((current) => (current.uid === fileId ? { ...current, url: fullImageUrl } : current));
      })
      .catch((error: unknown) => {
        console.error('Failed to fetch image for preview', error);
        message.error('Failed to load preview');
      });
  };

  const fileControls = (color: string | undefined): ReactNode => {
    return isDefined(fileInfo)
      ? (
        <Space>
          {!isNullOrWhiteSpace(fileInfo.id) && (
            <a style={{ color: color }}>
              <FileVersionsPopup fileId={fileInfo.id} />
            </a>
          )}
          {allowReplace && (
            <a onClick={onReplaceClick} style={{ color: color }}>
              <SyncOutlined title="Replace" />
            </a>
          )}
          {allowDelete && (
            <a onClick={(e) => onDeleteClick(e)} style={{ color: color }}>
              <DeleteOutlined title="Remove" />
            </a>
          )}
          {listType === 'thumbnail' &&
            (isImageType(fileInfo.type ?? "") ? (
              <a onClick={onPreview} style={{ color: color }}>
                <EyeOutlined title="Preview" />
              </a>
            ) : (
              hideFileName && !isNullOrWhiteSpace(fileInfo.id) && (
                <a
                  onClick={() => {
                    if (isDefined(fileInfo.id))
                      void downloadFile({ fileId: fileInfo.id, fileName: fileInfo.name });
                  }}
                  style={{ color: color }}
                >
                  <DownloadOutlined title="Download" />
                </a>
              )
            ))}
        </Space>
      )
      : undefined;
  };

  const iconRender = (fileInfo: StoredFileModel): React.JSX.Element => {
    const { type, name } = fileInfo;
    if (isImageType(type ?? "")) {
      if (listType === 'thumbnail' && !isDragger) {
        return <Image {...(isNotNullOrWhiteSpace(imageUrl) ? { src: imageUrl } : {})} alt={name} preview={false} className={styles.thumbnailControls} />;
      }
    }
    return getFileIcon(type ?? "");
  };

  const styledfileControls = (): ReactNode =>
    fileInfo && (
      <div className={styles.styledFileControls}>
        {iconRender(fileInfo)}
        <div className={styles.overlayThumbnailControls} style={{ fontSize: '15px' }}>
          {fileControls('#fff')}
        </div>
      </div>
    );

  const renderFileItem = (file: UploadFile): React.JSX.Element => {
    const showThumbnailControls = listType === 'thumbnail';
    const showTextControls = listType === 'text';

    return (
      <div>
        {showThumbnailControls && styledfileControls()}
        {hideFileName ? null : (
          <span title={file.name}>
            <Space>
              <div className="thumbnail-item-name">
                {(listType === 'text') && (
                  <a
                    style={{ marginRight: '5px' }}
                    onClick={isImageType(file.type ?? "")
                      ? onPreview
                      : () => {
                        if (!isNullOrWhiteSpace(file.id))
                          void downloadFile({ fileId: file.id, fileName: file.name });
                      }}
                  >
                    {getFileIcon(file.type ?? "")} {`${file.name} (${filesize(isDefined(file.size) ? file.size : 0)})`}
                  </a>
                )}
                {showTextControls && fileControls(appPrimaryColor)}
              </div>
            </Space>
          </span>
        )}
      </div>
    );
  };

  const fileProps: UploadProps<unknown> = {
    name: 'file',
    disabled: !allowUpload,
    accept: allowedFileTypes.join(','),
    multiple: false,
    fileList: isDefined(uploadFileModel) && fileInfo?.status !== 'error' ? [uploadFileModel] : [],
    maxCount: 1,
    // ...(!isDragger && listType !== 'thumbnail' && isDefined(stylesProp) ? { style: stylesProp } : {}),
    customRequest: onCustomRequest,
    beforeUpload: (file) => {
      if (!isFileTypeAllowed(file.name, allowedFileTypes)) {
        message.error(`File type not allowed. Only ${allowedFileTypes.join(', ')} files are accepted.`);
        return false;
      }
      return true;
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} uploaded successfully`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} upload failed`);
      }
    },
    itemRender: (_originNode, file) => renderFileItem(file),
  };

  const showUploadButton = allowUpload;

  const uploadButton = (
    allowUpload && (
      <Button
        icon={!fileInfo || fileInfo.status === 'error' ? <UploadOutlined /> : <PictureOutlined />}
        type="link"
        disabled={!showUploadButton}
      >
        {listType === 'text' ? `(press to upload)` : null}
      </Button>
    )
  );

  const renderStub = (): React.JSX.Element => {
    if (isDragger) {
      return (
        <Dragger disabled>
          <DraggerStub styles={styles} type={type} />
        </Dragger>
      );
    }

    return (
      <>
        <div
          className={listType === 'thumbnail' ? 'ant-upload-list-item-name ant-upload-list-item-name-stub thumbnail-stub' : ''}
        >
          {uploadButton}
        </div>
        {listType === 'thumbnail' && !hideFileName ? <div className="thumbnail-item-name">File name</div> : null}
      </>
    );
  };

  const renderUploader = (): React.JSX.Element => {
    const antListType = listType === 'thumbnail' ? 'picture-card' : 'text';

    if (isDragger && allowUpload) {
      return (
        <Dragger {...fileProps}>
          <span ref={uploadDraggerSpanRef} />
          <DraggerStub styles={styles} type={type} />
        </Dragger>
      );
    }

    return (
      <div>
        <Upload {...fileProps} listType={antListType}>
          {(!fileInfo || fileInfo.status === 'error') && uploadButton}
        </Upload>
      </div>
    );
  };

  // When read-only with no file (and not in the designer stub), render nothing at all so the
  // configured border/background/placeholder of an empty component isn't shown on read-only views.
  const isEmptyReadonly = !isStub && !allowUpload && (!fileInfo || fileInfo.status === 'error');
  if (isEmptyReadonly)
    return null;

  return (
    <>
      <span className={styles.shaStoredFilesRenderer}>{isStub ? renderStub() : renderUploader()}</span>
      {previewOpen && (
        <Image
          styles={{
            root: { display: 'none' },
          }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            toolbarRender: (original) => (
              <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
                {isNotNullOrWhiteSpace(previewImage.uid) && (
                  <DownloadOutlined
                    className={styles.antPreviewDownloadIcon}
                    onClick={() => downloadFile({ fileId: previewImage.uid, fileName: previewImage.name })}
                  />
                )}
                {original}
              </div>
            ),
          }}
          {...(isNotNullOrWhiteSpace(previewImage.url) ? { src: previewImage.url } : {})}
        />
      )}

      {/* Hidden file input for replace functionality */}
      <input
        type="file"
        accept={allowedFileTypes.join(',')}
        style={{ display: 'none' }}
        ref={hiddenUploadInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            if (!isFileTypeAllowed(file.name, allowedFileTypes)) {
              message.error(`File type not allowed. Only ${allowedFileTypes.join(', ')} files are accepted.`);
              e.target.value = '';
              return;
            }

            // For image files, create a blob URL for immediate display
            const fileExt = `.${getFileExtension(file).toLowerCase()}`;

            if (isImageType(fileExt)) {
              const blobUrl = URL.createObjectURL(file);
              // Store pending blob URL - it will be cached when fileInfo updates to 'uploading'
              pendingFileBlob.current = { file, blobUrl };
            }

            uploadFile({ file }).then(() => {
              callback?.();
            }).catch((error: unknown) => {
              // Clean up pending blob URL if upload failed
              if (pendingFileBlob.current) {
                URL.revokeObjectURL(pendingFileBlob.current.blobUrl);
                pendingFileBlob.current = null;
              }
              console.error('Failed to upload file', error);
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              message.error(`Failed to upload file: ${errorMessage}`);
            });
          }
          e.target.value = '';
        }}
      />
    </>
  );
};

export default FileUpload;
