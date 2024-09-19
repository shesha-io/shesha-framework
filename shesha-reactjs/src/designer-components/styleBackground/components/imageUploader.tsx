import React, { useState, useEffect } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Image, Upload } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import { toBase64 } from './background/utils';
import FormItem from '@/designer-components/_settings/components/formItem';

const ImageUploader = ({ backgroundImage, readOnly }) => {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    useEffect(() => {
        if (backgroundImage) {
            setFileList([
                {
                    uid: '-1',
                    name: 'image.png',
                    status: 'done',
                    url: backgroundImage,
                },
            ]);
        }
    }, [backgroundImage]);

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await toBase64(file.originFileObj as File);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
    };

    const uploadButton = (
        <button style={{ border: 0, background: 'none' }} type="button">
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </button>
    );

    return (
        <div style={{ position: 'relative' }}>
            <FormItem name="style.background.file" label="File" jsSetting>
                <Upload
                    listType="text"
                    fileList={fileList}
                    onPreview={handlePreview}
                    beforeUpload={() => false}
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