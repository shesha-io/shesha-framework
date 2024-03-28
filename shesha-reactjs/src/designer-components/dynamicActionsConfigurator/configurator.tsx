import React from 'react';
import { FC } from 'react';
import { IDynamicActionsConfiguratorComponentProps } from './interfaces';
import { IDynamicActionsConfiguration } from './models';
import { ProviderSelector } from './providerSelector';

export interface IDynamicActionsConfiguratorProps {
    value?: IDynamicActionsConfiguration;
    onChange?: (newValue: IDynamicActionsConfiguration) => void;
    editorConfig: IDynamicActionsConfiguratorComponentProps;
    readOnly?: boolean;
}

export const DynamicActionsConfigurator: FC<IDynamicActionsConfiguratorProps> = ({ value, onChange, readOnly }) => {
    const { providerUid } = value ?? {};

    const onChangeProvider = (newValue: string) => {
        const newModel: IDynamicActionsConfiguration = { ...(value ?? {}), providerUid: newValue };
        onChange(newModel);
    };

    return (
        <div>
            <ProviderSelector value={providerUid} onChange={onChangeProvider} readOnly={readOnly} />
        </div>
    );
};