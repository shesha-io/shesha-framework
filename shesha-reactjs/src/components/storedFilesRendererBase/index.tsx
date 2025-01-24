import Dragger, { DraggerProps } from 'antd/lib/upload/Dragger';
import React, { FC, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  ButtonProps,
  App,
  Upload,
  Image,
  UploadFile,
} from 'antd';
import { DraggerStub } from '@/components/fileUpload/stubs';
import { DownloadOutlined, FileZipOutlined, UploadOutlined } from '@ant-design/icons';
import { IDownloadFilePayload, IStoredFile, IUploadFilePayload } from '@/providers/storedFiles/contexts';
import { RcFile, UploadChangeParam } from 'antd/lib/upload/interface';
import { useStyles } from './styles/styles';
import { IInputStyles } from '@/designer-components/textField/interfaces';
import { getStyle, IconType, pickStyleFromModel, ShaIcon, useSheshaApplication } from '@/index';
import { fileIcons, isImageType } from '@/designer-components/attachmentsEditor/utils';
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
  validFileTypes?: IUploaderFileTypes[];
  maxFileLength?: number;
  isDragger?: boolean;
  disabled?: boolean;
  uploadBtnProps?: ButtonProps;
  /* isStub is used just to fix strange error when the user is reordering components on the form */
  isStub?: boolean;
  allowedFileTypes?: string[];
  maxHeight?: string;
  layout: 'vertical' | 'horizontal' | 'grid';
  listType: 'text' | 'thumbnail';
  thumbnailWidth?: string;
  thumbnailHeight?: string;
  borderRadius?: number;
  hideFileName?: boolean;
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
  disabled,
  isStub = false,
  allowedFileTypes = [],
  maxHeight,
  downloadZip,
  allowDelete,
  layout,
  listType,
  hideFileName,
  stylingBox,
  style,
  borderSize, borderColor, borderType, fontColor, fontSize, width, height, thumbnailHeight, borderRadius, thumbnailWidth
}) => {
  const { httpHeaders } = useSheshaApplication();

  const hasFiles = !!fileList.length;
  const addPx = (value) => /^\d+(\.\d+)?$/.test(value) ? `${value}px` : value;
  const styling = JSON.parse(stylingBox || '{}');
  const customStyle = getStyle(style || '{}');
  const stylingBoxAndCSS = pickStyleFromModel(styling);

  const jsSstyles = { ...customStyle, ...stylingBoxAndCSS };

  const { styles } = useStyles({
    borderSize: addPx(borderSize), borderColor, borderType, fontColor, fontSize: addPx(fontSize), width: addPx(width), height: addPx(height), maxHeight: addPx(maxHeight),
    thumbnailHeight: addPx(thumbnailHeight), borderRadius: addPx(borderRadius), thumbnailWidth: addPx(thumbnailWidth), layout: listType === 'thumbnail' ? layout : false,
    hideFileName: hideFileName && listType === 'thumbnail', isDragger, styles: jsSstyles
  });

  const { message, notification } = App.useApp();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState({ url: '', uid: '', name: '' });
  const [imageUrls, setImageUrls] = useState<{ [key: string]: string }>({});

  const listTypeAndLayout = listType === 'text' || !listType ? 'text' : 'picture-card';

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

  const handlePreview = async (file: UploadFile) => {
    setPreviewImage({ url: imageUrls[file.uid], uid: file.uid, name: file.name });
    setPreviewOpen(true);
  };

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

  const iconRender = (file) => {
    const { type, uid } = file;

    if (isImageType(type) && listType === 'thumbnail') {
      if (!imageUrls[uid]) {
        fetchStoredFile(file.url).then((imageUrl) => {
          setImageUrls((prev) => ({ ...prev, [uid]: imageUrl }));
        });
      }

      return <Image src={imageUrls[uid]} alt={file.name} preview={false} />;
    }

    const icon = fileIcons[type] ? fileIcons[type] : fileIcons['default'];
    return <ShaIcon iconName={icon.name as IconType} style={{ color: icon.color, verticalAlign: 'middle' }} />;
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
      <Button type="link" icon={<UploadOutlined />} style={{ display: disabled ? 'none' : '' }} {...uploadBtnProps}>
        {listType === 'text' && 'press to upload'}
      </Button>
    );
  };

  return (
    <div className={`${styles.shaStoredFilesRenderer} ${layout === 'horizontal' && listTypeAndLayout !== 'text' ? styles.shaStoredFilesRendererHorizontal :
      layout === 'vertical' && listTypeAndLayout !== 'text' ? styles.shaStoredFilesRendererVertical : layout === 'grid' && listTypeAndLayout !== 'text' ? styles.shaStoredFilesRendererGrid : ''}`}>
      {isStub
        ? isDragger
          ? <Dragger disabled><DraggerStub /></Dragger>
          : <div>{renderUploadContent()}</div>
        : props.disabled
          ? <Upload {...props} listType={listTypeAndLayout} />
          : isDragger
            ? <Dragger {...props}><DraggerStub /></Dragger>
            : <Upload {...props} listType={listTypeAndLayout}>{!props.disabled ? renderUploadContent() : null}</Upload>
      }

      {previewImage && (
        <Image
          wrapperStyle={{ display: 'none' }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(null),
            toolbarRender: (original) => {
              return <div style={{ display: 'flex', flexDirection: 'row-reverse' }}><DownloadOutlined onClick={() => downloadFile({ fileId: previewImage.uid, fileName: previewImage.name })} style={{ background: '#0000001A', fontSize: 24, padding: '8px', borderRadius: '100px' }} />{original}</div>;
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
