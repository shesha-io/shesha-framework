import Dragger, { DraggerProps } from 'antd/lib/upload/Dragger';
import React, { FC, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  ButtonProps,
  App,
  Upload,
  Image,
  UploadFile,
  ConfigProvider,
} from 'antd';
import { DraggerStub } from '@/components/fileUpload/stubs';
import { DownloadOutlined, FileZipOutlined, UploadOutlined } from '@ant-design/icons';
import { IDownloadFilePayload, IStoredFile, IUploadFilePayload } from '@/providers/storedFiles/contexts';
import { RcFile, UploadChangeParam } from 'antd/lib/upload/interface';
import { useStyles } from './styles/styles';
import { getStyle, IInputStyles, IStyleType, pickStyleFromModel, useSheshaApplication, ValidationErrors } from '@/index';
import { layoutType, listType } from '@/designer-components/attachmentsEditor/attachmentsEditor';
import { getFileIcon, isImageType } from '@/icons/fileIcons';
import { getSizeStyle } from '@/designer-components/_settings/utils/dimensions/utils';
import { getBorderStyle } from '@/designer-components/_settings/utils/border/utils';
import { getFontStyle } from '@/designer-components/_settings/utils/font/utils';
import { getShadowStyle } from '@/designer-components/_settings/utils/shadow/utils';
import { getBackgroundStyle } from '@/designer-components/_settings/utils/background/utils';
import { isValidGuid } from '../formDesigner/components/utils';
import { removeUndefinedProps } from '@/utils/object';
import { CSSProperties } from 'styled-components';
import { addPx } from '@/designer-components/_settings/utils';
interface IUploaderFileTypes {
  name: string;
  type: string;
}

export interface IStoredFilesRendererBaseProps extends IInputStyles {
  fileList?: IStoredFile[];
  allowUpload?: boolean;
  allowDelete?: boolean;
  showDragger?: boolean;
  ownerId?: string;
  ownerType?: string;
  multiple?: boolean;
  isDownloadingFileListZip?: boolean;
  isDownloadZipSucceeded?: boolean;
  fetchFilesError?: boolean;
  downloadZipFileError?: boolean;
  deleteFile: (fileIdToDelete: string) => void;
  uploadFile: (payload: IUploadFilePayload) => void;
  downloadZipFile?: () => void;
  downloadZip?: boolean;
  downloadFile: (payload: IDownloadFilePayload) => void;
  onFileListChanged?: (list: IStoredFile[]) => void;
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
  onFileListChanged,
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
  layout,
  listType,
  gap,
  ...rest
}) => {
  const { message, notification } = App.useApp();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState({ url: '', uid: '', name: '' });
  const [imageUrls, setImageUrls] = useState<{ [key: string]: string }>(fileList.reduce((acc, { uid, url }) => ({ ...acc, [uid]: url }), {}));

  const model = rest;
  const hasFiles = !!fileList.length;
  const { backendUrl, httpHeaders } = useSheshaApplication();

  const dimensions = model?.dimensions;
  const border = model?.border;
  const font = model?.font;
  const shadow = model?.shadow;
  const background = model?.background;
  const jsStyle = getStyle(model.style, model);
  const containerJsStyle = getStyle(model.container?.style, model.container);

  const dimensionsStyles = useMemo(() => getSizeStyle(dimensions), [dimensions]);
  const containerDimensions = useMemo(() => getSizeStyle(model.container?.dimensions), [model.container?.dimensions]);
  const borderStyles = useMemo(() => getBorderStyle(border, jsStyle), [border, jsStyle]);
  const fontStyles = useMemo(() => getFontStyle(font), [font]);
  const [backgroundStyles, setBackgroundStyles] = useState({});
  const shadowStyles = useMemo(() => getShadowStyle(shadow), [shadow]);

  useEffect(() => {

    const fetchStyles = async () => {
      const storedImageUrl = background?.storedFile?.id && background?.type === 'storedFile'
        ? await fetch(`${backendUrl}/api/StoredFile/Download?id=${background?.storedFile?.id}`,
          { headers: { ...httpHeaders, "Content-Type": "application/octet-stream" } })
          .then((response) => {
            return response.blob();
          })
          .then((blob) => {
            return URL.createObjectURL(blob);
          }) : '';

      const style = await getBackgroundStyle(background, jsStyle, storedImageUrl);
      setBackgroundStyles(style);
    };

    fetchStyles();
  }, [background, backendUrl, httpHeaders, jsStyle]);

  const styling = JSON.parse(model.container?.stylingBox || '{}');
  const stylingBoxAsCSS = pickStyleFromModel(styling);

  const additionalStyles: CSSProperties = removeUndefinedProps({
    ...dimensionsStyles,
    ...borderStyles,
    ...fontStyles,
    ...backgroundStyles,
    ...shadowStyles
  });


  const finalStyle = removeUndefinedProps(additionalStyles);

  const { styles } = useStyles({
    containerStyles: { ...{ ...containerDimensions, width: layout === 'vertical' ? '' : addPx(containerDimensions.width), height: layout === 'horizontal' ? '' : addPx(containerDimensions.height) }, ...containerJsStyle, ...stylingBoxAsCSS },
    style: finalStyle, model: { gap: addPx(gap), layout: listType === 'thumbnail' && !isDragger, hideFileName: rest.hideFileName && listType === 'thumbnail', isDragger, isStub },
    primaryColor
  });

  const listTypeAndLayout = listType === 'text' || !listType || isDragger ? 'text' : 'picture-card';

  const openFilesZipNotification = () =>
    notification.success({
      message: `Download success!`,
      description: 'Your files have been downloaded successfully. Please check your download folder.',
      placement: 'topRight',
    });

  const fetchStoredFile = (url: string) => {
    const response = fetch(`${url}`,
      { headers: { ...httpHeaders, "Content-Type": "application/octet-stream" } })
      .then((response) => {
        return response.blob();
      })
      .then((blob) => {
        return URL.createObjectURL(blob);
      });

    return response;
  };

  useEffect(() => {
    if (isDownloadZipSucceeded) {
      openFilesZipNotification();
    }
  }, [isDownloadZipSucceeded]);

  useEffect(() => {
    const fetchImages = async () => {
      const newImageUrls = { ...imageUrls };
      for (const file of fileList) {
        if (isImageType(file.type) && !newImageUrls[file.uid]) {
          const imageUrl = await fetchStoredFile(file.url);
          newImageUrls[file.uid] = imageUrl;
        }
      }
      setImageUrls(newImageUrls);
    };

    fetchImages();
  }, [fileList]);

  const handlePreview = async (file: UploadFile) => {
    setPreviewImage({ url: imageUrls[file.uid], uid: file.uid, name: file.name });
    setPreviewOpen(true);
  };

  const iconRender = (file) => {
    const { type, uid } = file;

    if (isImageType(type)) {
      if (listType === 'thumbnail' && !isDragger) {
        return <Image src={imageUrls[uid]} alt={file.name} preview={false} />;
      }
    }

    return getFileIcon(type);
  };


  if (model?.background?.type === 'storedFile' && model?.background.storedFile?.id && !isValidGuid(model?.background.storedFile.id)) {
    return <ValidationErrors error="The provided StoredFileId is invalid" />;
  }

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
      onFileListChanged(info.fileList);
    },
    onRemove(file) {
      deleteFile(file.uid);
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
    onDownload: ({ uid, name }) => {
      downloadFile({ fileId: uid, fileName: name });
    },
    onPreview: (file) => {
      const { uid, name } = file;
      if (isImageType(file.type)) {
        handlePreview(file);
      } else downloadFile({ fileId: uid, fileName: name });
    },
    showUploadList: {
      showRemoveIcon: allowDelete,
      showDownloadIcon: true,
    },
    iconRender,
  };


  const renderUploadContent = () => {
    return (
      <Button type="link" icon={<UploadOutlined />} disabled={disabled} {...uploadBtnProps}>
        {listType === 'text' && '(press to upload)'}
      </Button>
    );
  };

  return (
    <div className={`${styles.shaStoredFilesRenderer} ${layout === 'horizontal' && listTypeAndLayout !== 'text' ? styles.shaStoredFilesRendererHorizontal :
      layout === 'vertical' && listTypeAndLayout !== 'text' ? styles.shaStoredFilesRendererVertical : layout === 'grid' && listTypeAndLayout !== 'text' ? styles.shaStoredFilesRendererGrid : ''}`}>
      <ConfigProvider
        theme={{
          components: {
            Upload: {
              actionsColor: primaryColor,
            },
          },
        }}
      >
        {isStub
          ? (isDragger
            ? <Dragger disabled><DraggerStub /></Dragger>
            : <div
              className={listType === 'thumbnail' ? 'ant-upload-list-item-thumbnail ant-upload-list-item thumbnail-stub' : ''}
            >
              {renderUploadContent()}
              {listType !== 'text' && !rest.hideFileName &&
                <span className='ant-upload-list-item-name ant-upload-list-item-name-stub'>
                  {'file name'}
                </span>}
            </div>)
          : (props.disabled
            ? <Upload {...props} style={finalStyle} listType={listTypeAndLayout} />
            : isDragger ?
              <Dragger {...props}>
                <DraggerStub />
              </Dragger>
              : <Upload {...props} listType={listTypeAndLayout}>{!disabled ? renderUploadContent() : null}</Upload>)
        }
      </ConfigProvider>
      {previewImage && (
        <Image
          wrapperStyle={{ display: 'none' }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(null),
            toolbarRender: (original) => {
              return <div style={{ display: 'flex', flexDirection: 'row-reverse' }}><DownloadOutlined className={styles.antPreviewDownloadIcon} onClick={() => downloadFile({ fileId: previewImage.uid, fileName: previewImage.name })} />{original}</div>;
            },
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

    </div>
  );
};

export default StoredFilesRendererBase;
