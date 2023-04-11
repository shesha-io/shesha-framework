import React from 'react';
import { PageWithLayout } from '../../interfaces';
import { SettingsEditor } from '../../components';

export interface ISettingsEditorPageProps {
    id?: string;
}

const SettingsEditorPage: PageWithLayout<ISettingsEditorPageProps> = () => {
    return (
        <SettingsEditor />
    );
};

export default SettingsEditorPage;