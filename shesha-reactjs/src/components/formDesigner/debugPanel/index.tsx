import React, { FC } from 'react';
import { Col, Divider } from 'antd';
import { CollapsiblePanel } from '@/components';
import { useDataContextManager } from '@/providers/dataContextManager';

export interface DebugPanelProps {
    formData?: any;
}

export const DebugPanel: FC<DebugPanelProps> = (props) => {

    const ctxManager = useDataContextManager(false);

    const contexts = ctxManager.getDataContexts('all');

    return (
        <>
            <Divider />
            <CollapsiblePanel header='Form data' expandIconPosition='start' ghost>
                <Col span={24}>
                    <pre>{JSON.stringify(props.formData, null, 2)}</pre>
                </Col>
            </CollapsiblePanel>
            {contexts.map((ctx) =>
                <CollapsiblePanel header={<>{ctx.name}: {ctx.description} <span style={{ color: 'gray' }}>({ctx.id})</span></>} expandIconPosition='start' ghost>
                    <Col span={24}>
                        <pre>{JSON.stringify(ctx.getData(), null, 2)}</pre>
                    </Col>
                </CollapsiblePanel>
            )}
        </>
    );
};