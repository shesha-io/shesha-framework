import { nanoid } from 'nanoid';
import { DesignerToolbarSettings } from '../../interfaces/toolbarSettings';

export const RefListStatusSettingsForm = new DesignerToolbarSettings()
    .addCollapsiblePanel({
        id: "b8954bf6-f76d-4139-a850-c99bf06c8b69",
        propertyName: "separator1",
        parentId: "root",
        label: "Display",
        labelAlign: "right",
        expandIconPosition: "left",
        ghost: true,
        hideWhenEmpty: true,
        header: {
            id: '3342DA1C-DA07-46F6-8026-E8B9A93F094A',
            components: []
        },
        content: {
            id: '1BCC52E8-FD3B-4309-AD9B-099CDB729441',
            components: new DesignerToolbarSettings()
                .addContextPropertyAutocomplete({
                    id: "5c813b1a-04c5-4658-ac0f-cbcbae6b3bd4",
                    propertyName: "propertyName",
                    parentId: "1BCC52E8-FD3B-4309-AD9B-099CDB729441",
                    label: "Property name",
                    validate: {
                        required: true
                    }
                })
                .addTextField({
                    id: "46d07439-4c18-468c-89e1-60c002ce96c5",
                    propertyName: "label",
                    parentId: "1BCC52E8-FD3B-4309-AD9B-099CDB729441",
                    label: "Label"
                })
                .addDropdown({
                    id: "57a40a33-7e08-4ce4-9f08-a34d24a83338",
                    propertyName: "labelAlign",
                    parentId: "1BCC52E8-FD3B-4309-AD9B-099CDB729441",
                    label: "Label align",
                    values: [
                        {
                            label: "left",
                            value: "left",
                            id: "f01e54aa-a1a4-4bd6-ba73-c395e48af8ce"
                        },
                        {
                            label: "right",
                            value: "right",
                            id: "b920ef96-ae27-4a01-bfad-b5b7d07218da"
                        }
                    ],
                    dataSourceType: "values"
                })
                .addTextArea({
                    id: "2d32fe70-99a0-4825-ae6c-8b933004e119",
                    propertyName: "description",
                    parentId: "1BCC52E8-FD3B-4309-AD9B-099CDB729441",
                    label: "Description",
                    readOnly: false
                })
                .addCheckbox({
                    id: "cfd7d45e-c7e3-4a27-987b-dc525c412448",
                    propertyName: "hidden",
                    parentId: "1BCC52E8-FD3B-4309-AD9B-099CDB729441",
                    label: "Hidden"
                })
                .addCheckbox({
                    id: "c6885251-96a6-40ce-99b2-4v5209a9e01c",
                    propertyName: "hideLabel",
                    parentId: "1BCC52E8-FD3B-4309-AD9B-099CDB729441",
                    defaultValue: true,
                    label: "Hide Label"
                })
                .toJson()
        }
    })
    .addCollapsiblePanel({
        id: nanoid(),
        propertyName: "pnlCustomizeStatus",
        parentId: "root",
        label: "Customize Status",
        labelAlign: "right",
        expandIconPosition: "left",
        ghost: true,
        hideWhenEmpty: true,
        header: {
            id: nanoid(),
            components: []
        },
        content: {
            id: '5478b8f9-ec00-4d0a-9k2a-44a630cb2dcb',
            components: new DesignerToolbarSettings()
                .addCheckbox({
                    id: "3fg9da3f-f47e-48ae-b4c3-f5cc36f934d9",
                    propertyName: "showReflistName",
                    parentId: "5478b8f9-ec00-4d0a-9k2a-44a630cb2dcb",
                    description: 'When checked the DisplayName/RefList Name will be shown.',
                    defaultValue: true,
                    label: "Show Reflist Item Name"
                })
                .addCheckbox({
                    id: "3be9da3f-f47e-48ae-b4c3-f5cc36f934d9",
                    propertyName: "showIcon",
                    parentId: "5478b8f9-ec00-4d0a-9k2a-44a630cb2dcb",
                    description: 'When checked the icon will display on the left side of the DisplayName',
                    label: "Show Icon"
                })
                .addCheckbox({
                    id: "3be9da3f-f47e-49ae-b8c3-f5cc36f164d9",
                    propertyName: "solidBackground",
                    parentId: "5478b8f9-ec00-4d0a-9k2a-44a630cb2dcb",
                    description: 'When checked the component will show a coloured badge and display within it in white font the icon and/or the selected reference list item label.',
                    defaultValue: true,
                    label: "Show Solid Background"

                })
                .toJson()
        }
    })
    .addCollapsiblePanel({
        id: nanoid(),
        propertyName: "pnlStyle",
        parentId: "root",
        label: "Style",
        labelAlign: "right",
        expandIconPosition: "left",
        ghost: true,
        hideWhenEmpty: true,
        header: {
            id: nanoid(),
            components: []
        },
        content: {
            id: 'D3AA47EB-6047-4009-8AF1-2E36357CAC5D',
            components: new DesignerToolbarSettings()
                .addCodeEditor({
                    id: "06ab0599-914d-4d2d-875c-765a495472f8",
                    propertyName: "style",
                    label: "Style",
                    parentId: "D3AA47EB-6047-4009-8AF1-2E36357CAC5D",
                    validate: {},
                    settingsValidationErrors: [],
                    description: "A script that returns the style of the element as an object. This should conform to CSSProperties",
                    exposedVariables: [
                        { id: "3tg9da3f-f58e-48ae-b4c3-f5cc36e534d7", name: "data", description: "Form values", type: "object" },
                        { id: nanoid(), name: "globalState", description: "The global state of the application", type: "object" }
                    ]
                })
                .toJson()
        }
    })
    .addCollapsiblePanel({
        id: nanoid(),
        propertyName: "pnlRefListSource",
        parentId: "root",
        label: "RefList Source",
        description: 'This section is for binding your status tag to a specific RefList Properties',
        labelAlign: "right",
        expandIconPosition: "left",
        ghost: true,
        hideWhenEmpty: true,
        header: {
            id: nanoid(),
            components: []
        },
        content: {
            id: 'B30AECE7-4EEB-4E35-813B-F5BE13C7B1B1',
            components: new DesignerToolbarSettings()
                .addRefListAutocomplete({
                    id: nanoid(),
                    propertyName: 'referenceListId',
                    label: 'Reference list'
                })
                .toJson()
        }
    })

    .addCollapsiblePanel({
        id: nanoid(),
        propertyName: "pnlVisibility",
        parentId: "root",
        label: "Visibility",
        labelAlign: "right",
        expandIconPosition: "left",
        ghost: true,
        hideWhenEmpty: true,
        header: {
            id: nanoid(),
            components: []
        },
        content: {
            id: 'AC91C296-4BD4-4013-B8F9-BE71C0F37F9B',
            components: new DesignerToolbarSettings()
                .addCodeEditor({
                    id: '03959ffd-cadb-496c-bf6d-b742f7f6edc6',
                    propertyName: 'customVisibility',
                    parentId: 'AC91C296-4BD4-4013-B8F9-BE71C0F37F9B',
                    label: 'Custom Visibility',
                    description:
                        'Enter custom visibility code.  You must return true to show the component. ' +
                        'The global variable data is provided, and allows you to access the data of any form component, by using its API key.',
                    exposedVariables: [
                        { id: nanoid(), name: 'value', description: 'Component current value', type: 'string | any' },
                        { id: nanoid(), name: 'data', description: 'Selected form values', type: 'object' },
                        { id: nanoid(), name: "globalState", description: "The global state of the application", type: "object" }
                    ],
                })

                .toJson()
        }
    })
    .toJson();