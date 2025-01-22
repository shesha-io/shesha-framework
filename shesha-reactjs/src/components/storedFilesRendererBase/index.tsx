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
import { FileExcelOutlined, FileImageOutlined, FilePdfOutlined, FilePptOutlined, FileTextOutlined, FileWordOutlined, FileZipOutlined, PaperClipOutlined, UploadOutlined } from '@ant-design/icons';
import { IDownloadFilePayload, IStoredFile, IUploadFilePayload } from '@/providers/storedFiles/contexts';
import { RcFile, UploadChangeParam } from 'antd/lib/upload/interface';
import { useStyles } from './styles/styles';
import { IInputStyles } from '@/designer-components/textField/interfaces';
import { getStyle, pickStyleFromModel, toBase64 } from '@/index';
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
  const [previewImage, setPreviewImage] = useState('');

  const listTypeAndLayout = listType === 'text' ? 'text' : 'picture-card';

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
    if (!file.url && !file.preview) {
      file.preview = await toBase64(file.originFileObj);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };
  const isImageType = (type) => ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'].includes(type);

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
      if (isImageType(file.type)) handlePreview(file);
      else downloadFile({ fileId: uid, fileName: name });
    },
    showUploadList: {
      showRemoveIcon: allowDelete,
    },
    iconRender: (file) => {
      const { type } = file;

      if ((isImageType(type)) && listType === 'thumbnail') {
        return <Image src={file.url} alt={file.name} preview={false} />;
      };

      if (isImageType(type)) {
        return <FileImageOutlined style={{ color: '#03A9F4' }} />;
      } else if (type === '.pdf') {
        return <FilePdfOutlined style={{ color: '#ED2224' }} />;
      } else if (type === '.doc' || type === '.docx') {
        return <FileWordOutlined style={{ color: '#2B579A' }} />;
      } else if (type === '.xls' || type === '.xlsx') {
        return <FileExcelOutlined style={{ color: '#217346' }} />;
      } else if (type === '.ppt' || type === '.pptx') {
        return <FilePptOutlined style={{ color: '#D24726' }} />;
      } else if (type === '.zip' || type === '.rar' || type === '.tar') {
        return <FileZipOutlined style={{ color: '#FFC107' }} />;
      } else if (type === '.txt' || type === '.csv') {
        return <FileTextOutlined style={{ color: '#9E9E9E' }} />;
      }
      return <PaperClipOutlined />;
    },
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
            afterOpenChange: (visible) => !visible && setPreviewImage(''),
          }}
          src={previewImage}
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
