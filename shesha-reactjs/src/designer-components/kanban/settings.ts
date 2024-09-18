
import { DesignerToolbarSettings } from '@/index';
import { nanoid } from '@/utils/uuid';

export const getSettings = (_data?: any) =>
  new DesignerToolbarSettings()
  .addAutocomplete({
    id: nanoid(),
    propertyName: 'entityType',
    label: 'Entity type',
    labelAlign: 'right',
    parentId: 'root',
    hidden: false,
    dataSourceType: 'url',
    validate: { required: true},
    dataSourceUrl: '/api/services/app/Metadata/EntityTypeAutocomplete',
    settingsValidationErrors: [],
    useRawValues: true,
    queryParams: null,
  }) 
  .addFormAutocomplete({
    id: nanoid(),
    propertyName: 'modalFormId',
    label: 'Render form',
    labelAlign: 'right',
    parentId: '2a5acbcf-cd52-487e-9cd7-09594a04793a',
    hidden: false,
    validate: {},
    convertToFullId: false,
  })
  .addPropertyAutocomplete({
    id: nanoid(),
    propertyName: 'groupingProperty',
    label: 'Grouping property',
    labelAlign: 'right',
    parentId: 'root',
    hidden: false,
    isDynamic: false,
    description:
        'Name of the property that determines what each item is grouped under',
    validate: {required: true},
    modelType: '{{data.entityType}}',
    autoFillProps: false,
    settingsValidationErrors: [],
    })
    .addCheckbox({
      id:nanoid(),
      propertyName: 'readonly',
      label: 'Readonly',
      parentId: 'root',
    })
    .addCheckbox({
      id:nanoid(),
      propertyName: 'collapsible',
      label: 'Collapsible ?',
      parentId: 'root',
    })
    .addCollapsiblePanel({
      id: '22224bf6-f76d-4139-a850-c99bf06c8b69',
      propertyName: 'pnlData',
      parentId: 'root',
      label: 'Data',
      labelAlign: "left",
      expandIconPosition: "start",
      ghost: true,
      collapsible: 'header',
      content: {
        id: 'pnl24bf6-f76d-4139-a850-c99bf06c8b69',
        components: [...new DesignerToolbarSettings()
          .addCheckbox({
            id: '0cc0b997-f3f7-4a3d-ba36-8590687af9bd',
            propertyName: 'allowNewRecord',
            parentId: 'root',
            label: 'Allow New Record',
          })
          .addCollapsiblePanel({
            id: '1234d45e-c7e3-4a27-987b-dc525c412448',
            propertyName: 'pnlModalSettings',
            label: 'Dialogue settings',
            labelAlign: 'right',
            parentId: 'pnl24bf6-f76d-4139-a850-c99bf06c8b69',
            hidden: { _code: 'return !getSettingValue(data?.allowNewRecord);', _mode: 'code', _value: false } as any,
            validate: {
              required: false,
            },
            content: {
              id: '2a5acbcf-cd52-487e-9cd7-09594a04793a',
              components: new DesignerToolbarSettings()
                .addTextField({
                  id: '4b3b0da0-f126-4e37-b5f5-568367dc008f',
                  propertyName: 'modalTitle',
                  label: 'Title',
                  labelAlign: 'right',
                  parentId: '2a5acbcf-cd52-487e-9cd7-09594a04793a',
                  hidden: false,
                  validate: {
                    required: true,
                  },
                  version: 0,
                  textType: 'text',
                })
                .addFormAutocomplete({
                  id: 'fd3d4ef4-be06-40e9-9815-118754707d0e',
                  propertyName: 'modalFormIdd',
                  label: 'Modal form',
                  labelAlign: 'right',
                  parentId: '2a5acbcf-cd52-487e-9cd7-09594a04793a',
                  hidden: false,
                  validate: {
                    required: true,
                  },
                  convertToFullId: false,
                })
                .addDropdown({
                  id: '264903ff-b525-4a6e-893f-d560b219df9d',
                  propertyName: 'modalWidth',
                  label: 'Dialog Width (%)',
                  allowClear: true,
                  values: [
                    {
                      label: 'Small',
                      value: '40%',
                      id: '2f56ae38-e5f3-40ff-9830-bc048736ddb4',
                    },
                    {
                      label: 'Medium',
                      value: '60%',
                      id: '470d820b-7cd7-439c-8e95-1f5b3134f80c',
                    },
                    {
                      label: 'Large',
                      value: '80%',
                      id: '1f2ac3db-3b3f-486c-991f-ad703088ab2d',
                    },
                    {
                      label: 'Custom',
                      value: 'custom',
                      id: 'fde460b0-1f84-4b64-9a6a-e02ba862937d',
                    },
                  ],
                  dataSourceType: 'values',
                })
                .addDropdown({
                  id: nanoid(),
                  propertyName: 'widthUnits',
                  label: 'Units',
                  allowClear: true,
                  values: [
                    {
                      label: 'Percentage (%)',
                      value: '%',
                      id: '2f56ae38-e5f3-40ff-9830-bc048736ddb4',
                    },
                    {
                      label: 'Pixels (px)',
                      value: 'px',
                      id: '470d820b-7cd7-439c-8e95-1f5b3134f80c',
                    },
                  ],
                  dataSourceType: 'values',
                  hidden: { _code: 'return getSettingValue(data?.modalWidth) !== "custom";', _mode: 'code', _value: false } as any,
                })
                .addNumberField({
                  id: nanoid(),
                  propertyName: 'customWidth',
                  label: 'Enter Custom Width',
                  hidden: { _code: 'return getSettingValue(data?.modalWidth) !== "custom" || !getSettingValue(data?.widthUnits);', _mode: 'code', _value: false } as any,
                  min: 0,
                })
                .toJson()
            }
          })
          .toJson()
        ]
      }
    })

    .addCollapsiblePanel({
      id: nanoid(),
      propertyName: 'pnlStyle',
      parentId: 'root',
      label: 'Column Style',
      labelAlign: 'left',
      expandIconPosition: 'start',
      ghost: true,
      collapsible: 'header',
      content: {
        id: '92ad3873-216c-4465-a21f-489f21e9cca5',
        components: [
          ...new DesignerToolbarSettings()
          .addCodeEditor({
            id: nanoid(),
            propertyName: 'columnStyle',
            parentId: '92ad3873-216c-4465-a21f-489f21e9cca5',
            label: 'Column Style',
            description:
              'A script that returns the style of the element as an object. This should conform to CSSProperties',
            exposedVariables: [
              {
                id: nanoid(),
                name: 'data',
                description: 'Form data',
                type: 'object',
              },
              {
                id: nanoid(),
                name: 'globalState',
                description: 'The global state',
                type: 'object',
              },
            ],
          })
          .addTextField({
            id: nanoid(),
            propertyName: 'height',
            label: 'Height',
            labelAlign: 'right',
            parentId: 'pnld3933cd3-8810-4e29-a434-c84105d46fa2',
            validate: {},
            description:
              'Column Container default height (in px)',
          })
          .addTextField({
            id: nanoid(),
            propertyName: 'minHeight',
            label: 'Min Height',
            labelAlign: 'right',
            parentId: 'pnld3933cd3-8810-4e29-a434-c84105d46fa2',
            validate: {},
            description:
              'Column Container minimum height (in px)',
          })
          .addTextField({
            id: nanoid(),
            propertyName: 'maxHeight',
            label: 'Max Height',
            labelAlign: 'right',
            parentId: 'pnld3933cd3-8810-4e29-a434-c84105d46fa2',
            validate: {},
            description:
              'Column Container maximum height (in px)',
          })
          .addTextField({
            id: nanoid(),
            propertyName: 'gap',
            label: 'Gap',
            labelAlign: 'right',
            parentId: 'pnld3933cd3-8810-4e29-a434-c84105d46fa2',
            validate: {},
            description: 'Examples of a valid gap include: `10` | `10px` | `20px 20px`'
          })
          .toJson(),
        ],
      },
    })
    .addCollapsiblePanel({
      id: nanoid(),
      propertyName: 'pnlStyle',
      parentId: 'root',
      label: 'Header Style',
      labelAlign: 'left',
      expandIconPosition: 'start',
      ghost: true,
      collapsible: 'header',
      content: {
        id: nanoid(),
        components: [
          ...new DesignerToolbarSettings()
          .addCodeEditor({
            id: nanoid(),
            propertyName: 'headerStyle',
            parentId: 'root',
            label: 'Header Style',
            description:
              'A script that returns the style of the element as an object. This should conform to CSSProperties',
            exposedVariables: [
              {
                id: nanoid(),
                name: 'data',
                description: 'Form data',
                type: 'object',
              },
              {
                id: nanoid(),
                name: 'globalState',
                description: 'The global state',
                type: 'object',
              },
            ],
          })
          .addTextField({
            id: nanoid(),
            propertyName: 'fontSize',
            label: 'Font Size',
            labelAlign: 'right',
            parentId: 'root',
            validate: {},
            description:
              'Column Container maximum height (in px)',
          })
          .addColorPicker({
            id: nanoid(),
            propertyName: 'backgroundColor',
            parentId: 'root',
            label: 'Background Color',
            allowClear: true
          })
          .addColorPicker({
            id: nanoid(),
            propertyName: 'color',
            parentId: 'root',
            label: 'Color',
            allowClear: true
          })
          .toJson(),
        ],
      },
    })
  .toJson();


  