import { DraggerStub } from '@/components/fileUpload/stubs';
import { LayoutType, ListType } from '@/designer-components/attachmentsEditor/attachmentsEditor';
import { useFormComponentStyles } from '@/hooks/formComponentHooks';
import { getFileIcon, isImageType } from '@/icons/fileIcons';
import { IFormComponentStyles, IInputStyles, IStyleValue } from '@/providers/form/models';
import { addPx } from '@/utils/style';
import { useAvailableConstantsData } from '@/providers/form/utils';
import { STORED_FILE_URLS } from '@/utils/storedFile/models';
import { DeleteOutlined, DownloadOutlined, FileZipOutlined, LoadingOutlined, PictureOutlined, SyncOutlined, UploadOutlined } from '@ant-design/icons';
import {
  Alert,
  App,
  Button,
  ButtonProps,
  Image,
  Popconfirm,
  Popover,
  Space,
  Spin,
  Upload,
  UploadFile,
  UploadProps,
} from 'antd';
import Dragger, { DraggerProps } from 'antd/lib/upload/Dragger';
import { RcFile, UploadChangeParam } from 'antd/lib/upload/interface';
import React, { CSSProperties, FC, useCallback, useEffect, useRef, useState } from 'react';
import { isValidGuid } from '../formDesigner/components/utils';
import { useStyles } from './styles/styles';
import { ButtonGroupItemProps } from '@/providers/buttonGroupConfigurator/models';
import { ButtonGroup } from '@/designer-components/button/buttonGroup/buttonGroup';
import { FormIdentifier } from '@/providers/form/models';
import { DataContextProvider } from '@/providers/dataContextProvider';
import { FileVersionsButton, ExtraContent, PLACEHOLDER_FILE, getListTypeAndLayout, fetchStoredFile, FileNameDisplay, resolveThumbnailSize } from './utils';
import classNames from 'classnames';
import { isFileTypeAllowed } from '@/utils/fileValidation';
import { ShaIcon, IconType } from '@/components/shaIcon';
import { defaultStyles } from '@/designer-components/attachmentsEditor/utils';
import { getFileExtension } from '@/utils/storedFile/utils';
import { DownloadFileArgs, ReplaceFilePayload, StoredFileModel } from '@/utils/storedFile/models';
import { useHttpClient } from '@/providers/sheshaApplication/publicApi/http/hooks';
import { ValidationErrors } from '../validationErrors';
import { buildUrl } from '@/utils';
import { isDefined, isNotNullOrWhiteSpace, isNullOrWhiteSpace } from '@/utils/nullables';
import { isFile } from '@/utils/fileValidation';

interface IUploaderFileTypes {
  name: string;
  type: string;
}

export interface IStoredFilesRendererBaseProps extends IInputStyles {
  fileList?: StoredFileModel[] | undefined;

  uploadFile: (args: { file: File }) => Promise<void>;
  replaceFile: (args: ReplaceFilePayload) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  downloadZipFile: () => Promise<void>;
  downloadFile: (args: DownloadFileArgs) => Promise<void>;

  onChange?: ((fileList: StoredFileModel[]) => void) | undefined;
  onDownload?: ((fileList: StoredFileModel[]) => void) | undefined;

  allowUpload?: boolean | undefined;
  allowDelete?: boolean | undefined;
  allowReplace?: boolean | undefined;
  allowViewHistory?: boolean | undefined;
  customActions?: ButtonGroupItemProps[] | undefined;
  hasExtraContent?: boolean | undefined;
  extraFormSelectionMode?: 'name' | 'dynamic' | undefined;
  extraFormId?: FormIdentifier | undefined;
  extraFormType?: string | undefined;
  showDragger?: boolean | undefined;
  multiple?: boolean | undefined;
  isDownloadingFileListZip?: boolean | undefined;
  isDownloadZipSucceeded?: boolean | undefined;
  fetchFilesError?: boolean | undefined;
  downloadZipFileError?: boolean | undefined;
  allowDownloadZip?: boolean | undefined;
  validFileTypes?: IUploaderFileTypes[] | undefined;
  maxFileLength?: number | undefined;
  isDragger?: boolean | undefined;
  disabled?: boolean | undefined;
  uploadBtnProps?: ButtonProps | undefined;
  /* isStub is used just to fix strange error when the user is reordering components on the form */
  isStub?: boolean | undefined;
  allowedFileTypes?: string[] | undefined;
  maxHeight?: string | undefined;
  layout: LayoutType;
  listType: ListType;
  thumbnailWidth?: string | undefined;
  thumbnailHeight?: string | undefined;
  borderRadius?: number | undefined;
  hideFileName?: boolean | undefined;
  container?: IStyleValue | undefined;
  allStyles?: IFormComponentStyles | undefined;
  enableStyleOnReadonly?: boolean | undefined;
  thumbnail?: IStyleValue | undefined;
  downloadedFileStyles?: CSSProperties | undefined;
  styleDownloadedFiles?: boolean | undefined;
  downloadedIcon?: IconType | undefined;
}

const EMPTY_FILES: StoredFileModel[] = [];
const EMPTY_FILE_TYPES: IUploaderFileTypes[] = [];
const EMPTY_STRING_ARRAY: string[] = [];

export const StoredFilesRendererBase: FC<IStoredFilesRendererBaseProps> = ({
  multiple = true,
  fileList = EMPTY_FILES,
  isDownloadingFileListZip = false,
  isDownloadZipSucceeded,
  deleteFile,
  uploadFile,
  replaceFile,
  downloadZipFile,
  downloadFile,
  fetchFilesError,
  downloadZipFileError,
  uploadBtnProps,
  validFileTypes = EMPTY_FILE_TYPES,
  maxFileLength = 0,
  isDragger = false,
  disabled,
  isStub = false,
  allowedFileTypes = EMPTY_STRING_ARRAY,
  allowDownloadZip: downloadZip = false,
  allowDelete,
  allowReplace = true,
  allowViewHistory = true,
  customActions = [],
  hasExtraContent,
  extraFormSelectionMode,
  extraFormId,
  extraFormType,
  layout,
  listType,
  gap,
  hideFileName = false,
  enableStyleOnReadonly = true,
  downloadedFileStyles,
  styleDownloadedFiles = false,
  downloadedIcon = 'CheckCircleOutlined',
  ...rest
}) => {
  const { message, notification } = App.useApp();
  const httpClient = useHttpClient();
  const allData = useAvailableConstantsData();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ url: string; uid: string; name: string } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState<{ [key: string]: string }>(fileList.reduce((acc, { uid, url }) => ({ ...acc, [uid]: url }), {}));
  const [fileToReplace, setFileToReplace] = useState<{ uid: string; id: string } | null>(null);
  const hiddenUploadInputRef = useRef<HTMLInputElement>(null);
  const fileContextCache = useRef<Map<string, Promise<{ file: UploadFile; fileId: string; fileName: string; fileType: string }>>>(new Map());
  // Cache blob URLs created from uploaded File objects to avoid immediate server round-trip
  const uploadedFileBlobUrls = useRef<Map<string, string>>(new Map());
  // Uid of the file currently being previewed. Used to ignore stale async results when the user
  // switches preview to another file (or closes it) before a fetch resolves.
  const activePreviewUid = useRef<string | null>(null);
  // Cache of fetched full-resolution preview blob URLs, keyed by file id. Lets repeat previews
  // of the same file reuse the already-downloaded image instead of hitting the server again.
  // Entries are revoked on unmount.
  const previewImageCache = useRef<Map<string, string>>(new Map());
  const model = rest;

  // Handler for replacing a file
  const handleReplaceFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file && fileToReplace) {
      try {
        // This uses the StoredFilesProvider's replaceFile action which manages state properly
        replaceFile({
          file: file,
          fileId: fileToReplace.id,
        }).catch((error) => {
          console.error('Failed to replace file', error);
          throw error;
        });
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Please try again.';
        message.error(`File replacement failed. ${errorMessage}`);
        console.error(e);
      } finally {
        setFileToReplace(null);
      }
    }
    // Reset the input value so the same file can be selected again
    e.target.value = '';
  };

  // Handler to trigger file replacement
  const onReplaceClick = (file: StoredFileModel): void => {
    const fileId = isNotNullOrWhiteSpace(file.id) ? file.id : file.uid;
    setFileToReplace({ uid: file.uid, id: fileId });
    if (hiddenUploadInputRef.current) {
      hiddenUploadInputRef.current.click();
    }
  };
  const hasFiles = !!fileList.length;

  const { dimensionsStyles: containerDimensionsStyles, jsStyle: containerJsStyle, stylingBoxAsCSS } = useFormComponentStyles({ ...model.container });
  const defaultBorder = defaultStyles().border?.border?.all ?? {};

  const { styles } = useStyles({
    downloadedFileStyles: downloadedFileStyles ?? {},
    containerStyles: {
      ...containerDimensionsStyles,
      width: layout === 'vertical' && listType === 'thumbnail' ? undefined : (addPx(containerDimensionsStyles.width, allData) ?? undefined),
      height: layout === 'horizontal' && listType === 'thumbnail' ? undefined : (addPx(containerDimensionsStyles.height, allData) ?? undefined),
      ...containerJsStyle,
      ...stylingBoxAsCSS,
    },
    style: !enableStyleOnReadonly && disabled === true
      ? { ...(model.allStyles?.dimensionsStyles ?? {}), ...(model.allStyles?.fontStyles ?? {}), border: `${defaultBorder.width} ${defaultBorder.style} ${defaultBorder.color}` }
      : { ...(model.allStyles?.fullStyle ?? {}) },
    model: {
      gap: addPx(gap, allData) ?? '0px',
      layout: listType === 'thumbnail' && !isDragger,
      hideFileName: hideFileName && listType === 'thumbnail',
      isDragger,
      isStub,
      downloadZip,
      fontStyles: model.allStyles?.fontStyles ?? {},
      listType,
      hasFiles: fileList.length > 0,
    },
  });

  const { width, minWidth, maxWidth } = model.allStyles?.dimensionsStyles ?? {};
  const listTypeAndLayout = getListTypeAndLayout(listType, isDragger);

  useEffect(() => {
    if (isDownloadZipSucceeded === true) {
      notification.success({
        message: `Download success!`,
        description: 'Your files have been downloaded successfully. Please check your download folder.',
        placement: 'topRight',
      });
    }
  }, [isDownloadZipSucceeded, notification]);

  // Cleanup cache when file list changes to prevent memory leaks
  useEffect(() => {
    const currentFileIds = new Set(
      fileList.map((f) => isNotNullOrWhiteSpace(f.id) ? f.id : f.uid),
    );
    const cachedKeys = Array.from(fileContextCache.current.keys());

    cachedKeys.forEach((key) => {
      const fileId = key.substring(0, key.indexOf('_'));
      if (!currentFileIds.has(fileId)) {
        fileContextCache.current.delete(key);
      }
    });
  }, [fileList]);

  const imageUrlsRef = useRef(imageUrls);
  useEffect(() => {
    imageUrlsRef.current = imageUrls;
  }, [imageUrls]);


  useEffect(() => {
    let isCancelled = false;
    const revokeCallbacks: Array<() => void> = [];

    const fetchImages = async (): Promise<void> => {
      if (listType !== 'thumbnail') {
        // Thumbnails are only displayed in thumbnail mode; revoke any previously fetched
        // thumbnail URLs and clear the state to avoid unnecessary downloads.
        const protectedUrls = new Set(uploadedFileBlobUrls.current.values());
        Object.values(imageUrlsRef.current).forEach((url) => {
          if (!protectedUrls.has(url)) {
            URL.revokeObjectURL(url);
          }
        });
        setImageUrls({});
        return;
      }

      const newImageUrls: { [key: string]: string } = {};
      for (const file of fileList) {
        if (isImageType(file.type ?? "") && !isNullOrWhiteSpace(file.url)) {
          // Preserve existing URL to avoid unnecessary re-fetches
          const existingUrl = imageUrlsRef.current[file.uid];
          if (isNotNullOrWhiteSpace(existingUrl)) {
            newImageUrls[file.uid] = existingUrl;
            continue;
          }

          // Check for blob URL from recent upload (avoids server round-trip immediately after upload).
          // The entry is kept for the lifetime of the component (cleaned up on unmount or when the
          // file is removed) so it can also be reused for full-image preview without re-downloading.
          // It is keyed by name/size so it survives the temp uid (nanoid) -> server GUID transition.
          const tempKey = `${file.name}_${file.size}`;
          const blobUrl = uploadedFileBlobUrls.current.get(tempKey);
          if (isNotNullOrWhiteSpace(blobUrl)) {
            newImageUrls[file.uid] = blobUrl;
            continue;
          }

          try {
            if (isNullOrWhiteSpace(file.id)) {
              continue;
            }
            // The backend returns a degenerate 1x1 thumbnail when width/height are omitted, so always
            // send concrete dimensions derived from the configured thumbnail size (with a safe default).
            const thumbnailUrl = buildUrl(STORED_FILE_URLS.DOWNLOAD_THUMBNAIL, {
              id: file.id,
              width: resolveThumbnailSize(model.thumbnailWidth ?? `${model.allStyles?.dimensionsStyles.width ?? ''}`),
              height: resolveThumbnailSize(model.thumbnailHeight ?? `${model.allStyles?.dimensionsStyles.height ?? ''}`),
              fitOption: 1, // 1: FitToHeight
            });

            const { url: imageUrl, revoke } = await fetchStoredFile(httpClient, thumbnailUrl);
            if (isCancelled) {
              // Cleanup if cancelled after fetch completes
              revoke();
              return;
            }
            // Track revoke callback for cleanup
            revokeCallbacks.push(revoke);
            newImageUrls[file.uid] = imageUrl;
          } catch (error) {
            console.error(`Failed to fetch image for file ${file.name} (${file.uid}):`, error);
            // Don't add to newImageUrls or revokeCallbacks - this file will not have a thumbnail
          }
        }
      }
      if (!isCancelled) {
        // Revoke uploaded blob URLs whose file is no longer in the list (e.g. removed by the user),
        // and drop them from the cache so the generic cleanup below doesn't double-revoke them.
        const liveKeys = new Set(fileList.map((f) => `${f.name}_${f.size}`));
        uploadedFileBlobUrls.current.forEach((url, key) => {
          if (!liveKeys.has(key)) {
            URL.revokeObjectURL(url);
            uploadedFileBlobUrls.current.delete(key);
          }
        });

        const protectedUrls = new Set([...Object.values(newImageUrls), ...uploadedFileBlobUrls.current.values()]);
        Object.values(imageUrlsRef.current).forEach((url) => {
          if (!protectedUrls.has(url)) {
            URL.revokeObjectURL(url);
          }
        });

        setImageUrls(newImageUrls);
      }
    };

    fetchImages().catch((error) => {
      console.error('Failed to fetch images', error);
      throw error;
    });

    return () => {
      isCancelled = true;
      // Call all revoke functions to clean up blob URLs
      revokeCallbacks.forEach((revoke) => revoke());
    };
  }, [fileList, httpClient, model.thumbnailWidth, model.thumbnailHeight, model.allStyles?.dimensionsStyles.width, model.allStyles?.dimensionsStyles.height, listType]);

  // Clean up uploaded blob URLs on component unmount to prevent memory leaks
  useEffect(() => {
    const blobUrls = uploadedFileBlobUrls.current;
    const previewCache = previewImageCache.current;
    return () => {
      blobUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      blobUrls.clear();
      previewCache.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      previewCache.clear();
    };
  }, []);

  const handlePreview = (file: StoredFileModel): void => {
    activePreviewUid.current = file.uid;

    // For a freshly uploaded file we already have a blob URL of the full original image locally,
    // so reuse it instead of downloading the file again from the server. The blob is owned by
    // uploadedFileBlobUrls (cleaned up on unmount), so it must not be tracked for revocation here.
    const uploadedBlobUrl = uploadedFileBlobUrls.current.get(`${file.name}_${file.size}`);
    if (isNotNullOrWhiteSpace(uploadedBlobUrl)) {
      setPreviewImage({ url: uploadedBlobUrl, uid: file.uid, name: file.name });
      setPreviewLoading(false);
      setPreviewOpen(true);
      return;
    }

    setPreviewImage({ url: "", uid: file.uid, name: file.name });
    setPreviewOpen(true);

    // Fetch the full-resolution image; show a loader until it arrives.
    if (isNullOrWhiteSpace(file.id))
      return;

    // Reuse a previously downloaded full image for this file to avoid re-hitting the server.
    const previouslyFetched = previewImageCache.current.get(file.id);
    if (isNotNullOrWhiteSpace(previouslyFetched)) {
      setPreviewImage((current) => (current?.uid === file.uid ? { ...current, url: previouslyFetched } : current));
      setPreviewLoading(false);
      return;
    }

    const fileId = file.id;
    setPreviewLoading(true);
    const fullImageDownloadUrl = buildUrl(STORED_FILE_URLS.DOWNLOAD_FILE, { id: fileId });
    fetchStoredFile(httpClient, fullImageDownloadUrl)
      .then(({ url: fullImageUrl, revoke }) => {
        // The preview may have moved to another file (or closed) while this was loading.
        // In that case discard the fetched image instead of swapping it in.
        if (activePreviewUid.current !== file.uid) {
          revoke();
          return;
        }
        previewImageCache.current.set(fileId, fullImageUrl);
        setPreviewImage((current) => (current?.uid === file.uid ? { ...current, url: fullImageUrl } : current));
      })
      .catch((error) => {
        console.error(`Failed to fetch full image for preview ${file.name} (${file.uid}):`, error);
      })
      .finally(() => {
        // Only clear loading if this is still the file being previewed.
        if (activePreviewUid.current === file.uid)
          setPreviewLoading(false);
      });
  };

  const iconRender: UploadProps["iconRender"] = (file) => {
    const { type, uid } = file;

    if (isImageType(type) && isNotNullOrWhiteSpace(imageUrls[uid])) {
      if (listType === 'thumbnail' && !isDragger) {
        return (
          <>
            <Image src={imageUrls[uid]} alt={file.name} preview={false} />
            {!hideFileName && <p className="ant-upload-list-item-name">{file.name}</p>}
          </>
        );
      }
    }

    return getFileIcon(type ?? "", model.allStyles?.fontStyles.fontSize);
  };

  // Helper function to get or create cached file context data
  const getFileContextData = useCallback((file: UploadFile, fileId: string): Promise<{ file: UploadFile; fileId: string; fileName: string; fileType: string }> => {
    const cacheKey = `${fileId}_${file.name}_${file.type}`;

    if (!fileContextCache.current.has(cacheKey)) {
      fileContextCache.current.set(
        cacheKey,
        Promise.resolve({
          file: file,
          fileId: fileId,
          fileName: file.name,
          fileType: file.type ?? "",
        }),
      );
    }

    return fileContextCache.current.get(cacheKey)!;
  }, []);

  if (model.background?.type === 'storedFile' && isNotNullOrWhiteSpace(model.background.storedFile?.id) && !isValidGuid(model.background.storedFile.id)) {
    return <ValidationErrors error="The provided StoredFileId is invalid" />;
  }

  const itemRenderFunction = (originNode: React.ReactElement, antdFile: UploadFile): React.ReactElement => {
    const shaFile = antdFile as StoredFileModel;

    const isDownloaded = shaFile.userHasDownloaded === true;
    const fileId = isNotNullOrWhiteSpace(shaFile.id) ? shaFile.id : shaFile.uid;
    const persistedFileId = shaFile.id; // Only persisted files have .id

    const actions = (
      <div onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
        <Space size={5}>
          {allowReplace && disabled !== true && isNotNullOrWhiteSpace(persistedFileId) && isValidGuid(persistedFileId) && (
            <Button
              size="small"
              icon={<SyncOutlined />}
              title="Replace file"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onReplaceClick(shaFile);
              }}
            />
          )}
          {allowDelete === true && disabled !== true && isNotNullOrWhiteSpace(persistedFileId) && (
            <Popconfirm
              title="Delete Attachment"
              onConfirm={(e) => {
                e?.preventDefault();
                e?.stopPropagation();
                deleteFile(persistedFileId).catch((error) => {
                  console.error('Failed to delete file', error);
                  throw error;
                });
              }}
              description="Are you sure you want to delete this attachment?"
            >
              <Button
                size="small"
                icon={<DeleteOutlined />}
                title="Delete file"
              />
            </Popconfirm>

          )}
          {allowViewHistory && fileId && isValidGuid(fileId) && (
            <FileVersionsButton
              fileId={fileId}
              onDownload={(versionNo, fileName) => {
                downloadFile({ fileId, versionNo, fileName }).catch((error) => {
                  console.error('Failed to download file', error);
                  throw error;
                });
              }}
            />
          )}
          {isNotNullOrWhiteSpace(persistedFileId) && (
            <Button
              size="small"
              icon={<DownloadOutlined />}
              title="Download file"
              onClick={(e) => {
                e.stopPropagation();
                downloadFile({ fileId: persistedFileId, fileName: shaFile.name }).catch((error) => {
                  console.error('Failed to download file', error);
                  throw error;
                });
              }}
            />
          )}
          {/* Custom Actions Button Group */}
          {customActions.length > 0 && (
            <div onClick={(e) => e.stopPropagation()}>
              <DataContextProvider
                id={`file_ctx_${fileId}`}
                name="fileContext"
                description="File context for custom actions"
                type="control"
                initialData={getFileContextData(antdFile, fileId)}
              >
                <ButtonGroup
                  id={`file_actions_${fileId}`}
                  items={customActions}
                  size="small"
                  readOnly={false}
                  spaceSize="small"
                  isInline={true}
                />
              </DataContextProvider>
            </div>
          )}
        </Space>
      </div>
    );

    const handleItemClick = (e: React.MouseEvent): void => {
      // Only allow interaction with persisted files (those with a GUID)
      if (isNullOrWhiteSpace(persistedFileId)) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // If it's an image, trigger preview instead of download
      if (isImageType(shaFile.type ?? "")) {
        e.preventDefault();
        e.stopPropagation();
        handlePreview(shaFile);
      } else {
        downloadFile({ fileId: persistedFileId, fileName: shaFile.name }).catch((error) => {
          console.error('Failed to download file', error);
          throw error;
        });
      };
    };

    // For text listType, we need to wrap only the file name in Popover
    // For thumbnail and other types, wrap the entire content
    const renderContent = (): React.ReactNode => {
      if (listType === 'text' || isDragger) {
        return (
          <div className={classNames(isDownloaded && styleDownloadedFiles ? styles.downloadedFile : '', styles.fileNameWrapper)} onClick={handleItemClick}>
            <div className={styles.fileName}>
              <FileNameDisplay
                file={shaFile}
                icon={<>{iconRender(antdFile)}</>}
                className={styles.fileName}
                popoverContent={actions}
                popoverClassName={styles.actionsPopover}
              />
            </div>
            {isDownloaded && styleDownloadedFiles && (
              <div className={styles.downloadedIcon}>
                <ShaIcon iconName={downloadedIcon} />
              </div>
            )}
          </div>
        );
      }

      // For thumbnail and other types, wrap entire content
      const content = (
        <div className={isDownloaded && styleDownloadedFiles ? styles.downloadedFile : ''} onClick={handleItemClick}>
          {originNode}
          {isDownloaded && styleDownloadedFiles && (
            <div className={styles.downloadedIcon}>
              <ShaIcon iconName={downloadedIcon} />
            </div>
          )}
        </div>
      );

      return (
        <Popover content={actions} trigger="hover" placement="top" classNames={{ root: styles.actionsPopover }}>
          {content}
        </Popover>
      );
    };

    return (
      <div>
        {renderContent()}
        {listType === 'thumbnail' && !isDragger && !hideFileName && (
          <div className={isDownloaded ? styles.downloadedFile : ''}>
            <FileNameDisplay
              file={shaFile}
              className={styles.fileName}
            />
          </div>
        )}
        {hasExtraContent === true && isDefined(extraFormId) && (
          <ExtraContent
            file={shaFile}
            formId={extraFormId}
          />
        )}
      </div>
    );
  };

  const props: DraggerProps = {
    name: '',
    accept: allowedFileTypes.join(','),
    multiple,
    fileList: fileList.filter((f) => f.status !== 'error') as UploadFile[],
    disabled: disabled ?? false,
    onChange(info: UploadChangeParam) {
      const { status } = info.file;
      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    customRequest(options) {
      // It used to be RcCustomRequestOptions, but it doesn't seem to be found anymore
      const file = options.file;
      let blobUrl: string | null = null;
      let tempKey: string | null = null;

      // For image files, create a blob URL directly from the File object to avoid
      // an immediate server round-trip for the thumbnail right after upload.
      // file.type is the browser MIME type (e.g. 'image/jpeg'), but isImageType expects
      // the extension format (e.g. '.jpg'), so derive the extension from the file name.
      if (isFile(file)) {
        tempKey = `${file.name}_${file.size}`;
        const fileExt = `.${getFileExtension(file).toLowerCase()}`;
        if (isImageType(fileExt)) {
          blobUrl = URL.createObjectURL(file);
          uploadedFileBlobUrls.current.set(tempKey, blobUrl);
        }
      }

      uploadFile({ file: file as File }).catch((error) => {
        // Clean up blob URL if upload failed
        if (isNotNullOrWhiteSpace(blobUrl) && isNotNullOrWhiteSpace(tempKey)) {
          URL.revokeObjectURL(blobUrl);
          uploadedFileBlobUrls.current.delete(tempKey);
        }
        console.error('Failed to upload file', error);
        throw error;
      });
    },
    beforeUpload(file: RcFile) {
      const { type, size, name } = file;

      if (!isFileTypeAllowed(name, allowedFileTypes)) {
        message.error(`File type not allowed. Only ${allowedFileTypes.join(', ')} files are accepted.`);
        return false;
      }

      const isValidFileType =
        validFileTypes.length === 0 ? true : validFileTypes.map(({ type: fileType }) => fileType).includes(type);

      if (!isValidFileType) {
        const validTypes = validFileTypes.map(({ name }) => name).join(',');
        message.error(`You can only upload files of type: (${validTypes})`);
      }

      const isAcceptableFileSize = maxFileLength === 0 ? true : size / 1024 / 1024 <= maxFileLength;

      if (!isAcceptableFileSize) {
        message.error(`Image must smaller than ${maxFileLength}MB!`);
      }
      return isValidFileType && isAcceptableFileSize;
    },
    iconRender: iconRender,
    itemRender: itemRenderFunction,
    showUploadList: isDragger && disabled !== true ? false : {
      showRemoveIcon: false,
      showPreviewIcon: false,
      showDownloadIcon: false,
    },
  };

  const renderUploadContent = (): React.ReactNode => {
    return (
      disabled !== true && (
        <Button
          type="link"
          icon={<UploadOutlined />}
          disabled={disabled ?? false}
          {...uploadBtnProps}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }}
          className={classNames(styles.uploadButton, uploadBtnProps?.className)}
        >
          {isDragger ? "(Click or drag file to upload)" : listType === 'text' && '(press to upload)'}
        </Button>
      )
    );
  };

  return (
    fileList.length === 0 && disabled === true ? null
      : (
        <div className={`${styles.shaStoredFilesRenderer} ${layout === 'horizontal' && listTypeAndLayout !== 'text' ? styles.shaStoredFilesRendererHorizontal
          : layout === 'vertical' && listTypeAndLayout !== 'text' ? styles.shaStoredFilesRendererVertical
            : layout === 'grid' && listTypeAndLayout !== 'text' ? styles.shaStoredFilesRendererGrid : ''}`}
        >
          {isStub
            ? (isDragger
              ? <Dragger style={{ padding: 0 }} disabled><DraggerStub styles={styles} /></Dragger>
              : (
                <>
                  <Button
                    type="link"
                    icon={<PictureOutlined />}
                    disabled={disabled ?? false}
                    {...uploadBtnProps}
                    className={classNames(styles.uploadButton, uploadBtnProps?.className)}
                    style={listType === 'thumbnail' ? { ...model.allStyles?.fullStyle } : { ...model.allStyles?.fontStyles }}
                  >
                    {listType === 'text' && '(press to upload)'}
                  </Button>
                  <div style={(listType === 'thumbnail') ? { width, minWidth, maxWidth } : {}}>
                    {listType !== 'text' && !hideFileName && (
                      <div className={styles.fileName}>
                        file name
                      </div>
                    )}
                    {hasExtraContent === true && isDefined(extraFormId) && (
                      <ExtraContent
                        file={PLACEHOLDER_FILE}
                        formId={extraFormId}
                      />
                    )}
                  </div>
                </>
              )
            )
            : (props.disabled === true && fileList.length === 0
              ? null
              : props.disabled === true
                ? (
                  <Upload
                    {...props}
                    {...(model.allStyles?.fullStyle ? { style: model.allStyles.fullStyle } : {})}
                    listType={listTypeAndLayout}
                  />
                )
                : isDragger
                  ? (
                    <Dragger {...props} openFileDialogOnClick={true}>
                      {fileList.length === 0 ? (
                        <DraggerStub styles={styles} />
                      ) : (
                        <div style={{ pointerEvents: 'none' }}>
                          <Button
                            type="link"
                            icon={<UploadOutlined />}
                            disabled={disabled ?? false}
                            className={styles.uploadButton}
                            style={{ pointerEvents: 'auto', marginBottom: '8px' }}
                          >
                            (Click or drag to upload)
                          </Button>
                          {fileList.map((file) => (
                            <div key={file.uid} style={{ pointerEvents: 'auto' }}>
                              {itemRenderFunction(<></>, file as UploadFile)}
                            </div>
                          ))}
                        </div>
                      )}
                    </Dragger>
                  )
                  : <Upload {...props} listType={listTypeAndLayout}>{renderUploadContent()}</Upload>)}
          {previewImage && (
            <Image
              classNames={{ root: styles.hiddenElement }}
              preview={{
                visible: previewOpen,
                onVisibleChange: (visible) => setPreviewOpen(visible),
                afterOpenChange: (visible) => {
                  if (!visible) {
                    setPreviewImage(null);
                    setPreviewLoading(false);
                    activePreviewUid.current = null;
                  }
                },
                // Show a loader while the full-resolution image downloads instead of a broken image.
                imageRender: (originalNode) => (previewLoading
                  ? <Spin indicator={<LoadingOutlined spin />} size="large" />
                  : originalNode),
              }}
              {...(isNotNullOrWhiteSpace(previewImage.url) ? { src: previewImage.url } : {})}
            />
          )}

          {fetchFilesError === true && (
            <Alert title="Error" description="Sorry, an error occurred while trying to fetch file list." type="error" />
          )}

          {downloadZipFileError === true && (
            <Alert title="Error" description="Sorry, an error occurred while trying to download zip file." type="error" />
          )}

          {downloadZip && hasFiles && isDefined(downloadZipFile) && (
            <div className={styles.storedFilesRendererBtnContainer}>
              <Button size="small" type="link" icon onClick={() => downloadZipFile()} loading={isDownloadingFileListZip}>
                {!isDownloadingFileListZip && <FileZipOutlined />} Download Zip
              </Button>
            </div>
          )}

          {/* Hidden file input for replace functionality */}
          <input
            type="file"
            ref={hiddenUploadInputRef}
            className={styles.hiddenElement}
            accept={allowedFileTypes.join(',')}
            onChange={handleReplaceFileChange}
          />

        </div>
      )
  );
};

export default StoredFilesRendererBase;
