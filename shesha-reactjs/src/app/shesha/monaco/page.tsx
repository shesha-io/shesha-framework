"use client";

import React, { FC, useState } from 'react';
import { MultiFileEditor } from './multiFileEditor';
import { ConstrainedEditor } from './constrainedEditor';
import { Button } from 'antd';
import { CodeEditor } from '@/components/codeEditor/codeEditor';
import { useAvailableConstants } from '@/utils/metadata/useAvailableConstants';

const userExample = [
    "	console.log('Dynamic code started');",
    "	",
    "	const { user } = application;",
    "	",
    "	const module = 'shesha';",
    "	const permission = 'permission_1';",
    "	console.log(`Check permission ${module}.${permission}...`);",
    "	const hasPermission = await user.hasPermissionAsync(module, permission);",
    "	console.log(`Check permission ${module}.${permission} completed, result: ${hasPermission ? 'granted' : 'NOT granted'}`);",
    "	",
    "	console.log('Dynamic code finished');",
    "	return 'response from dynamic code 🤩';"].join('\n');

const Page: FC = () => {
    const [code, setCode] = useState("  // type your code here...");

    const availableConstants = useAvailableConstants({});

    return (
        <>
            <Button onClick={() => setCode(userExample)}>
                Paste User example
            </Button>
            <CodeEditor
                value={code}
                language="typescript"
                onChange={setCode}
                wrapInTemplate={true}
                availableConstants={availableConstants} 
            />
            {false && (
                <div style={{ minHeight: "300px", height: "300px", width: "100%" }}>
                    <CodeEditor
                        value={code}
                        language='typescript'
                        onChange={setCode}
                        wrapInTemplate={true}
                        availableConstants={availableConstants} 
                    />
                </div>
            )}
            {false && <ConstrainedEditor />}
            {false && <MultiFileEditor />}
            <pre>|{code}|</pre>
        </>
    );
};

export default Page;
