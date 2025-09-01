import { useConfigurationStudio } from '@/configuration-studio/cs/contexts';
import { useActiveDoc } from '@/configuration-studio/cs/hooks';
import React, { FC } from 'react';

export interface IItemToolbarHolderProps {

}

export const ItemToolbarHolder: FC<IItemToolbarHolderProps> = () => {
    const cs = useConfigurationStudio();
    useActiveDoc();
    return (
        <div ref={cs.toolbarRef}>
        </div>
    );
};