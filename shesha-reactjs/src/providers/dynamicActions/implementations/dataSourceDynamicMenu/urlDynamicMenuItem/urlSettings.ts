import { buttonTypes } from '@/designer-components/button/util';
import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';

export const getSettings = () => {
    return {
        components: new DesignerToolbarSettings()
            .addSettingsInputRow({
                id: 'endpointsAutocomplete-labelValueEditor-row',
                    inputs: [
                    {
                        id: '3B19B03F-8568-4125-9CB0-CDEA52BE207D',
                        type: 'endpointsAutocomplete',
                        propertyName: 'dataSourceUrl',
                        parentId: 'root',
                        label: 'Custom Endpoint',
                        hidden: false,
                        settingsValidationErrors: [],
                    },
                    {
                        id: 'b395c0e9-dbc1-44f1-8fef-c18a49442871',
                        type: 'labelValueEditor',
                        propertyName: 'queryParams',
                        parentId: 'Xp6zDosEy-IrSeDfHHwh-',
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
                id: '3B19B03F-8568-4125-9CB0-CDEA52BE207D-row',
                    hidden: {
                    _code: 'return !getSettingValue(data?.dataSourceUrl);',
                    _mode: 'code',
                    _value: false
                },
                inputs: [
                    {
                        id: '3B19B03F-8568-4125-9CB0-CDEA52BE207D',
                        type: 'textField',
                        propertyName: 'labelProperty',
                        label: 'Label Property',
                        labelAlign: 'right',
                        parentId: 'rqEyWa_qG99Qo53kIjCKb',
                        validate: {
                            required: true
                        }
                    },
                    {
                        id: '3B19B03F-8568-4125-9CB0-CDEA52BE207D',
                        type: 'textField',
                        propertyName: 'tooltipProperty',
                        label: 'Tooltip Property',
                        labelAlign: 'right',
                        parentId: 'rqEyWa_qG99Qo53kIjCKb',
                        validate: {},
                        settingsValidationErrors: []
                    }
                ]
            })
            .addSettingsInputRow({
                id: 'Vl0_92oM-SeCukk5VlgXm-row',
                    inputs: [
                    {
                        id: 'Vl0_92oM-SeCukk5VlgXm',
                        type: 'dropdown',
                        propertyName: 'buttonType',
                        label: 'Button Type',
                        labelAlign: 'right',
                        parentId: '345c2181-fb9f-48ed-9631-864ac357807b',
                        hidden: false,
                        validate: {
                            required: true
                        },
                        dropdownOptions: buttonTypes,
                        jsSetting: false
                    },
                    {
                        id: 'F3B46A95-703F-4465-96CA-A58496A5F78C',
                        type: 'configurableActionConfigurator',
                        propertyName: 'actionConfiguration',
                        label: 'Action Configuration',
                        hidden: false,
                        hideLabel: true,
                        jsSetting: false,
                        parentId: '345c2181-fb9f-48ed-9631-864ac357807b',
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