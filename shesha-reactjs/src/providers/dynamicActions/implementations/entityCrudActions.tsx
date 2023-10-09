import { ButtonGroupItemProps } from 'providers/buttonGroupConfigurator/models';
import { DynamicItemsEvaluationHook, DynamicRenderingHoc } from 'providers/dynamicActionsDispatcher/models';
import React, { PropsWithChildren, useEffect, useMemo } from 'react';
import { FC } from 'react';
import { DynamicActionsProvider } from '../index';

export interface IEntityCrudActionsProps {
    
}

const EntityTestItems: ButtonGroupItemProps[] = [
    { id: '1', name: 'btn1', label: 'entity action 1', itemType: 'item', itemSubType: 'button', sortOrder: 0, buttonType: 'link' },
    { id: '2', name: 'btn2', label: 'entity action 2', itemType: 'item', itemSubType: 'button', sortOrder: 1 },
];

export const EntityCrudActions: FC<PropsWithChildren<IEntityCrudActionsProps>> = ({ children }) => {
    const evaluator: DynamicItemsEvaluationHook = (args) => {
        useEffect(() => {
            args.onEvaluated(EntityTestItems);
        }, []);
    };
    return (
        <DynamicActionsProvider
            id='entity-crud'
            name='CRUD Actions'
            renderingHoc={entityActionsHoc}
            useEvaluator={evaluator}
        >
            {children}
        </DynamicActionsProvider>
    );
};

const entityActionsHoc: DynamicRenderingHoc = (WrappedComponent) => {
    return props => {
        const testItems = useMemo<ButtonGroupItemProps[]>(() => {
            return EntityTestItems;
        }, []);
    
        return (<WrappedComponent {...props} items={testItems}/>);
    };
};