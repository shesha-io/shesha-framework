import { ItemEditorProps } from '@/configuration-studio/models';
import { SaveOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React, { FC } from 'react';
import { useShaFormInstance, useShaFormDataUpdate, useShaFormSubscription } from '@/providers/form/providers/shaFormProvider';

export interface IGenericToolbarProps extends ItemEditorProps {

}

export const GenericToolbar: FC<IGenericToolbarProps> = ({ }) => {
    useShaFormDataUpdate();
    useShaFormSubscription('data-loading');
    useShaFormSubscription('data-submit');
    const shaForm = useShaFormInstance();

    const onSaveClick = () => {
        shaForm.submit();
    };
    return (
        <div>
            <Button type="link" icon={<SaveOutlined />} onClick={onSaveClick} disabled={!shaForm.isDataModified}>Save</Button>
        </div>
    );
};
