import React, { FC } from 'react';
import { Col, Divider } from 'antd';
import { CollapsiblePanel } from '@/components';
import { useDataContextManager } from '@/providers/dataContextManager';
import { useShaFormInstance, useShaFormUpdateDate } from '@/providers/form/providers/shaFormProvider';

export interface DebugPanelProps {
    formData?: any;
}

export const DebugPanel: FC<DebugPanelProps> = () => {

    useShaFormUpdateDate();
    const formData = useShaFormInstance(false)?.formData;
    const ctxManager = useDataContextManager(false)?.getRoot();
    const contexts = ctxManager.getDataContexts('full');

    return (
        <>
            <Divider />
            <CollapsiblePanel header='Form data' expandIconPosition='start' ghost>
                <Col span={24}>
                    <pre>{JSON.stringify(formData, null, 2)}</pre>
                </Col>
            </CollapsiblePanel>
            {contexts.map((ctx, index) =>
                <CollapsiblePanel header={<>{ctx.name}: {ctx.description} <span style={{ color: 'gray' }}>({ctx.id})</span></>} expandIconPosition='start' ghost key={index}>
                    <Col span={24}>
                        <pre>{JSON.stringify(ctx.getData(), null, 2)}</pre>
                    </Col>
                </CollapsiblePanel>
            )}
        </>
    );
};