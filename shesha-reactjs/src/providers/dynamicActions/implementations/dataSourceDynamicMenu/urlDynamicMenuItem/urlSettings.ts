import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { nanoid } from '@/utils/uuid';

export const getSettings = () => {
    return {
        components: new DesignerToolbarSettings()
            .addSettingsInputRow({
                id: nanoid(),
                inputs: [
                    {
                        id: nanoid(),
                        type: 'endpointsAutocomplete',
                        propertyName: 'dataSourceUrl',
                        parentId: 'root',
                        label: 'Custom Endpoint',
                        hidden: false,
                        settingsValidationErrors: [],
                    },
                    {
                        id: nanoid(),
                        type: 'labelValueEditor',
                        propertyName: 'queryParams',
                        label: 'Query Param',
                        labelTitle: 'Param',
                        labelName: 'param',
                        valueTitle: 'Value',
                        valueName: 'value',
                        ignorePrefixesOnNewItems: true,
                        validate: {},
                        description: '',
                        settingsValidationErrors: [],
                        mode: 'dialog'
                    }
                ]
            })
            .addSettingsInputRow({
                id: nanoid(),
                hidden: {
                    _code: 'return !getSettingValue(data?.dataSourceUrl);',
                    _mode: 'code',
                    _value: false
                },
                inputs: [
                    {
                        id: nanoid(),
                        type: 'textField',
                        propertyName: 'labelProperty',
                        label: 'Label Property',
                        labelAlign: 'right',
                        validate: {
                            required: true
                        }
                    },
                    {
                        id: nanoid(),
                        type: 'textField',
                        propertyName: 'tooltipProperty',
                        label: 'Tooltip Property',
                        labelAlign: 'right',
                        validate: {},
                        settingsValidationErrors: []
                    }
                ]
            })
            .addSettingsInputRow({
                id: nanoid(),
                inputs: [
                    {
                        id: nanoid(),
                        type: 'configurableActionConfigurator',
                        propertyName: 'actionConfiguration',
                        label: 'Action Configuration',
                        hidden: false,
                        hideLabel: true,
                        jsSetting: false,
                    }
                ]
            })
            .toJson(),
        formSettings: {
            layout: 'vertical',
            colon: true,
            labelCol: {
                span: 24
            },
            wrapperCol: {
                span: 24
            },
        }
    };
};