import { ButtonGroupItemProps } from 'providers/buttonGroupConfigurator/models';
import { DynamicRenderingHoc } from 'providers/dynamicActionsDispatcher/models';
import React, { PropsWithChildren, useMemo } from 'react';
import { FC } from 'react';
import { DynamicActionsProvider } from '../index';

export interface IReportingActionsProps {
    
}

export const ReportingActions: FC<PropsWithChildren<IReportingActionsProps>> = ({ children }) => {
    return (
        <DynamicActionsProvider
            id='reports'
            name='Reports'
            renderingHoc={reportingActionsHoc}
        >
            {children}
        </DynamicActionsProvider>
    );
};

const reportingActionsHoc: DynamicRenderingHoc = (WrappedComponent) => {
    return props => {
        const testItems = useMemo<ButtonGroupItemProps[]>(() => {
            const items: ButtonGroupItemProps[] = [
                { id: 'r1', name: 'btn1', label: 'report item 1', itemType: 'item', itemSubType: 'button', sortOrder: 0 },
                { id: 'r2', name: 'btn2', label: 'report item 2', itemType: 'item', itemSubType: 'button', sortOrder: 1 },
                { id: 'r3', name: 'btn3', label: 'report item 3', itemType: 'item', itemSubType: 'button', sortOrder: 2 },
            ];;
            return items;
        }, []);
    
        return (<WrappedComponent {...props} items={testItems} hocType={'report'}/>);
    };
};