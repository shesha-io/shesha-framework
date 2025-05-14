import { useMetadata } from '@/providers';
import { ButtonGroupItemProps } from '@/providers/buttonGroupConfigurator/models';
import { DynamicItemsEvaluationHook, DynamicRenderingHoc } from '@/providers/dynamicActionsDispatcher/models';
import React, { PropsWithChildren, useMemo } from 'react';
import { FC } from 'react';
import { DynamicActionsProvider } from '../index';

export interface IStandardApisProps {

}

const StandardApisItems: ButtonGroupItemProps[] = [
    { id: 'r1', name: 'http', label: 'Http client', itemType: 'item', itemSubType: 'button', sortOrder: 0 },
    { id: 'r2', name: 'message', label: 'message', itemType: 'item', itemSubType: 'button', sortOrder: 1 },
    { id: 'r3', name: 'moment', label: 'moment', itemType: 'item', itemSubType: 'button', sortOrder: 2 },
];

const useStandardApis: DynamicItemsEvaluationHook = (args) => {
    const { metadata } = useMetadata(false) ?? {};
    const { item } = args;

    const operations = useMemo<ButtonGroupItemProps[]>(() => {
        // if (!isEntityMetadata(metadata))
        //     return [];

        return StandardApisItems;
    }, [item, metadata]);

    return operations;
};

const standardApisHoc: DynamicRenderingHoc = (WrappedComponent) => {
    return props => {
        const testItems = useMemo<ButtonGroupItemProps[]>(() => {
            return StandardApisItems;
        }, []);

        return (<WrappedComponent {...props} items={testItems} />);
    };
};

export const StandardApis: FC<PropsWithChildren<IStandardApisProps>> = ({ children }) => {
    return (
        <DynamicActionsProvider
            id='shesha-apis'
            name='Shesha APIs'
            renderingHoc={standardApisHoc}
            useEvaluator={useStandardApis}
        >
            {children}
        </DynamicActionsProvider>
    );
};