import React, { useState, useEffect } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Image, Upload } from 'antd';
import type { UploadFile } from 'antd';
import { toBase64 } from './utils';
import FormItem from '@/designer-components/_settings/components/formItem';

interface ImageUploaderProps {
    backgroundImage: {
        file: UploadFile;
        fileList: UploadFile[];
    } | null;
    readOnly: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ backgroundImage, readOnly }) => {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    useEffect(() => {
        if (backgroundImage && backgroundImage.fileList) {
            setFileList(backgroundImage.fileList);
        }
    }, [backgroundImage]);

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await toBase64(file.originFileObj as File);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
    };

    const handleChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
        setFileList(newFileList);
    };

    const uploadButton = (
        <button style={{ border: 0, background: 'none' }} type="button">
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </button>
    );

    return (
        <div style={{ position: 'relative' }}>
            <FormItem name="styles.background.file" label="File" jsSetting>
                <Upload
                    listType="picture"
                    fileList={fileList}
                    onPreview={handlePreview}
                    onChange={handleChange}
                    disabled={readOnly}
                >
                    {fileList.length >= 1 ? null : uploadButton}
                </Upload>
            </FormItem>

            <Image
                style={{ display: 'none' }}
                preview={{
                    visible: previewOpen,
                    onVisibleChange: (visible) => setPreviewOpen(visible),
                }}
                src={previewImage}
            />
        </div>
    );
};

export default ImageUploader;