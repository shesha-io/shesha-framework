import { nanoid } from '@/utils/uuid';
import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';

export const AnnotationSettingsForm = new DesignerToolbarSettings()
    .addCollapsiblePanel({
        id: '11114bf6-f76d-4139-a850-c99bf06c8b69',
        propertyName: 'pnlDisplay',
        parentId: 'root',
        label: 'Display',
        labelAlign: "left",
        expandIconPosition: "start",
        ghost: true,
        collapsible: 'header',
        content: {
          id:'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          components: [...new DesignerToolbarSettings()    
                .addContextPropertyAutocomplete({
                    id: "5c813b1a-04c5-4658-ac0f-cbcbae6b3bd4",
                    propertyName: "propertyName",
                    parentId: "pnl54bf6-f76d-4139-a850-c99bf06c8b69",
                    label: "Property mame",
                    validate: {
                        required: true
                    }
                })
                .addTextField({
                    id: "46d07439-4c18-468c-89e1-60c002ce96c5",
                    propertyName: "label",
                    parentId: "pnl54bf6-f76d-4139-a850-c99bf06c8b69",
                    label: "Label"
                })
                .addDropdown({
                    id: "57a40a33-7e08-4ce4-9f08-a34d24a83338",
                    propertyName: "labelAlign",
                    parentId: "pnl54bf6-f76d-4139-a850-c99bf06c8b69",
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
                    parentId: "pnl54bf6-f76d-4139-a850-c99bf06c8b69",
                    label: "Description"
                })
                .addCheckbox({
                    id: "c6885251-96a6-40ce-99b2-4b5209a9e01c",
                    propertyName: "hideLabel",
                    parentId: "pnl54bf6-f76d-4139-a850-c99bf06c8b69",
                    label: "Hide Label"
                })
                .addEditMode({
                    id: "24a8be15-98eb-40f7-99ea-ebb602693e9c",
                    propertyName: "editMode",
                    parentId: "pnl54bf6-f76d-4139-a850-c99bf06c8b69",
                    label: "Edit mode"
                })
                .addCheckbox({
                    id: "3be9da3f-f47e-48ae-b4c3-f5cc36e534d9",
                    propertyName: "validate.required",
                    parentId: "pnl54bf6-f76d-4139-a850-c99bf06c8b69",
                    label: "Required"
                })
                .addCodeEditor({
                    id: "06ab0599-914d-4d2d-875c-765a495472f8",
                    propertyName: "style",
                    label: "Style",
                    parentId: "pnl54bf6-f76d-4139-a850-c99bf06c8b69",
                    validate: {},
                    settingsValidationErrors: [],
                    description: "A script that returns the style of the element as an object. This should conform to CSSProperties",
                    exposedVariables: [
                        { id: "3tg9da3f-f58e-48ae-b4c3-f5cc36e534d7", name: "data", description: "Form values", type: "object" },
                        { id: nanoid(), name: "globalState", description: "The global state of the application", type: "object" }
                    ]
                }).toJson()
            ]
        }
    })
    .addCollapsiblePanel({
        id: '22224bf6-f76d-4139-a850-c99bf06c8b69',
        propertyName: 'pnlCustomizeAnnotation',
        parentId: 'root',
        label: 'Customize Annotation',
        labelAlign: "left",
        expandIconPosition: "start",
        ghost: true,
        collapsible: 'header',
        content: {
          id:'pnl24bf6-f76d-4139-a850-c99bf06c8b69',
          components: [...new DesignerToolbarSettings()    
                .addCheckbox({
                    id: "3be9da3f-f47e-48ae-b4c3-f5cc36f934d9",
                    propertyName: "isOnImage",
                    parentId: "pnl24bf6-f76d-4139-a850-c99bf06c8b69",
                    description: 'This property allows for annotation decriptions to be either on top of the image or on the side of the image.',
                    label: "Annotation on Image"
                })
                .addCheckbox({
                    id: "3be9da3f-f47k-71ae-b4c3-f5cc36f934d9",
                    propertyName: "allowAddingNotes",
                    parentId: "pnl24bf6-f76d-4139-a850-c99bf06c8b69",
                    description: 'This property allows notes/comments to be added for each annotation or just have number as annotations.',
                    defaultValue: true,
                    label: "Allow adding notes"
                })
                .addNumberField({
                    id: "417ee22e-a49d-44f2-a1c7-fef42ec89603",
                    propertyName: "minPoints",
                    parentId: "pnl24bf6-f76d-4139-a850-c99bf06c8b69",
                    description: "This property denote least number of marks/points an image must have.",
                    label: "Min number of points",
                    min: 0,
                })
                .addNumberField({
                    id: "417ee33e-a49d-44f2-a1c7-fef42ec87503",
                    propertyName: "maxPoints",
                    parentId: "pnl24bf6-f76d-4139-a850-c99bf06c8b69",
                    description: "This property denote at most possible marks/points an image could have.",
                    label: "Max number of points",
                    min: 0,
                }).toJson()
            ]
        }
    })
    .addCollapsiblePanel({
        id: '33334bf6-f76d-4139-a850-c99bf06c8b69',
        propertyName: 'pnlFiles',
        parentId: 'root',
        label: 'File',
        labelAlign: "left",
        expandIconPosition: "start",
        ghost: true,
        collapsible: 'header',
        content: {
          id:'pnl34bf6-f76d-4139-a850-c99bf06c8b69',
          components: [...new DesignerToolbarSettings()    
                .addNumberField({
                    id: "417ee22e-a49d-44f2-a1c7-fef42ec87503",
                    propertyName: "height",
                    parentId: "pnl34bf6-f76d-4139-a850-c99bf06c8b69",
                    description: 'This property determines the height of the image in question.',
                    label: "Height",
                    validate: {
                        required: true
                    }
                })
                .addNumberField({
                    id: "c6ecd70c-7419-4ea7-a715-d42699d26e6e",
                    propertyName: "width",
                    parentId: "pnl34bf6-f76d-4139-a850-c99bf06c8b69",
                    description: 'This property determines the width of the image in question.',
                    label: "Width",
                    validate: {
                        required: true
                    }
                })
                .addCodeEditor({
                    id: "06ab0599-914d-4d2d-875c-765a495482f8",
                    propertyName: "url",
                    label: "Url",
                    parentId: "pnl34bf6-f76d-4139-a850-c99bf06c8b69",
                    validate: {
                        required: true
                    },
                    settingsValidationErrors: [],
                    description: "A script that returns the image url as a string. This should return a string",
                    exposedVariables: [
                        { id: "fb85d916-39f9-4f88-8d87-c1c53558b078", name: "data", description: "Form values", type: "object" },
                        { "name": "globalState", "description": "The global state of the application", "type": "object" }]
                }).toJson()
            ]
        }
    })
    .addCollapsiblePanel({
        id: 'eb91c2f5-592e-4f60-ba1a-f1d2011a5290',
        propertyName: 'pnlSecurity',
        parentId: 'root',
        label: 'Security',
        labelAlign: "left",
        expandIconPosition: "start",
        ghost: true,
        collapsible: 'header',
        content: {
          id:'pnl24bf6-f76d-4139-a850-c99bf06c8b71',
          components: [...new DesignerToolbarSettings() 
            .addPermissionAutocomplete({
              id: '4d81ae9d-d222-4fc1-85b2-4dc3ee6a3721',
              propertyName: 'permissions',
              label: 'Permissions',
              labelAlign: 'right',
              parentId: 'root',
              hidden: false,
              validate: {},
              jsSetting: true,
            }).toJson()
          ]
    }
    })
    .toJson();