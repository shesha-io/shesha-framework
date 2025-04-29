import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { nanoid } from '@/utils/uuid';
import { FormLayout } from 'antd/lib/form/Form';
import { IAddressCompomentProps } from './models';
import { COUNTRY_CODES } from '@/shesha-constants/country-codes';
import { EXPOSED_VARIABLES } from './utils';

export const getSettings = (data: IAddressCompomentProps) => {
    // Generate unique IDs for tabs structure
    const searchableTabsId = nanoid();
    const commonTabId = nanoid();
    const configTabId = nanoid();
    const validationTabId = nanoid();
    const eventsTabId = nanoid();
    const securityTabId = nanoid();
    const styleRouterId = nanoid();
    const appearanceTabId = nanoid();

    return {
        components: new DesignerToolbarSettings(data)
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
                        key: 'common',
                        title: 'Common',
                        id: commonTabId,
                        components: [...new DesignerToolbarSettings()
                            .addContextPropertyAutocomplete({
                                id: nanoid(),
                                propertyName: "propertyName",
                                parentId: commonTabId,
                                label: "Property Name",
                                size: "small",
                                validate: {
                                    required: true
                                },
                                styledLabel: true,
                                jsSetting: true,
                            })
                            .addLabelConfigurator({
                                id: nanoid(),
                                propertyName: 'hideLabel',
                                label: 'Label',
                                parentId: commonTabId,
                                hideLabel: true,
                            })
                            .addSettingsInputRow({
                                id: nanoid(),
                                parentId: commonTabId,
                                inputs: [
                                    {
                                        id: nanoid(),
                                        type: 'textField',
                                        propertyName: 'placeholder',
                                        label: 'Placeholder',
                                        parentId: commonTabId,
                                        jsSetting: true,
                                    },
                                    {
                                        id: nanoid(),
                                        type: 'textArea',
                                        propertyName: 'description',
                                        label: 'Tooltip',
                                        parentId: commonTabId,
                                        jsSetting: true,
                                    }
                                ],
                            })
                            .addSettingsInputRow({
                                id: nanoid(),
                                parentId: commonTabId,
                                inputs: [
                                    {
                                        type: 'editModeSelector',
                                        id: nanoid(),
                                        propertyName: 'editMode',
                                        defaultValue: 'inherited',
                                        label: 'Edit Mode',
                                        jsSetting: true,
                                    },
                                    {
                                        type: 'switch',
                                        id: nanoid(),
                                        propertyName: 'hidden',
                                        label: 'Hide',
                                        jsSetting: true,
                                    }
                                ],
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
                                inputType: 'permissions',
                                propertyName: 'permissions',
                                label: 'Permissions',
                                tooltip: 'Enter a list of permissions that should be associated with this component',
                                size: 'small',
                                parentId: securityTabId,
                                jsSetting: true,
                            })
                            .toJson()
                        ]
                    },
                    {
                        key: 'mainsettings',
                        title: 'Main Settings',
                        id: configTabId,
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInputRow({
                                id: nanoid(),
                                parentId: configTabId,
                                inputs: [
                                    {
                                        type: 'numberField',
                                        id: nanoid(),
                                        propertyName: 'minCharactersSearch',
                                        label: 'Min Characters Before Search',
                                        tooltip: 'The minimum characters required before an api call can be made.',
                                        jsSetting: true
                                    },
                                    {
                                        type: 'numberField',
                                        id: nanoid(),
                                        propertyName: 'debounce',
                                        label: 'Debounce (MS)',
                                        tooltip: 'Debouncing prevents extra activations/inputs from triggering too often. This is the time in milliseconds the call will be delayed by.',
                                        jsSetting: true
                                    }
                                ]
                            })
                            .addSettingsInput({
                                id: nanoid(),
                                inputType: 'Password',
                                propertyName: 'googleMapsApiKey',
                                label: 'Google Maps Key',
                                parentId: configTabId,
                                jsSetting: true,
                                tooltip: 'API key for authorization. Google Maps key which is required to make successful calls to Google services.',
                            })
                            .addSettingsInput({
                                id: nanoid(),
                                inputType: 'Password',
                                propertyName: 'openCageApiKey',
                                label: 'OpenCage Key',
                                parentId: configTabId,
                                tooltip: 'API key for authorization. Go to (https://opencagedata.com/api) to learn about OpenCage. OpenCage key which is required to make successful calls to OpenCage services.',
                                jsSetting: true,
                            })
                            .addSettingsInputRow({
                                id: nanoid(),
                                parentId: configTabId,
                                inputs: [
                                    {
                                        type: 'dropdown',
                                        id: nanoid(),
                                        propertyName: 'countryRestriction',
                                        label: 'Country Restriction',
                                        tooltip: 'A filter which is based on the country/countries, multiple countries can be selected.',
                                        jsSetting: true,
                                        showSearch: true,
                                        dropdownMode: 'multiple',
                                        allowClear: true,
                                        dropdownOptions: COUNTRY_CODES
                                    },
                                    {
                                        type: 'textField',
                                        id: nanoid(),
                                        propertyName: 'prefix',
                                        label: 'Prefix (Area Restriction)',
                                        tooltip: 'A simple prefix which is appended in the search but not the input search field, often used to create a biased search in address.',
                                        jsSetting: true
                                    }
                                ]
                            })
                            .addSettingsInput({
                                id: nanoid(),
                                inputType: 'switch',
                                propertyName: 'showPriorityBounds',
                                label: 'Priority Bounds (Advanced)',
                                tooltip: 'Advanced search options, not required if a search priority is not needed. Note this will be discarded unless all values are provided.',
                                parentId: configTabId,
                                jsSetting: true,
                            })
                            .addSettingsInputRow({
                                id: nanoid(),
                                parentId: configTabId,
                                hidden: { _code: 'return !getSettingValue(data?.showPriorityBounds);', _mode: 'code', _value: false } as any,
                                inputs: [
                                    {
                                        type: 'numberField',
                                        id: nanoid(),
                                        propertyName: 'latPriority',
                                        label: 'Latitude (Priority Bound)',
                                        tooltip: 'Latitude value which the search will be prioritized from.',
                                        jsSetting: true,
                                        validate: {
                                            required: true,
                                        }
                                    },
                                    {
                                        type: 'numberField',
                                        id: nanoid(),
                                        propertyName: 'lngPriority',
                                        label: 'Longitude (Priority Bound)',
                                        tooltip: 'Longitude value which the search will be prioritized from.',
                                        jsSetting: true,
                                        validate: {
                                            required: true,
                                        }
                                    },
                                ]
                            })
                            .addSettingsInputRow({
                                id: nanoid(),
                                parentId: configTabId,
                                hidden: { _code: 'return !getSettingValue(data?.showPriorityBounds);', _mode: 'code', _value: false } as any,
                                inputs: [
                                    {
                                        type: 'numberField',
                                        id: nanoid(),
                                        propertyName: 'radiusPriority',
                                        label: 'Radius (Priority Bound)',
                                        tooltip: 'The radius in which the latitude and longitude will be priorities from.',
                                        jsSetting: true,
                                        validate: {
                                            required: true,
                                        }
                                    }
                                ]
                            })
                            .toJson()
                        ]
                    },
                    {
                        key: 'appearance',
                        title: 'Appearance',
                        id: appearanceTabId,
                        components: [...new DesignerToolbarSettings()
                            .addPropertyRouter({
                                id: styleRouterId,
                                propertyName: 'propertyRouter1',
                                componentName: 'propertyRouter',
                                label: 'Property router1',
                                labelAlign: 'right',
                                parentId: appearanceTabId,
                                hidden: false,
                                propertyRouteName: {
                                    _mode: "code",
                                    _code: "return contexts.canvasContext?.designerDevice || 'desktop';",
                                    _value: ""
                                },
                                components: [
                                    ...new DesignerToolbarSettings()
                                        .addCollapsiblePanel({
                                            id: nanoid(),
                                            propertyName: 'customStyle',
                                            label: 'Custom Styles',
                                            labelAlign: 'right',
                                            ghost: true,
                                            parentId: styleRouterId,
                                            collapsible: 'header',
                                            content: {
                                                id: nanoid(),
                                                components: [...new DesignerToolbarSettings()
                                                    .addSettingsInput({
                                                        id: nanoid(),
                                                        inputType: 'codeEditor',
                                                        propertyName: 'style',
                                                        hideLabel: false,
                                                        label: 'Style',
                                                        description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                                                        exposedVariables: [
                                                            {
                                                                name: "data",
                                                                description: "Form values",
                                                                type: "object"
                                                            }
                                                        ],
                                                        availableConstantsExpression: "return metadataBuilder.object(\"constants\").addStandard([\"shesha:formData\", \"shesha:globalState\"]).build();"
                                                    })
                                                    .toJson()
                                                ]
                                            }
                                        })
                                        .toJson()
                                ]
                            })
                            .toJson()
                        ]
                    },
                    {
                        key: 'validation',
                        title: 'Validation',
                        id: validationTabId,
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                                id: nanoid(),
                                inputType: 'switch',
                                propertyName: 'validate.required',
                                label: 'Required',
                                parentId: validationTabId,
                                jsSetting: true,
                            })
                            .toJson()
                        ]
                    },
                    {
                        key: 'events',
                        title: 'Events',
                        id: eventsTabId,
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                                id: nanoid(),
                                inputType: 'codeEditor',
                                propertyName: 'onChangeCustom',
                                label: 'On Change',
                                labelAlign: 'right',
                                tooltip: 'Enter custom eventhandler on changing of event.',
                                parentId: eventsTabId,
                                exposedVariables: EXPOSED_VARIABLES,
                            })
                            .addSettingsInput({
                                id: nanoid(),
                                inputType: 'codeEditor',
                                propertyName: 'onSelectCustom',
                                label: 'On Select',
                                labelAlign: 'right',
                                tooltip: 'Enter custom eventhandler on selection of address.',
                                parentId: eventsTabId,
                                exposedVariables: EXPOSED_VARIABLES,
                            })
                            .addSettingsInput({
                                id: nanoid(),
                                inputType: 'codeEditor',
                                propertyName: 'onFocusCustom',
                                label: 'On Focus',
                                labelAlign: 'right',
                                tooltip: 'Enter custom eventhandler on focusing of event.',
                                parentId: eventsTabId,
                                exposedVariables: EXPOSED_VARIABLES,
                            })
                            .toJson()
                        ]
                    },
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