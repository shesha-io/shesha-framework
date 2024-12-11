/* eslint-disable no-console */
"use client";

import React, { useMemo, useState } from 'react';
import { PageWithLayout } from '@/interfaces';
import { CodeEditor } from '@/components';
import { useMetadataBuilderFactory } from '@/utils';
import { ConstantsEvaluator } from '@/designer-components/codeEditor/hooks/useConstantsEvaluator';
import { ResultTypeEvaluator } from '@/designer-components/codeEditor/hooks/useResultType';
import { SourceFilesFolderProvider } from '@/providers';
import { Environment } from '@/publicJsApis/metadataBuilder';

const Page: PageWithLayout<{}> = () => {
    const [value, setValue] = useState<string>();
    const metadataBuilderFactory = useMetadataBuilderFactory();
    const instanceClassName = 'boxfusion.enterpriseproject.Domain.CustomWorkflowInstance';

    const availableConstants = useMemo<ConstantsEvaluator>(() => {
        const metadataBuilder = metadataBuilderFactory();

        return async () => {
            console.log('LOG: evaluate availableConstants...');
            const result = metadataBuilder.object("constants");
            const instanceAvailable = instanceClassName && await metadataBuilder.isEntityAsync(instanceClassName);
            if (instanceAvailable) {
                await result.addEntityAsync("workflow", "Current workflow instance", instanceClassName);
            }
            console.log('LOG: evaluate availableConstants - done');
            return result.build();
        };
    }, [instanceClassName]);

    const resultType = useMemo<ResultTypeEvaluator>(() => {
        const metadataBuilder = metadataBuilderFactory();
        return async () => {
            return metadataBuilder.array("items", async (b) => b.anyObject());
        };
    }, []);

    return (
        <div>
            <h3>
                Code editor
            </h3>
            <SourceFilesFolderProvider folder={`test-wf`}>
                <CodeEditor
                    value={value}
                    onChange={setValue}
                    readOnly={false}
                    mode="inline"
                    wrapInTemplate={true}
                    templateSettings={{
                        functionName: 'getInputCollection',
                        useAsyncDeclaration: true,
                    }}
                    availableConstants={availableConstants}
                    resultType={resultType}
                    fileName='inputCollection'
                    environment={Environment.BackEnd}
                />
            </SourceFilesFolderProvider>
        </div>
    );
};

export default Page;