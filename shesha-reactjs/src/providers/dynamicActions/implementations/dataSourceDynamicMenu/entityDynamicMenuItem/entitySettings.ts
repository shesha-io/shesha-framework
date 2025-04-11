import { buttonTypes } from '@/designer-components/button/util';
import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';

export const getSettings = () => {
    return {
        components: new DesignerToolbarSettings()
            .addSettingsInputRow({
                id: 'uEFBpy19tApJMiBuFyj9s',
                    inputs: [
                    {
                        id: 'c1ffda30-8eea-4621-aae7-0af583143df6',
                        type: 'autocomplete',
                        propertyName: 'entityTypeShortAlias',
                        label: 'Entity Type',
                        labelAlign: 'right',
                        parentId: 'uEFBpy19tApJMiBuFyj9s',
                        hidden: false,
                        dataSourceType: 'url',
                        validate: {},
                        dataSourceUrl: '/api/services/app/Metadata/EntityTypeAutocomplete',
                        useRawValues: true
                    },
                    {
                        id: 'Oc8E6PaJFth8z9iCGVsty',
                        type: 'numberField',
                        propertyName: 'maxResultCount',
                        label: 'Max Result Count',
                        labelAlign: 'right',
                        parentId: 'rqEyWa_qG99Qo53kIjCKb',
                        hidden: false,
                        validate: {},
                        settingsValidationErrors: []
                    }
                ]
            })
            .addSettingsInput({
                id: 'n4enebtmhFgvkP5ukQK1f',
                inputType: 'queryBuilder',
                propertyName: 'filter',
                label: 'Entity Filter',
                labelAlign: 'right',
                parentId: 'uEFBpy19tApJMiBuFyj9s',
                hidden: false,
                isDynamic: false,
                validate: {},
                settingsValidationErrors: [],
                modelType: '{{data.entityTypeShortAlias}}',
                fieldsUnavailableHint: 'Please select `Entity Type` to be able to configure this filter.',
                version: 2
            })
            .addSettingsInputRow({
                id: 'n4enebtmhFgvkP5ukQK1f-row',
                    hidden: {
                    _code: 'return !getSettingValue(data?.entityTypeShortAlias);',
                    _mode: 'code',
                    _value: false
                },
                inputs: [
                    {
                        id: 'hpm6rN_aj-L_KaG5MLIZt',
                        type: 'propertyAutocomplete',
                        propertyName: 'labelProperty',
                        label: 'Label Property',
                        labelAlign: 'right',
                        parentId: 'n4enebtmhFgvkP5ukQK1f-row',

                        isDynamic: false,
                        placeholder: '',
                        description: 'Name of the property that should be used for the label of the button.',
                        validate: {
                            required: true
                        },
                        modelType: '{{data.entityTypeShortAlias}}',
                        autoFillProps: false,
                    },
                    {
                        id: 'hpm6oN_aj-L_KaG5MLIZt',
                        type: 'propertyAutocomplete',
                        propertyName: 'tooltipProperty',
                        label: 'Tooltip Property',
                        labelAlign: 'right',
                        parentId: 'n4enebtmhFgvkP5ukQK1f-row',
                        isDynamic: false,
                        placeholder: '',
                        description: 'Name of the property that should be used for the tooltip of the button.',
                        validate: {},
                        modelType: '{{data.entityTypeShortAlias}}',
                        autoFillProps: false
                    }]
            })
            .addSettingsInputRow({
                id: 'Vl0092ZM-SeCukk5VlgXm-row',
                    inputs: [
                    {
                        id: 'Vl0092ZM-SeCukk5VlgXm',
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
                        id: 'F3B46A95-703F-4465-96CA-A58490A5F78C',
                        type: 'configurableActionConfigurator',
                        propertyName: 'actionConfiguration',
                        label: 'Action Configuration',
                        hidden: false,
                        hideLabel: true,
                        validate: {},
                        jsSetting: false,
                        settingsValidationErrors: [],
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