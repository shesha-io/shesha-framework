import React, { FC, useState } from 'react';
import { IDocumentInstance } from '../models';
import { useConfigurationStudio } from '../cs/contexts';
import { CustomErrorBoundary } from '@/components';
import { useActiveDoc } from '../cs/hooks';
import { usePortal } from '@/hooks/usePortal';

export interface IDocumentToolbarProps {
    doc: IDocumentInstance;
}

export const DocumentToolbar: FC<IDocumentToolbarProps> = ({ doc }) => {
    const cs = useConfigurationStudio();
    const activeDoc = useActiveDoc();
    const Portal = usePortal(cs.toolbarRef.current);

    const Toolbar = doc.itemId === activeDoc?.itemId
        ? doc?.definition?.Toolbar
        : undefined;

    const [, forceUpdate] = useState({});
    cs.setDocumentToolbarRerenderer(doc.itemId, () => forceUpdate({}));

    return (
        <Portal>
            <CustomErrorBoundary key={doc.itemId}>
                {Toolbar && <Toolbar doc={doc} key={doc.itemId} />}
            </CustomErrorBoundary>
        </Portal>
    );    
};