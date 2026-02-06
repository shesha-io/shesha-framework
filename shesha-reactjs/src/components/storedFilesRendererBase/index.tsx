import { DraggerStub } from '@/components/fileUpload/stubs';
import { layoutType, listType } from '@/designer-components/attachmentsEditor/attachmentsEditor';
import { getFileIcon, isImageType } from '@/icons/fileIcons';
import { getStyle, IInputStyles, pickStyleFromModel, useAvailableConstantsData, useSheshaApplication } from '@/index';
import { IDownloadFilePayload, IReplaceFilePayload, IStoredFile, IUploadFilePayload } from '@/providers/storedFiles/contexts';
import { useStoredFilesActions } from '@/providers/storedFiles';
import { normalizeFileName } from '@/providers/storedFiles/utils';
import { DeleteOutlined, DownloadOutlined, FileZipOutlined, PictureOutlined, SyncOutlined, UploadOutlined } from '@ant-design/icons';
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
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isValidGuid } from '../formDesigner/components/utils';
import { useStyles } from './styles/styles';
import { ButtonGroupItemProps } from '@/providers/buttonGroupConfigurator/models';
import { ButtonGroup } from '@/designer-components/button/buttonGroup/buttonGroup';
import { FormIdentifier } from '@/providers/form/models';
import { DataContextProvider } from '@/providers/dataContextProvider';
import { FileVersionsButton, ExtraContent, createPlaceholderFile, getListTypeAndLayout, fetchStoredFile, FileNameDisplay } from './utils';
import classNames from 'classnames';
import ShaIcon, { IconType } from '@/components/shaIcon';
import { addPx } from '@/designer-components/button/util';
import { IDownloadedFileStyleType } from '../customFile';

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
  replaceFile?: (payload: IReplaceFilePayload) => void;
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
  onChange?: (fileList: IStoredFile[]) => void;
  onDownload?: (fileList: IStoredFile[]) => void;
  thumbnailWidth?: string;
  thumbnailHeight?: string;
  borderRadius?: number;
  hideFileName?: boolean;
  gap?: number;
  downloadedFileStyles?: IDownloadedFileStyleType;
  styleDownloadedFiles?: boolean;
  downloadedIcon?: IconType;
  itemStyle?: string;
  iconSize?: string | number;
}

const EMPTY_ARRAY = [];

export const StoredFilesRendererBase: FC<IStoredFilesRendererBaseProps> = ({
  multiple = true,
  fileList = EMPTY_ARRAY,
  isDownloadingFileListZip,
  isDownloadZipSucceeded,
  deleteFile,
  uploadFile,
  replaceFile: replaceFileProp,
  downloadZipFile,
  downloadFile,
  ownerId,
  ownerType,
  fetchFilesError,
  downloadZipFileError,
  uploadBtnProps,
  validFileTypes = EMPTY_ARRAY,
  maxFileLength = 0,
  isDragger = false,
  disabled,
  isStub = false,
  allowedFileTypes = EMPTY_ARRAY,
  downloadZip,
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
  downloadedFileStyles,
  styleDownloadedFiles = false,
  downloadedIcon = 'CheckCircleOutlined',
  itemStyle,
  ...rest
}) => {
  const { message, notification } = App.useApp();
  const { httpHeaders } = useSheshaApplication();
  const allData = useAvailableConstantsData();
  const storedFilesActions = useStoredFilesActions();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ url: string; uid: string; name: string } | null>(null);
  const [imageUrls, setImageUrls] = useState<{ [key: string]: string }>(fileList.reduce((acc, { uid, url }) => (url ? { ...acc, [uid]: url } : acc), {}));
  const [fileToReplace, setFileToReplace] = useState<{ uid: string; id: string } | null>(null);
  const hiddenUploadInputRef = useRef<HTMLInputElement>(null);
  const fileContextCache = useRef<Map<string, Promise<{ file: UploadFile; fileId: string; fileName: string; fileType: string }>>>(new Map());
  // Track blob URLs and their revoke functions to prevent memory leaks
  const model = rest;

  // Handler for replacing a file
  const handleReplaceFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file && fileToReplace) {
      try {
        // Normalize file extension to lowercase to avoid case sensitivity issues on Linux
        const normalizedFile = normalizeFileName(file);

        // Use the replaceFile action from the provider
        if (replaceFileProp) {
          // This uses the StoredFilesProvider's replaceFile action which manages state properly
          replaceFileProp({
            file: normalizedFile,
            fileId: fileToReplace.id,
            ownerId,
            ownerType,
          });
        }
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
  const onReplaceClick = (file: UploadFile): void => {
    const fileId = (file as IStoredFile).id || file.uid;
    setFileToReplace({ uid: file.uid, id: fileId });
    if (hiddenUploadInputRef.current) {
      hiddenUploadInputRef.current.click();
    }
  };
  const hasFiles = !!fileList.length;

  const { height: containerHeight, width: containerWidth } = model;
  const {
    thumbnailHeight: height,
    thumbnailWidth: width,
    fontColor,
    fontSize,
    iconSize,
    fontWeight,
    backgroundColor,
    borderColor,
    borderRadius,
    borderSize,
    borderType,
  } = model;

  const styling = JSON.parse(model.stylingBox || '{}');
  const stylingBoxAsCSS = pickStyleFromModel(styling);
  const jsStyle = getStyle(model?.style, allData.data);
  const downloadedFileStyle = {
    ...downloadedFileStyles, 
    ...getStyle(downloadedFileStyles?.style, allData.data),
  };

  const fullStyle = {
    width: addPx(width),
    height: addPx(height),
    color: fontColor,
    fontSize,
    fontWeight,
    backgroundColor,
    borderColor,
    borderRadius: addPx(borderRadius),
    borderWidth: addPx(borderSize),
    borderStyle: borderType,
    ...getStyle(itemStyle, allData.data)
  };

  const { styles } = useStyles({
    containerStyles: {
      width: layout === 'vertical' && listType === 'thumbnail' ? undefined : addPx(containerWidth),
      height: layout === 'horizontal' && listType === 'thumbnail' ? undefined : addPx(containerHeight),
      ...jsStyle,
      ...stylingBoxAsCSS,
    },
    style: { ...fullStyle,  },
    model: {
      gap: addPx(gap),
      layout: listType === 'thumbnail' && !isDragger,
      hideFileName: rest.hideFileName && listType === 'thumbnail',
    },
    downloadedFileStyles: {
      ...downloadedFileStyle
    }
  });

  const listTypeAndLayout = getListTypeAndLayout(listType, isDragger);

  const openFilesZipNotification = (): void => {
    notification.success({
      message: `Download success!`,
      description: 'Your files have been downloaded successfully. Please check your download folder.',
      placement: 'topRight',
    });
  };

  useEffect(() => {
    if (isDownloadZipSucceeded) {
      openFilesZipNotification();
    }
  }, [isDownloadZipSucceeded]);

  // Cleanup cache when file list changes to prevent memory leaks
  useEffect(() => {
    const currentFileIds = new Set(
      fileList.map((f) => (f as IStoredFile).id || f.uid),
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
      const newImageUrls: { [key: string]: string } = {};
      for (const file of fileList) {
        if (isImageType(file.type)) {
          try {
            const { url: imageUrl, revoke } = await fetchStoredFile(file.url, httpHeaders);
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
        const oldUrls = Object.values(imageUrlsRef.current);
        const newUrls = Object.values(newImageUrls);
        oldUrls.forEach((url) => {
          if (!newUrls.includes(url)) {
            URL.revokeObjectURL(url);
          }
        });

        setImageUrls(newImageUrls);
      }
    };

    fetchImages();

    return () => {
      isCancelled = true;
      // Call all revoke functions to clean up blob URLs
      revokeCallbacks.forEach((revoke) => revoke());
    };
  }, [fileList, httpHeaders]);


  const handlePreview = (file: UploadFile): void => {
    setPreviewImage({ url: imageUrls[file.uid], uid: file.uid, name: file.name });
    setPreviewOpen(true);
  };

  const iconRender = (file: UploadFile): React.ReactNode => {
    const { type, uid } = file;

    if (isImageType(type)) {
      if (listType === 'thumbnail' && !isDragger) {
        return (
          <Space size="small" direction="vertical">
            <Image src={imageUrls[uid]} alt={file.name} preview={false} />          </Space>
        );
      }
    }

    return getFileIcon(type, iconSize);
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
          fileType: file.type,
        }),
      );
    }

    return fileContextCache.current.get(cacheKey)!;
  }, []);

  const placeholderFile = useMemo(() => createPlaceholderFile(), []);

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
      uploadFile({ file: options.file, ownerId, ownerType });
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
      const persistedFileId = (file as IStoredFile).id; // Only persisted files have .id

      const actions = (
        <Space size={5}>
          {allowReplace && !disabled && persistedFileId && isValidGuid(persistedFileId) && (
            <Button
              size="small"
              icon={<SyncOutlined />}
              title="Replace file"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onReplaceClick(file);
              }}
            />
          )}
          {allowDelete && !disabled && (
            <Popconfirm
              title="Delete Attachment"
              onConfirm={(e) => {
                e?.preventDefault();
                e?.stopPropagation();
                deleteFile(fileId);
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
          {customActions && customActions.length > 0 && (
            <DataContextProvider
              id={`file_ctx_${fileId}`}
              name="currentFile"
              description="File context for custom actions"
              type="control"
              initialData={getFileContextData(file, fileId)}
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
          )}
        </Space>
      );

      const handleItemClick = (e: React.MouseEvent): void => {
        // Don't trigger preview if clicking on buttons, links, or action elements
        const target = e.target as HTMLElement;
        const isActionElement = target.closest('button') ||
          target.closest('.ant-btn') ||
          target.closest('.ant-popover') ||
          target.closest('[role="button"]');

        if (isActionElement) {
          return;
        }

        // If it's an image, trigger preview instead of download
        if (isImageType(file.type)) {
          e.preventDefault();
          e.stopPropagation();
          handlePreview(file);
        } else {
          downloadFile({ fileId: file.uid, fileName: file.name });
        };
      };

      // For text listType, we need to wrap only the file name in Popover
      // For thumbnail and other types, wrap the entire content
      const renderContent = (): React.ReactNode => {
        if (listType === 'text') {
          return (
            <div className={classNames(isDownloaded && styleDownloadedFiles ? styles.downloadedFile : '', styles.fileNameWrapper)} onClick={handleItemClick}>
              <Popover
                content={actions}
                trigger="hover"
                placement="top"
                style={{ padding: '0px' }}
                onOpenChange={(open) => {
                  if (open) {
                    storedFilesActions?.setCurrentFile(file as IStoredFile);
                  }
                }}
              >
                <div className={styles.fileName}>
                  {iconRender(file)}
                  <FileNameDisplay file={file} />
                </div>
              </Popover>
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
          <Popover
            content={actions}
            trigger="hover"
            placement="top"
            style={{ padding: '0px' }}
            onOpenChange={(open) => {
              if (open) {
                storedFilesActions?.setCurrentFile(file as IStoredFile);
              }
            }}
          >
            {content}
          </Popover>
        );
      };

      return (
        <div>
          {renderContent()}
          {listType === 'thumbnail' && (
            <div className={isDownloaded ? styles.downloadedFile : ''}>
              <FileNameDisplay file={file} className={styles.fileName} />
            </div>
          )}
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
    },
  };

  const renderUploadContent = (): React.ReactNode => {
    return (
      !disabled && (
        <Button type="link" icon={<UploadOutlined />} disabled={disabled} {...uploadBtnProps}>
          {listType === 'text' && '(press to upload)'}
        </Button>
      )
    );
  };

  const layoutClassName = useMemo(() => {
        if (listTypeAndLayout === 'text') return '';
        switch (layout) {
          case 'horizontal': return styles.shaStoredFilesRendererHorizontal;
          case 'vertical': return styles.shaStoredFilesRendererVertical;
          case 'grid': return styles.shaStoredFilesRendererGrid;
          default: return '';
        }
      }, [layout, listTypeAndLayout, styles]);
      
  return (
    fileList.length === 0 && disabled ? null : (
    <div className={classNames(styles.shaStoredFilesRenderer, layoutClassName)}
    >
      {isStub
        ? (isDragger
          ? <Dragger disabled><DraggerStub /></Dragger>
          : (
            <>
              <div
                className={listType === 'thumbnail' ? 'ant-upload-list-item-thumbnail thumbnail-stub' : ''}
              >
                <Button type="link"
                  icon={<PictureOutlined style={{fontSize: iconSize}}/>}
                  disabled={disabled}
                  {...uploadBtnProps}
                  style={{ color: fontColor }}>
                  {listType === 'text' && '(press to upload)'}
                </Button>
              </div>
              <div style={(listType === 'thumbnail' && !isDragger) ? { width } : {}}>
                {listType !== 'text' && !rest.hideFileName && (
                  <FileNameDisplay file={placeholderFile} className={styles.fileName} />
                )}
                {hasExtraContent && extraFormId && (
                  <ExtraContent
                    file={placeholderFile}
                    formId={extraFormId}
                  />
                )}
              </div>

            </>
          )
        )
        : (props.disabled && fileList.length === 0
          ? null
          : props.disabled
            ? <Upload {...props} style={fullStyle}
              listType={listTypeAndLayout} />
            : isDragger
              ? (
                <Dragger {...props}>
                  <DraggerStub />
                </Dragger>
              )
              : <Upload {...props} listType={listTypeAndLayout}>{renderUploadContent()}</Upload>)}
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
    )
  );
};

export default StoredFilesRendererBase;