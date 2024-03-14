import { CodeEditor, PropertyAutocomplete } from '@/components';
import { IExpressionExecuterArguments, executeScript } from '@/providers/form/utils';
import { Button, Col, Row, Space } from 'antd';
import React, { FC, useState } from 'react';
import { SettingsApi } from '../../../providers/sheshaApplication/publicApi/settings/api';
import { PropertyCascader } from '@/components/propertyAutocomplete/propertyCascader';
import { DataTypes, IModelMetadata } from '@/interfaces';
import { User } from '@/providers/sheshaApplication/publicApi';

export interface IPlaygroundProps {

}

const userExample = [
    "console.log('Dynamic code started');",
    "",
    "const module = 'shesha';",
    "const permission = 'permission_1';",
    "console.log(`Check permission ${module}.${permission}...`);",
    "const hasPermission = await user.hasPermissionAsync(module, permission);",
    "console.log(`Check permission ${module}.${permission} completed, result: ${hasPermission ? 'granted' : 'NOT granted'}`);",
    "",
    "console.log('Dynamic code finished');",
    "return 'response from dynamic code 🤩';"].join('\n');

const settingsExample = [
    "console.log('try to get isEnabled...');",
    "const isEnabled = await modules.shesha.settings.isEnabled.getValueAsync();",
    "console.log('try to get isEnabled - success', isEnabled);",
    "",
    "return isEnabled ? 'we are good! 😅' : 'setting is disabled 🙄';"].join('\n');

const settingsDeepDeconstructingExample = [
    "console.log('Deep object destructuring test...');",
    "",
    "const { shesha: { settings: { isEnabled } } } = modules;",
    "const isEnabledValue = await isEnabled.getValueAsync();",
    "",
    "console.log('Deep object destructuring test - ✔');",
    "",
    "return isEnabledValue ? 'we are good! 😅' : 'setting is disabled 🙄';"
].join('\n');


/*
const user = { name: "John Doe", email: "john@doe.com", age: 30 };

const userProxy = new Proxy(user, {
  get: (target, prop) => {
    // create default values for non-existent properties
    if (!(prop in target)) {
      return `[${prop} not set]`;
    }
    return target[prop];
  }
});
*/

const metadata: IModelMetadata = {
    name: 'In-memory metadata',
    dataType: DataTypes.object,
    properties: [
        {
            path: 'name',
            label: "Name",
            dataType: 'string'
        },
        {
            path: 'email',
            label: "Email",
            dataType: 'string'
        },
        {
            path: 'age',
            label: "Age",
            dataType: 'number'
        },
        {
            path: 'nested',
            label: "Nested",
            dataType: 'object',
        },
        {
            path: 'address',
            label: "Address",
            dataType: 'object',
            properties: [
                {
                    path: 'street',
                    label: "Street",
                    dataType: 'string'
                },
                {
                    path: 'city',
                    label: "City",
                    dataType: 'string'
                }
            ]
        }
    ]
};

export const Playground: FC<IPlaygroundProps> = () => {
    const [code, setCode] = useState(userExample);
    const [property, setProperty] = useState<string | string[]>();
    const [propertyCascader, setPropertyCascader] = useState<string[]>();
    const [propertyCascaderMultiple, setPropertyCascaderMultiple] = useState<string[][]>();

    const onTestClick = () => {
        console.log('TEST');

        const userInstance = new User("1", "admin", "John", "Doe");
        const modules = new SettingsApi();
        const args: IExpressionExecuterArguments = {
            user: userInstance,
            modules: modules,
        };

        console.log('execute script...');
        executeScript(code, args).then(response => {
            console.log('execute script - finished, response', response);
        });
        // prepare execution context and execute code
    };

    return (
        <div>

            <Space>
                <Button onClick={onTestClick}>
                    Execute
                </Button>
                <Button onClick={() => setCode(userExample)}>
                    Paste User example
                </Button>
                <Button onClick={() => setCode(settingsExample)}>
                    Paste Settings example
                </Button>
                <Button onClick={() => setCode(settingsDeepDeconstructingExample)}>
                    Paste Settings deconstructing example
                </Button>
            </Space>
            <div style={{ padding: "10px 0" }}>
                <CodeEditor
                    value={code}
                    onChange={setCode}
                />
            </div>
            {/* <div style={{ padding: "10px 0" }}>
                <CodeEditor
                    value={code}
                    onChange={setCode}
                />
            </div> */}

            <Row gutter={[16, 16]}>
                <Col span={6}>
                    <label>Cascader: </label>
                </Col>
                <Col span={6}>
                    <PropertyCascader 
                        value={propertyCascader} 
                        onChange={setPropertyCascader} 
                        style={{ width: "100%" }} 
                        meta={metadata}
                    />
                </Col>
                <Col span={6}>
                    {JSON.stringify(propertyCascader)}
                </Col>
            </Row>
            <Row gutter={[16, 16]}>
                <Col span={6}>
                    <label>Cascader multiple: </label>
                </Col>
                <Col span={6}>
                    <PropertyCascader 
                        value={propertyCascaderMultiple} 
                        onChange={setPropertyCascaderMultiple} 
                        style={{ width: "100%" }} 
                        meta={metadata}
                        multiple={true}
                    />
                </Col>
                <Col span={6}>
                    {JSON.stringify(propertyCascaderMultiple)}
                </Col>
            </Row>
            <Row gutter={[16, 16]}>
                <Col span={6}>
                    <label>Property: </label>
                </Col>
                <Col span={6}>
                    <PropertyAutocomplete value={property} onChange={setProperty} style={{ width: "100%" }} />
                </Col>
            </Row>
            <Row>
                <Col span={6}>
                    <label>Property value: </label>
                </Col>
                <Col span={6}>
                    <span>{property}</span>
                </Col>
            </Row>
        </div>
    );
};
