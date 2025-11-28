import { DraggerStub } from '@/components/fileUpload/stubs';
import { IAttachmentContent, layoutType, listType } from '@/designer-components/attachmentsEditor/attachmentsEditor';
import { useFormComponentStyles } from '@/hooks/formComponentHooks';
import { getFileIcon, isImageType } from '@/icons/fileIcons';
import { IInputStyles, IStyleType, useSheshaApplication, ValidationErrors } from '@/index';
import { IFormComponentStyles } from '@/providers/form/models';
import { IDownloadFilePayload, IStoredFile, IUploadFilePayload } from '@/providers/storedFiles/contexts';
import { addPx } from '@/utils/style';
import { CheckCircleOutlined, DeleteOutlined, DownloadOutlined, FileZipOutlined, PictureOutlined, SyncOutlined, UploadOutlined } from '@ant-design/icons';
import {
  Alert,
  App,
  Button,
  ButtonProps,
  Image,
  Popconfirm,
  Popover,
  Space,
  Upload,
  UploadFile,
} from 'antd';
import Dragger, { DraggerProps } from 'antd/lib/upload/Dragger';
import { RcFile, UploadChangeParam } from 'antd/lib/upload/interface';
import React, { CSSProperties, FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isValidGuid } from '../formDesigner/components/utils';
import { useStyles } from './styles/styles';
import { ButtonGroupItemProps } from '@/providers/buttonGroupConfigurator/models';
import { ButtonGroup } from '@/designer-components/button/buttonGroup/buttonGroup';
import { FormIdentifier } from '@/providers/form/models';
import { DataContextProvider } from '@/providers/dataContextProvider';
import { FileVersionsButton, ExtraContent, createPlaceholderFile, getListTypeAndLayout, createFetchStoredFile } from './utils';

interface IUploaderFileTypes {
  name: string;
  type: string;
}

export interface IStoredFilesRendererBaseProps extends IInputStyles {
  fileList?: IStoredFile[];
  allowUpload?: boolean;
  allowDelete?: boolean;
  allowReplace?: boolean;
  allowViewHistory?: boolean;
  customActions?: ButtonGroupItemProps[];
  hasExtraContent?: boolean;
  extraContent?: IAttachmentContent;
  isDynamic?: boolean;
  extraFormSelectionMode?: 'name' | 'dynamic';
  extraFormId?: FormIdentifier;
  extraFormType?: string;
  showDragger?: boolean;
  ownerId?: string;
  ownerType?: string;
  multiple?: boolean;
  isDownloadingFileListZip?: boolean;
  isDownloadZipSucceeded?: boolean;
  fetchFilesError?: boolean;
  downloadZipFileError?: boolean;
  deleteFile: (fileIdToDelete: string) => void | Promise<void>;
  uploadFile: (payload: IUploadFilePayload) => void;
  downloadZipFile?: () => void;
  downloadZip?: boolean;
  downloadFile: (payload: IDownloadFilePayload) => void;
  validFileTypes?: IUploaderFileTypes[];
  maxFileLength?: number;
  isDragger?: boolean;
  disabled?: boolean;
  uploadBtnProps?: ButtonProps;
  /* isStub is used just to fix strange error when the user is reordering components on the form */
  isStub?: boolean;
  allowedFileTypes?: string[];
  maxHeight?: string;
  layout: layoutType;
  listType: listType;
  thumbnailWidth?: string;
  thumbnailHeight?: string;
  borderRadius?: number;
  hideFileName?: boolean;
  gap?: number;
  container?: IStyleType;
  primaryColor?: string;
  allStyles?: IFormComponentStyles;
  enableStyleOnReadonly?: boolean;
  thumbnail?: IStyleType;
  downloadedFileStyles?: CSSProperties;
}

export const StoredFilesRendererBase: FC<IStoredFilesRendererBaseProps> = ({
  multiple = true,
  fileList = [],
  isDownloadingFileListZip,
  isDownloadZipSucceeded,
  deleteFile,
  uploadFile,
  downloadZipFile,
  downloadFile,
  ownerId,
  ownerType,
  fetchFilesError,
  downloadZipFileError,
  uploadBtnProps,
  validFileTypes = [],
  maxFileLength = 0,
  isDragger = false,
  primaryColor,
  disabled,
  isStub = false,
  allowedFileTypes = [],
  downloadZip,
  allowDelete,
  allowReplace = true,
  allowViewHistory = true,
  customActions = [],
  hasExtraContent,
  extraContent,
  isDynamic,
  extraFormSelectionMode,
  extraFormId,
  extraFormType,
  layout,
  listType,
  gap,
  enableStyleOnReadonly = true,
  downloadedFileStyles,
  ...rest
}) => {
  const { message, notification } = App.useApp();
  const { httpHeaders } = useSheshaApplication();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ url: string; uid: string; name: string } | null>(null);
  const [imageUrls, setImageUrls] = useState<{ [key: string]: string }>(fileList.reduce((acc, { uid, url }) => ({ ...acc, [uid]: url }), {}));
  const [fileToReplace, setFileToReplace] = useState<string | null>(null);
  const hiddenUploadInputRef = useRef<HTMLInputElement>(null);
  const fileContextCache = useRef<Map<string, Promise<{ file: UploadFile; fileId: string; fileName: string; fileType: string }>>>(new Map());
  // Track blob URLs and their revoke functions to prevent memory leaks
  const blobUrlsRef = useRef<Map<string, () => void>>(new Map());
  const model = rest;
  const hasFiles = !!fileList.length;

  const { dimensionsStyles: containerDimensionsStyles, jsStyle: containerJsStyle, stylingBoxAsCSS } = useFormComponentStyles({ ...model?.container });

  const { styles } = useStyles({
    downloadedFileStyles: downloadedFileStyles,
    containerStyles: {
      ...(containerDimensionsStyles ?? {}),
      width: layout === 'vertical' && listType === 'thumbnail' ? undefined : addPx(containerDimensionsStyles?.width),
      height: layout === 'horizontal' && listType === 'thumbnail' ? undefined : addPx(containerDimensionsStyles?.height),
      ...containerJsStyle,
      ...stylingBoxAsCSS,
    },
    style: enableStyleOnReadonly && disabled
      ? { ...(model?.allStyles?.dimensionsStyles ?? {}), ...(model?.allStyles?.fontStyles ?? {}) }
      : { ...(model?.allStyles?.fullStyle ?? {}) },
    model: {
      gap: addPx(gap),
      layout: listType === 'thumbnail' && !isDragger,
      hideFileName: rest.hideFileName && listType === 'thumbnail',
      isDragger,
      isStub
    },
    primaryColor
  });

  const { width, minWidth, maxWidth } = model?.allStyles?.dimensionsStyles ?? {};
  const listTypeAndLayout = getListTypeAndLayout(listType, isDragger);

  // Helper to check if a URL is a blob URL
  const isBlobUrl = useCallback((url: string): boolean => {
    return url?.startsWith('blob:') ?? false;
  }, []);

  // Helper to revoke a blob URL and remove from tracking
  const revokeBlobUrl = useCallback((url: string) => {
    if (isBlobUrl(url)) {
      const revokeFunc = blobUrlsRef.current.get(url);
      if (revokeFunc) {
        revokeFunc();
        blobUrlsRef.current.delete(url);
      } else {
        // Fallback for URLs not tracked (shouldn't happen in normal flow)
        URL.revokeObjectURL(url);
      }
    }
  }, [isBlobUrl]);

  // Memoize the fetch function to prevent recreating on every render
  const fetchStoredFile = useCallback(
    async (url: string): Promise<string> => {
      const fetchFn = createFetchStoredFile(httpHeaders);
      const result = await fetchFn(url);
      // Track blob URL and its revoke function for cleanup
      blobUrlsRef.current.set(result.url, result.revoke);
      return result.url;
    },
    [httpHeaders]
  );

  const openFilesZipNotification = () =>
    notification.success({
      message: `Download success!`,
      description: 'Your files have been downloaded successfully. Please check your download folder.',
      placement: 'topRight',
    });

  useEffect(() => {
    if (isDownloadZipSucceeded) {
      openFilesZipNotification();
    }
  }, [isDownloadZipSucceeded]);

  // Cleanup cache when file list changes to prevent memory leaks
  useEffect(() => {
    const currentFileIds = new Set(
      fileList.map(f => (f as IStoredFile).id || f.uid)
    );
    const cachedKeys = Array.from(fileContextCache.current.keys());

    cachedKeys.forEach(key => {
      const fileId = key.split('_')[0];
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
    let isMounted = true;

    const fetchImages = async () => {
      const currentFileUids = new Set(fileList.map(f => f.uid));

      // First pass: clean up removed files and keep existing URLs
      setImageUrls(prevUrls => {
        const newImageUrls: { [key: string]: string } = {};

        // Revoke blob URLs for files that are no longer in the list
        Object.entries(prevUrls).forEach(([uid, url]) => {
          if (!currentFileUids.has(uid)) {
            revokeBlobUrl(url);
          } else {
            // Keep existing URL
            newImageUrls[uid] = url;
          }
        });

        return newImageUrls;
      });

      // Second pass: fetch new images for files without cached URLs
      const currentUrls = imageUrlsRef.current;
      const filesToFetch = fileList.filter(
        file => isImageType(file.type) && !currentUrls[file.uid]
      );

      for (const file of filesToFetch) {
        try {
          const imageUrl = await fetchStoredFile(file.url);
          if (isMounted) {
            setImageUrls(prev => ({ ...prev, [file.uid]: imageUrl }));
          } else {
            // Component unmounted, revoke the URL we just created
            revokeBlobUrl(imageUrl);
          }
        } catch (error) {
          console.error('Error fetching image for file:', file.name, error);
        }
      }
    };

    if (fileList.length > 0) {
      fetchImages();
    } else {
      // No files - revoke all existing blob URLs
      setImageUrls(prevUrls => {
        Object.values(prevUrls).forEach(revokeBlobUrl);
        return {};
      });
    }

    // Cleanup on unmount
    return () => {
      isMounted = false;
      blobUrlsRef.current.forEach((revokeFunc) => {
        revokeFunc();
      });
      blobUrlsRef.current.clear();
    };
  }, [fileList, fetchStoredFile, revokeBlobUrl]);


  const handlePreview = async (file: UploadFile) => {
    setPreviewImage({ url: imageUrls[file.uid], uid: file.uid, name: file.name });
    setPreviewOpen(true);
  };

  const iconRender = (file: UploadFile) => {
    const { type, uid } = file;

    if (isImageType(type)) {
      if (listType === 'thumbnail' && !isDragger) {
        return <Space size="small" direction='vertical'>
          <Image src={imageUrls[uid]} alt={file.name} preview={false} />
          <p className='ant-upload-list-item-name'>{file.name} - {file.size}</p>
        </Space>;
      }
    }

    return getFileIcon(type);
  };

    // Helper function to get or create cached file context data
    const getFileContextData = useCallback((file: UploadFile, fileId: string) => {
      const cacheKey = `${fileId}_${file.name}_${file.type}`;
  
      if (!fileContextCache.current.has(cacheKey)) {
        fileContextCache.current.set(
          cacheKey,
          Promise.resolve({
            file: file,
            fileId: fileId,
            fileName: file.name,
            fileType: file.type,
          })
        );
      }
  
      return fileContextCache.current.get(cacheKey)!;
    }, []);

    const placeholderFile = useMemo(() => createPlaceholderFile(), []);

  if (model?.background?.type === 'storedFile' && model?.background.storedFile?.id && !isValidGuid(model?.background.storedFile.id)) {
    return <ValidationErrors error="The provided StoredFileId is invalid" />;
  }

  const handleReplaceClick = (file: UploadFile) => {
    setFileToReplace(file.uid);
    hiddenUploadInputRef.current?.click();
  };

  const handleReplaceFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0 && fileToReplace) {
      const newFile = files[0];

      try {
        await Promise.resolve(deleteFile(fileToReplace));

        uploadFile({
          file: newFile,
          ownerId,
          ownerType,
        });
      } catch (error) {
        console.error('Error replacing file:', error);
        message.error('Failed to replace file. Please try again.');
      } finally {
        setFileToReplace(null);
        if (hiddenUploadInputRef.current) {
          hiddenUploadInputRef.current.value = '';
        }
      }
    }
  };

  const props: DraggerProps = {
    name: '',
    accept: allowedFileTypes?.join(','),
    multiple,
    fileList,
    disabled,
    onChange(info: UploadChangeParam) {
      const { status } = info.file;
      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    customRequest(options: any) {
      // It used to be RcCustomRequestOptions, but it doesn't seem to be found anymore
      // Normalize file extension to lowercase to avoid case sensitivity issues on Linux
      const lastDotIndex = options?.file?.name.lastIndexOf(".");
      const fileName = lastDotIndex === -1 ? options?.file?.name : options?.file?.name.substring(0, lastDotIndex) + options?.file?.name.substring(lastDotIndex).toLowerCase();

      const normalizedFile = new File([options.file], fileName, { type: options.file.type });

      uploadFile({ file: normalizedFile, ownerId, ownerType });
    },
    beforeUpload(file: RcFile) {
      const { type, size } = file;

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
    iconRender,
    itemRender: (originNode, file) => {
      const isDownloaded = (file as IStoredFile).userHasDownloaded === true;
      const fileId = (file as IStoredFile).id || file.uid;

      const actions = (
        <Space size={5}>
          {allowReplace && !disabled && (
            <Button
              size="small"
              icon={<SyncOutlined />}
              title="Replace file"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleReplaceClick(file);
              }}
            />
          )}
          {allowDelete && !disabled && (
            <Popconfirm title='Delete Attachment' onConfirm={(e) => {
              e?.preventDefault();
              e?.stopPropagation();
              deleteFile(file.uid);
            }
            }
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
                downloadFile({ fileId, versionNo, fileName });
              }}
            />
          )}
          <Button
            size="small"
            icon={<DownloadOutlined />}
            title="Download file"
            onClick={(e) => {
              e.stopPropagation();
              downloadFile({ fileId: file.uid, fileName: file.name });
            }}
          />
          {/* Custom Actions Button Group */}
          {customActions && customActions.length > 0 && !disabled && (
            <DataContextProvider
              id={`file_ctx_${fileId}`}
              name="fileContext"
              description="File context for custom actions"
              type="control"
              initialData={getFileContextData(file, fileId)}
            >
              <ButtonGroup
                id={`file_actions_${fileId}`}
                items={customActions}
                size="small"
                readOnly={disabled}
                spaceSize="small"
                isInline={true}
              />
            </DataContextProvider>
          )}
        </Space>
      );

      const handleItemClick = (e: React.MouseEvent) => {
        // If it's an image, trigger preview instead of download
        if (isImageType(file.type)) {
          e.preventDefault();
          e.stopPropagation();
          handlePreview(file);
        }
      };

      return (
        <div>
          <div className={isDownloaded ? styles.downloadedFile : ''} onClick={handleItemClick}>
            <Popover content={actions} trigger="hover" placement="top" style={{ padding: '0px' }}>
              {originNode}
            </Popover>
            {isDownloaded && (
              <div className={styles.downloadedIcon}>
                <CheckCircleOutlined />
              </div>
            )}
          </div>
          {listType === 'thumbnail' && <div className={isDownloaded ? styles.downloadedFile : ''} >
            <div className={styles.fileName}>{file.name}</div>
          </div>}
          {hasExtraContent && extraFormId && (
            <ExtraContent
              file={file}
              formId={extraFormId}
            />
          )}
        </div>
      );
    },
    showUploadList: {
      showRemoveIcon: false,
      showPreviewIcon: false,
      showDownloadIcon: false,

    }
  };
  
  const renderUploadContent = () => {
    return (
      !disabled &&
      <Button type="link" icon={<UploadOutlined />} disabled={disabled} {...uploadBtnProps}>
        {listType === 'text' && '(press to upload)'}
      </Button>
    );
  };

  return (
    <div className={`${styles.shaStoredFilesRenderer} ${layout === 'horizontal' && listTypeAndLayout !== 'text' ? styles.shaStoredFilesRendererHorizontal :
      layout === 'vertical' && listTypeAndLayout !== 'text' ? styles.shaStoredFilesRendererVertical :
        layout === 'grid' && listTypeAndLayout !== 'text' ? styles.shaStoredFilesRendererGrid : ''}`}>
      {isStub
        ? (isDragger
          ? <Dragger disabled><DraggerStub styles={styles} /></Dragger>
          : <>
            <div
              className={listType === 'thumbnail' ? 'ant-upload-list-item-thumbnail ant-upload-list-item thumbnail-stub' : ''}
            >
              <Button type="link" icon={<PictureOutlined />} disabled={disabled} {...uploadBtnProps} style={listType === 'thumbnail' ? { ...model?.allStyles?.fullStyle } : { ...model.allStyles.fontStyles }}>
                {listType === 'text' && '(press to upload)'}
              </Button>
            </div>
            <div style={(listType === 'thumbnail' && !isDragger) ? { width, minWidth, maxWidth } : {}}>
              {listType !== 'text' && !rest.hideFileName &&
                <div className={styles.fileName}>
                  {'file name'}
                </div>}
              {hasExtraContent && extraFormId && (
                <ExtraContent
                  file={placeholderFile}
                  formId={extraFormId}
                />
              )}
            </div>

          </>
        )
        : (props.disabled && fileList.length === 0
          ? <div className={listType === 'thumbnail' ? styles.thumbnailReadOnly : ''}>
            {renderUploadContent()}
          </div>
          : props.disabled
            ? <Upload {...props} style={model?.allStyles?.fullStyle} listType={listTypeAndLayout} />
            : isDragger ?
              <Dragger {...props}>
                <DraggerStub styles={styles} />
              </Dragger>
              : <Upload {...props} listType={listTypeAndLayout}>{renderUploadContent()}</Upload>)
      }
      {previewImage && (
        <Image
          wrapperStyle={{ display: 'none' }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(null),
          }}
          src={previewImage.url}
        />
      )}

      {fetchFilesError && (
        <Alert message="Error" description="Sorry, an error occurred while trying to fetch file list." type="error" />
      )}

      {downloadZipFileError && (
        <Alert message="Error" description="Sorry, an error occurred while trying to download zip file." type="error" />
      )}

      {downloadZip && hasFiles && !!downloadZipFile && (
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
        style={{ display: 'none' }}
        accept={allowedFileTypes?.join(',')}
        onChange={handleReplaceFileChange}
      />

    </div>
  );
};

export default StoredFilesRendererBase;
