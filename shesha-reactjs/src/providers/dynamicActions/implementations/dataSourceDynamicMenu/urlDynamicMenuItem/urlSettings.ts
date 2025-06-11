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
                        parentId: 'rqEyWa_qG99Qo53kIjCKb',
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