import React, { FC } from 'react';
import { Button } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useFormActions } from '@/providers';
import { useFormDesignerActions, useFormDesignerStateSelector } from '@/providers/formDesigner';

export interface IPreviewButtonProps {

}

export const PreviewButton: FC<IPreviewButtonProps> = () => {
    const { setFormMode } = useFormActions();
    const { setFormMode: setFormDesignerMode } = useFormDesignerActions();
    const formMode = useFormDesignerStateSelector(x => x.formMode);
    
    return (
        <Button
            icon={<EyeOutlined/>}
            onClick={() => {
                setFormMode(formMode === 'designer' ? 'edit' : 'designer');
                setFormDesignerMode(formMode === 'designer' ? 'edit' : 'designer');
            }}
            size='small'
            type={formMode === 'designer' ? 'default' : 'primary'}
            title="Preview"
            />
    );
};