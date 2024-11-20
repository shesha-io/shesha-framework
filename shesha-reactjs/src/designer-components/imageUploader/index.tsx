import React, { useState, useRef } from 'react';
import { SyncOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Upload } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import { toBase64 } from '../_settings/utils/background/utils';
import { useStyles } from './style';

interface IImageUploaderProps {
    onChange: (value: any) => void;
    value: UploadFile;
    readOnly: boolean;
}

const ImageUploader = ({ onChange, value, readOnly }: IImageUploaderProps) => {
    const [fileList, setFileList] = useState<UploadFile[]>(value ? [{ ...value }] : []);
    const { styles } = useStyles();


    const uploadBtnRef = useRef<HTMLButtonElement | null>(null);

    const handleChange: UploadProps['onChange'] = async ({ fileList }) => {
        if (fileList.length > 1) fileList.shift();
        const file = fileList[0];

        if (file?.originFileObj) {
            const base64Image = await toBase64(file.originFileObj as File);
            onChange({ ...file, url: base64Image, name: "" });
            setFileList([{ ...file, url: base64Image, name: "" }]);
        } else {
            onChange({});
            setFileList([]);
        }
    };

    const handleRemove = () => {
        setFileList([]);
        onChange({});
    };


    const uploadButton = (
        <Button size="small" ref={uploadBtnRef} style={{ top: '5px' }}>
            {fileList.length === 0 ? <UploadOutlined title='upload' /> : <SyncOutlined title='Replace' />}
        </Button>
    );

    console.log("FileList", fileList, "Value", value);

    return (
        <div className={styles.image}>
            <Upload
                listType="text"
                fileList={[]}
                onRemove={handleRemove}
                onChange={handleChange}
                beforeUpload={() => false}
                disabled={readOnly}
            >
                {uploadButton}
            </Upload>
        </div>
    );
};

export default ImageUploader;
