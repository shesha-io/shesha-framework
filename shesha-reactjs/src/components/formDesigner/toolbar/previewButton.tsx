import React, { FC } from 'react';
import { Button } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useFormActions } from '@/providers';
import { useFormDesignerActions, useFormDesignerStateSelector } from '@/providers/formDesigner';

export interface IPreviewButtonProps {

}

export const PreviewButton: FC<IPreviewButtonProps> = () => {
    const { setFormMode } = useFormActions();
    const { setFormMode: setFormDesignerMode, setSelectedComponent } = useFormDesignerActions();
    const formMode = useFormDesignerStateSelector(x => x.formMode);
    
    return (
        <Button
            onClick={() => {
                setFormMode(formMode === 'designer' ? 'edit' : 'designer');
                setFormDesignerMode(formMode === 'designer' ? 'edit' : 'designer');
                if (formMode === 'designer')
                  setSelectedComponent(null);
            }}
            type={formMode === 'designer' ? 'default' : 'primary'}
            shape="circle"
            title="Preview"
        >
            <EyeOutlined />
        </Button>
    );
};