import React, { useState, useRef } from 'react';
import { SyncOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Image, Upload } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import { toBase64 } from '../_settings/utils/background/utils';
import { useStyles } from './style';

interface IImageUploaderProps {
    onChange: (value: any) => void;
    value: UploadFile;
    readOnly: boolean;
}

const ImageUploader = ({ onChange, value, readOnly }: IImageUploaderProps) => {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [fileList, setFileList] = useState<UploadFile[]>(value ? [{ ...value }] : []);
    const { styles } = useStyles();


    const uploadBtnRef = useRef<HTMLButtonElement | null>(null);

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
            onChange({ ...file, url: base64Image, fileName: "" });
        } else {
            onChange({});
        }
    };

    const handleRemove = () => {
        setFileList([]);
        onChange({});
    };

    const handleReplace = (file: UploadFile) => {
        setFileList([]);
        if (uploadBtnRef.current) {
            uploadBtnRef.current.click();
        }
        setFileList([file]);
    };

    const fileControls = (file: UploadFile) => {
        return file ? (
            <a onClick={() => handleReplace(file)} className={styles.replaceBtn}>
                <SyncOutlined title="Replace" />
            </a>
        ) : null;
    };

    const uploadButton = (
        <Button ref={uploadBtnRef} style={{ display: fileList.length > 0 ? 'none' : 'block' }}>
            <UploadOutlined title='upload' />
        </Button>
    );

    return (
        <div className={styles.image}>
            <Upload
                listType="picture"
                fileList={fileList}
                onPreview={handlePreview}
                onRemove={handleRemove}
                onChange={handleChange}
                beforeUpload={() => false}
                disabled={readOnly}
            >
                {uploadButton}
            </Upload>
            <Image
                // style={{ display: 'none' }}
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
