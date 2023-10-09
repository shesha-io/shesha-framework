import { ButtonGroupItemProps } from 'providers/buttonGroupConfigurator/models';
import { DynamicItemsEvaluationHook, DynamicRenderingHoc } from 'providers/dynamicActionsDispatcher/models';
import React, { PropsWithChildren, useEffect, useMemo } from 'react';
import { FC } from 'react';
import { DynamicActionsProvider } from '../index';

export interface IReportingActionsProps {
    
}

const ReportTestItems: ButtonGroupItemProps[] = [
    { id: 'r1', name: 'btn1', label: 'report item 1', itemType: 'item', itemSubType: 'button', sortOrder: 0 },
    { id: 'r2', name: 'btn2', label: 'report item 2', itemType: 'item', itemSubType: 'button', sortOrder: 1 },
    { id: 'r3', name: 'btn3', label: 'report item 3', itemType: 'item', itemSubType: 'button', sortOrder: 2 },
];

export const ReportingActions: FC<PropsWithChildren<IReportingActionsProps>> = ({ children }) => {
    const evaluator: DynamicItemsEvaluationHook = (args) => {
        useEffect(() => {
            args.onEvaluated(ReportTestItems);
        }, []);
    };

    return (
        <DynamicActionsProvider
            id='reports'
            name='Reports'
            renderingHoc={reportingActionsHoc}
            useEvaluator={evaluator}
        >
            {children}
        </DynamicActionsProvider>
    );
};

const reportingActionsHoc: DynamicRenderingHoc = (WrappedComponent) => {
    return props => {
        const testItems = useMemo<ButtonGroupItemProps[]>(() => {
            return ReportTestItems;
        }, []);
    
        return (<WrappedComponent {...props} items={testItems} hocType={'report'}/>);
    };
};