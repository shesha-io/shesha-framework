import { ButtonGroupItemProps } from 'providers/buttonGroupConfigurator/models';
import { DynamicRenderingHoc } from 'providers/dynamicActionsDispatcher/models';
import React, { PropsWithChildren, useMemo } from 'react';
import { FC } from 'react';
import { DynamicActionsProvider } from '../index';

export interface IEntityCrudActionsProps {
    
}

export const EntityCrudActions: FC<PropsWithChildren<IEntityCrudActionsProps>> = ({ children }) => {
    return (
        <DynamicActionsProvider
            id='entity-crud'
            name='CRUD Actions'
            renderingHoc={entityActionsHoc}
        >
            {children}
        </DynamicActionsProvider>
    );
};

const entityActionsHoc: DynamicRenderingHoc = (WrappedComponent) => {
    return props => {
        const testItems = useMemo<ButtonGroupItemProps[]>(() => {
            const items: ButtonGroupItemProps[] = [
                { id: '1', name: 'btn1', label: 'entity action 1', itemType: 'item', itemSubType: 'button', sortOrder: 0, buttonType: 'link' },
                { id: '2', name: 'btn2', label: 'entity action 2', itemType: 'item', itemSubType: 'button', sortOrder: 1 },
            ];;
            return items;
        }, []);
    
        return (<WrappedComponent {...props} items={testItems}/>);
    };
};