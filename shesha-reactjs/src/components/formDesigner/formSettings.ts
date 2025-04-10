import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { nanoid } from '@/utils/uuid';
import { FormLayout } from 'antd/lib/form/Form';

export const getSettings = () => {
    const searchableTabsId = nanoid();
    const dataTabId = nanoid();
    const appearanceTabId = nanoid();
    const securityTabId = nanoid();

    return {
        components: new DesignerToolbarSettings()
            .addSearchableTabs({
                id: searchableTabsId,
                propertyName: 'settingsTabs',
                parentId: 'root',
                label: 'Settings',
                hideLabel: true,
                labelAlign: 'right',
                size: 'small',
                tabs: [
                    {
                        key: 'data',
                        title: 'Data',
                        id: dataTabId,
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                                id: nanoid(),
                                inputType: 'autocomplete',
                                propertyName: 'modelType',
                                label: 'Model Type',
                                parentId: dataTabId,
                                dataSourceType: 'url',
                                dataSourceUrl: '/api/services/app/Metadata/TypeAutocomplete',
                                useRawValues: true,
                                mode: ['single'],
                            })
                            .addCollapsiblePanel({
                                id: nanoid(),
                                propertyName: 'pnlDataLoad',
                                label: 'Data Load',
                                labelAlign: 'right',
                                parentId: dataTabId,
                                ghost: true,
                                expandIconPosition: 'end',
                                collapsible: 'header',
                                content: {
                                    id: nanoid(),
                                    components: [...new DesignerToolbarSettings()
                                        .addSettingsInput({
                                            id: nanoid(),
                                            inputType: 'radio',
                                            propertyName: 'dataLoaderType',
                                            label: 'Loader Type',
                                            parentId: 'root',
                                            defaultValue: 'gql',
                                            buttonGroupOptions: {
                                                _mode: 'value',
                                                _code: `    const result = [];
                                                            const isEntity = Boolean(data?.modelType);
                                                            if (isEntity)
                                                                result.push({ title: 'Default', value: 'gql' });
                                                            
                                                            result.push({ title: 'Custom', value: 'custom' });
                                                            result.push({ title: 'None', value: 'none' });
                                                            return result;`,
                                                _value: [
                                                    { title: 'Default', value: 'gql' },
                                                    { title: 'Custom', value: 'custom' },
                                                    { title: 'None', value: 'none' }
                                                ]
                                            } as any
                                        })
                                        .addContainer({
                                            id: "R-QJrw5yvKwqKFR6wKMrOcMYfVN8AX",
                                            propertyName: "container1",
                                            componentName: "cntGQLLoader",
                                            label: "Container1",
                                            labelAlign: "right",
                                            parentId: "qzAhO4Zbgao4mbi7CPJsAbJ5Hw7brZ",
                                            hidden: {
                                                _mode: "code",
                                                _code: "    return data?.dataLoaderType !== 'gql';",
                                                _value: false
                                            },
                                            isDynamic: false,
                                            version: 4,
                                            direction: "vertical",
                                            justifyContent: "left",
                                            flexWrap: "wrap",
                                            components: [...new DesignerToolbarSettings()
                                                .addSettingsInput({
                                                    id: nanoid(),
                                                    parentId: 'root',
                                                    inputType: 'radio',
                                                    propertyName: 'dataLoadersSettings.gql.endpointType',
                                                    label: 'API Endpoint Type',
                                                    labelAlign: 'right',
                                                    buttonGroupOptions: [
                                                        { title: 'Default', value: 'default' },
                                                        { title: 'Custom: static', value: 'static' },
                                                        { title: 'Custom: dynamic', value: 'dynamic' }
                                                    ]
                                                })
                                                .addSettingsInputRow({
                                                    id: 'endpint-additional-fields-to-fetch',
                                                    inputs: [
                                                        {
                                                            id: "oamRBlEs6O2Jlc2FGL_gY",
                                                            type: "endpointsAutocomplete",
                                                            propertyName: "dataLoadersSettings.gql.staticEndpoint.url",
                                                            label: "Endpoint",
                                                            labelAlign: "right",
                                                            parentId: "R-QJrw5yvKwqKFR6wKMrOcMYfVN8AX",
                                                            hidden: {
                                                                _mode: "code",
                                                                _code: "    return data?.dataLoadersSettings?.gql?.endpointType !== 'static';",
                                                                _value: false
                                                            } as any,
                                                            isDynamic: false,
                                                            prefix: "GET",
                                                            mode: "url",
                                                            httpVerb: "get"
                                                        },
                                                        {
                                                            id: "_9lX9iOOPifIBM_dfaIQxsNjK9ZQs7",
                                                            type: "codeEditor",
                                                            propertyName: "dataLoadersSettings.gql.dynamicEndpoint",
                                                            componentName: "dataLoadersSettings.gql.dynamicEndpoint",
                                                            label: "Endpoint",
                                                            labelAlign: "right",
                                                            parentId: "R-QJrw5yvKwqKFR6wKMrOcMYfVN8AX",
                                                            hidden: {
                                                                _mode: "code",
                                                                _code: "    return data?.dataLoadersSettings?.gql?.endpointType !== 'dynamic';",
                                                                _value: false
                                                            } as any,
                                                            isDynamic: false,
                                                            mode: "dialog",
                                                            version: 3,
                                                            language: "typescript",
                                                            wrapInTemplate: true,
                                                            validate: {},
                                                            templateSettings: {
                                                                useAsyncDeclaration: true,
                                                                functionName: "getLoaderEndpoint"
                                                            },
                                                            resultTypeExpression: "    return metadataBuilder\n        .object(\"IApiEndpoint\")\n        .addString(\"url\", \"Endpoint Url\")\n        .addString(\"httpVerb\", \"HTTP verb (GET/POST/PUT etc.)\")\n        .build();"
                                                        },
                                                        {
                                                            id: "63f3360d-1e54-4a79-a888-8cd23b0bedd5",
                                                            type: "propertyAutocomplete",
                                                            propertyName: "dataLoadersSettings.gql.fieldsToFetch",
                                                            label: "Additional fields for fetch",
                                                            mode: "multiple",
                                                            labelAlign: "right",
                                                            hidden: false,
                                                            validate: {},
                                                            settingsValidationErrors: [],
                                                            description: "A list of fields you want to fetch",
                                                            parentId: "R-QJrw5yvKwqKFR6wKMrOcMYfVN8AX",
                                                            version: 2
                                                        }
                                                    ]
                                                })
                                                .toJson()
                                            ]
                                        })
                                        .addSettingsInputRow({
                                            id: nanoid(),
                                            parentId: 'root',
                                            hidden: {
                                                _mode: "code",
                                                _code: "    return data?.dataLoaderType !== 'custom';",
                                                _value: false
                                            },
                                            inputs: [
                                                {
                                                    type: 'codeEditor',
                                                    id: nanoid(),
                                                    propertyName: 'dataLoadersSettings.custom.onDataLoad',
                                                    label: 'On Load',
                                                    mode: 'dialog',
                                                    wrapInTemplate: true,
                                                    templateSettings: {
                                                        useAsyncDeclaration: true,
                                                        functionName: 'onLoad'
                                                    },
                                                    language: 'typescript'
                                                }
                                            ]
                                        })
                                        .addSettingsInputRow({
                                            id: 'on-beforeload-data-on-after-load-data',
                                            inputs: [
                                                {
                                                    id: nanoid(),
                                                    type: 'codeEditor',
                                                    propertyName: 'onBeforeDataLoad',
                                                    label: 'On Before Data Load',
                                                    parentId: 'root',
                                                    mode: 'dialog',
                                                    wrapInTemplate: true,
                                                    templateSettings: {
                                                        useAsyncDeclaration: true,
                                                        functionName: 'onBeforeDataLoad'
                                                    },
                                                    language: 'typescript'
                                                },
                                                {
                                                    id: nanoid(),
                                                    type: 'codeEditor',
                                                    propertyName: 'onAfterDataLoad',
                                                    label: 'On After Data Load',
                                                    parentId: 'root',
                                                    mode: 'dialog',
                                                    wrapInTemplate: true,
                                                    templateSettings: {
                                                        useAsyncDeclaration: true,
                                                        functionName: 'onAfterDataLoad'
                                                    },
                                                    language: 'typescript'
                                                }]
                                        })
                                        .toJson()
                                    ]
                                }
                            })
                            .addCollapsiblePanel({
                                id: nanoid(),
                                propertyName: 'pnlDataSave',
                                label: 'Data Save',
                                labelAlign: 'right',
                                parentId: dataTabId,
                                ghost: true,
                                expandIconPosition: 'end',
                                collapsible: 'header',
                                content: {
                                    id: nanoid(),
                                    components: [...new DesignerToolbarSettings()
                                        .addSettingsInput({
                                            id: nanoid(),
                                            inputType: 'radio',
                                            propertyName: 'dataSubmitterType',
                                            label: 'Submit Type',
                                            parentId: 'root',
                                            buttonGroupOptions: {
                                                _mode: 'value',
                                                _code: `    const result = [];
                                                            const isEntity = Boolean(data?.modelType);
                                                            if (isEntity)
                                                                result.push({ title: 'Default', value: 'gql' });
                                                            
                                                            result.push({ title: 'Custom', value: 'custom' });
                                                            result.push({ title: 'None', value: 'none' });
                                                            return result;`,
                                                _value: [
                                                    { title: 'Default', value: 'gql' },
                                                    { title: 'Custom', value: 'custom' },
                                                    { title: 'None', value: 'none' }
                                                ]
                                            } as any
                                        })
                                        .addSettingsInputRow({
                                            id: nanoid(),
                                            parentId: 'root',
                                            hidden: { _code: 'return getSettingValue(data?.dataSubmitterType) !== "gql";', _mode: 'code', _value: false } as any,
                                            inputs: [
                                                {
                                                    type: 'radio',
                                                    id: nanoid(),
                                                    propertyName: 'dataSubmittersSettings.gql.endpointType',
                                                    label: 'API Endpoint Type',
                                                    labelAlign: 'right',
                                                    buttonGroupOptions: [
                                                        { title: 'Default', value: 'default' },
                                                        { title: 'Custom: static', value: 'static' },
                                                        { title: 'Custom: dynamic', value: 'dynamic' }
                                                    ]
                                                }
                                            ]
                                        })
                                        .addSettingsInputRow({
                                            id: nanoid(),
                                            parentId: 'root',
                                            inputs: [
                                                {
                                                    type: 'endpointsAutocomplete',
                                                    id: nanoid(),
                                                    propertyName: 'dataSubmittersSettings.gql.staticEndpoint',
                                                    label: 'Endpoint',
                                                    mode: 'endpoint',
                                                    availableHttpVerbs: [
                                                        { label: 'POST', value: 'post', id: nanoid() },
                                                        { label: 'PUT', value: 'put', id: nanoid() },
                                                        { label: 'PATCH', value: 'patch', id: nanoid() },
                                                        { label: 'DELETE', value: 'delete', id: nanoid() }
                                                    ],
                                                    hidden: { _code: 'return getSettingValue(data?.dataSubmittersSettings?.gql?.endpointType) !== "static" || getSettingValue(data?.dataSubmitterType) !== "gql";', _mode: 'code', _value: false } as any,
                                                },
                                                {
                                                    type: 'codeEditor',
                                                    id: nanoid(),
                                                    propertyName: 'dataSubmittersSettings.gql.dynamicEndpoint',
                                                    label: 'Endpoint',
                                                    mode: 'dialog',
                                                    language: 'typescript',
                                                    wrapInTemplate: true,
                                                    templateSettings: {
                                                        useAsyncDeclaration: true,
                                                        functionName: 'getSubmitterEndpoint'
                                                    },
                                                    resultTypeExpression: `    return metadataBuilder
                                                    .object("IApiEndpoint")
                                                    .addString("url", "Endpoint Url")
                                                    .addString("httpVerb", "HTTP verb (GET/POST/PUT etc.)")
                                                    .build();`,
                                                    hidden: { _code: 'return getSettingValue(data?.dataSubmittersSettings?.gql?.endpointType) !== "dynamic" || getSettingValue(data?.dataSubmitterType) !== "gql";', _mode: 'code', _value: false } as any,
                                                }
                                            ]
                                        })
                                        .addSettingsInputRow({
                                            id: nanoid(),
                                            parentId: 'root',
                                            hidden: { _code: 'return getSettingValue(data?.dataSubmitterType) !== "gql";', _mode: 'code', _value: false } as any,
                                            inputs: [
                                                {
                                                    type: 'switch',
                                                    id: nanoid(),
                                                    propertyName: 'dataSubmittersSettings.gql.excludeFormFields',
                                                    label: 'Exclude \'_formFields\' in the payload?',
                                                    description: 'Whether or not _formFields should be included in the payload. By default it is included.'
                                                }
                                            ]
                                        })
                                        .addSettingsInputRow({
                                            id: 'on-prepare-submit-data-on-before-sumbit',
                                            inputs: [
                                                {
                                                    id: nanoid(),
                                                    type: 'codeEditor',
                                                    propertyName: 'onPrepareSubmitData',
                                                    label: 'Prepare Submit Data',
                                                    parentId: 'root',
                                                    description: 'Here you can modify data before the form submission',
                                                    mode: 'dialog',
                                                    wrapInTemplate: true,
                                                    templateSettings: {
                                                        useAsyncDeclaration: true,
                                                        functionName: 'onPrepareSubmitData'
                                                    },
                                                    language: 'typescript',
                                                    resultTypeExpression: `    const { modelType } = data ?? {};
                                                const isEntity = modelType ? await metadataBuilder.isEntityAsync(modelType) : false;
                                                return isEntity
                                                    ? metadataBuilder.entity(modelType)
                                                    : metadataBuilder.anyObject();`
                                                },
                                                {
                                                    id: nanoid(),
                                                    type: 'codeEditor',
                                                    propertyName: 'onBeforeSubmit',
                                                    label: 'On Before Submit',
                                                    parentId: 'root',
                                                    description: 'This event is called before the form submission. Here you can specify custom page level validation or modify the data before submission',
                                                    mode: 'dialog',
                                                    wrapInTemplate: true,
                                                    templateSettings: {
                                                        useAsyncDeclaration: true,
                                                        functionName: 'onBeforeSubmit'
                                                    },
                                                    language: 'typescript'
                                                }
                                            ]
                                        })
                                        .addSettingsInputRow({
                                            id: 'on-submit-success-submit-fail',
                                            inputs: [
                                                {
                                                    id: nanoid(),
                                                    type: 'codeEditor',
                                                    propertyName: 'onSubmitSuccess',
                                                    label: 'On Submit Success',
                                                    parentId: 'root',
                                                    mode: 'dialog',
                                                    wrapInTemplate: true,
                                                    templateSettings: {
                                                        useAsyncDeclaration: true,
                                                        functionName: 'onSubmitSuccess'
                                                    },
                                                    language: 'typescript'
                                                },
                                                {
                                                    id: nanoid(),
                                                    type: 'codeEditor',
                                                    propertyName: 'onSubmitFailed',
                                                    label: 'On Submit Failed',
                                                    parentId: 'root',
                                                    mode: 'dialog',
                                                    wrapInTemplate: true,
                                                    templateSettings: {
                                                        useAsyncDeclaration: true,
                                                        functionName: 'onSubmitFailed'
                                                    },
                                                    language: 'typescript'
                                                }
                                            ]
                                        })
                                        .toJson()
                                    ]
                                }
                            })
                            .addCollapsiblePanel({
                                id: nanoid(),
                                propertyName: 'pnlEvents',
                                label: 'Events',
                                labelAlign: 'right',
                                parentId: dataTabId,
                                ghost: true,
                                expandIconPosition: 'end',
                                collapsible: 'header',
                                content: {
                                    id: nanoid(),
                                    components: [...new DesignerToolbarSettings()
                                        .addSettingsInput({
                                            id: nanoid(),
                                            inputType: 'codeEditor',
                                            propertyName: 'onValuesUpdate',
                                            label: 'On Values Update',
                                            parentId: 'root',
                                            description: 'This action will be executed whenever the form updates',
                                            mode: 'dialog',
                                            wrapInTemplate: true,
                                            templateSettings: {
                                                functionName: 'onValuesUpdate'
                                            },
                                            language: 'typescript'
                                        })
                                        .toJson()
                                    ]
                                }
                            })
                            .toJson()
                        ]
                    },
                    {
                        key: 'appearance',
                        title: 'Appearance',
                        id: appearanceTabId,
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                                id: nanoid(),
                                inputType: 'dropdown',
                                propertyName: 'layout',
                                label: 'Layout',
                                parentId: appearanceTabId,
                                validate: {
                                    required: true
                                },
                                dropdownOptions: [
                                    { label: 'horizontal', value: 'horizontal' },
                                    { label: 'vertical', value: 'vertical' }
                                ]
                            })
                            .addSettingsInput({
                                id: nanoid(),
                                inputType: 'dropdown',
                                propertyName: 'size',
                                label: 'Size',
                                parentId: appearanceTabId,
                                allowClear: true,
                                dropdownOptions: [
                                    { label: 'Small', value: 'small' },
                                    { label: 'Middle', value: 'middle' },
                                    { label: 'Large', value: 'large' }
                                ]
                            })
                            .addSettingsInput({
                                id: nanoid(),
                                inputType: 'switch',
                                propertyName: 'colon',
                                label: 'Colon',
                                parentId: appearanceTabId,
                                description: 'Configure the default value of colon for Form.Item. Indicates whether the colon after the label is displayed (only effective when prop layout is horizontal)'
                            })
                            .addSettingsInput({
                                id: nanoid(),
                                inputType: 'numberField',
                                propertyName: 'labelCol.span',
                                label: 'Label span',
                                parentId: appearanceTabId,
                                description: 'Raster number of cells to occupy, 0 corresponds to display: none'
                            })
                            .addSettingsInput({
                                id: nanoid(),
                                inputType: 'numberField',
                                propertyName: 'wrapperCol.span',
                                label: 'Component span',
                                parentId: appearanceTabId,
                                description: 'Raster number of cells to occupy, 0 corresponds to display: none'
                            })
                            .toJson()
                        ]
                    },
                    {
                        key: 'security',
                        title: 'Security',
                        id: securityTabId,
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                                id: nanoid(),
                                inputType: 'dropdown',
                                propertyName: 'access',
                                label: 'Access',
                                parentId: securityTabId,
                                dropdownOptions: [
                                    { label: 'Any authenticated', value: '3' },
                                    { label: 'Requires permissions', value: '4' },
                                    { label: 'Allow anonymous', value: '5' }
                                ]
                            })
                            .addSettingsInput({
                                id: nanoid(),
                                inputType: 'permissions',
                                propertyName: 'permissions',
                                label: 'Permissions',
                                parentId: securityTabId,
                                hidden: { _code: 'return data?.access != 4;', _mode: 'code', _value: false } as any
                            })
                            .toJson()
                        ]
                    }
                ]
            })
            .toJson(),
        formSettings: {
            colon: false,
            layout: 'vertical' as FormLayout,
            labelCol: { span: 24 },
            wrapperCol: { span: 24 }
        }
    };
};