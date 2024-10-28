import React, { useState, useEffect, useRef } from 'react';
import { PlusOutlined, SyncOutlined, UploadOutlined } from '@ant-design/icons';
import { Image, Upload } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import { toBase64 } from './utils';

interface IImageUploaderProps {
    onChange: (value: any) => void;
    value: UploadFile;
    readOnly: boolean;
}

const ImageUploader = ({ onChange, value, readOnly }: IImageUploaderProps) => {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [fileList, setFileList] = useState<UploadFile[]>(value ? [{ ...value }] : []);

    const uploadBtnRef = useRef(null);

    useEffect(() => {
        if (value?.uid) {
            setFileList([value]);
        }
    }, [value]);

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await toBase64(file.originFileObj as File);
        }
        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
    };

    const handleChange: UploadProps['onChange'] = async ({ fileList }) => {
        if (fileList.length > 1) fileList.shift();
        const file = fileList[0];

        if (file?.originFileObj) {
            const base64Image = await toBase64(file.originFileObj as File);
            onChange({ ...file, url: base64Image });
        }
    };

    const handleRemove = () => {
        setFileList([]);
        onChange({});
    };

    const handleReplace = (file: UploadFile) => {
        setFileList([file]);
        onChange(file);
    };

    const fileControls = (file: UploadFile) => {
        return (
            <a onClick={() => handleReplace(file)} style={{ position: 'relative', top: 52 }}>
                <SyncOutlined title="Replace" />
            </a>
        );
    };

    const uploadButton = (
        <button ref={uploadBtnRef} style={{ border: 0, background: 'none' }} type="button">
            <UploadOutlined title='upload' />
        </button>
    );

    return (
        <div>
            <Upload
                listType="picture"
                fileList={fileList}
                onPreview={handlePreview}
                onRemove={handleRemove}
                onChange={handleChange}
                beforeUpload={() => false}
                disabled={readOnly}
            >
                {!fileList[0]?.uid && uploadButton}

            </Upload>
            <Image
                style={{ display: 'none' }}
                preview={{
                    visible: previewOpen,
                    onVisibleChange: (visible) => setPreviewOpen(visible),
                }}
                src={previewImage}
            />
            {fileControls(fileList[0])}
        </div>
    );
};

export default ImageUploader;
