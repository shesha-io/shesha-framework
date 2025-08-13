import { DebugButton } from '@/components/formDesigner/toolbar/debugButton';
import { FormSettingsButton } from '@/components/formDesigner/toolbar/formSettingsButton';
import { PreviewButton } from '@/components/formDesigner/toolbar/previewButton';
import { SaveButton } from '@/components/formDesigner/toolbar/saveButton';
import { UndoRedoButtons } from '@/components/formDesigner/toolbar/undoRedoButtons';
import React, { FC } from 'react';

export interface IFormToolbarProps {
    readOnly?: boolean;
}

export const FormToolbar: FC<IFormToolbarProps> = ({ readOnly }) => {
    return (
        <div>
            <FormSettingsButton buttonText=''/>
            <SaveButton size='small' type='link'/>
            {!readOnly && (<UndoRedoButtons size='small'/>)}
            <PreviewButton size='small'/>
            { false && <DebugButton /> }            
        </div>
    );
};