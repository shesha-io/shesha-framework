import { nanoid } from '@/utils/uuid';
import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { EXPOSED_VARIABLES } from './utils';

export const entityPickerSettings = new DesignerToolbarSettings()
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
      id: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
      components: [...new DesignerToolbarSettings()
        .addContextPropertyAutocomplete({
          id: '5c813b1a-04c5-4658-ac0f-cbcbae6b3bd4',
          propertyName: 'propertyName',
          parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          label: 'Property name',
          validate: {
            required: true,
          },
        })
        .addTextField({
          id: '46d07439-4c18-468c-89e1-60c002ce96c5',
          propertyName: 'label',
          parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          label: 'Label',
          version: 0,
          textType: 'text',
        })
        .addDropdown({
          id: '57a40a33-7e08-4ce4-9f08-a34d24a83338',
          propertyName: 'labelAlign',
          parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          label: 'Label align',
          values: [
            {
              label: 'left',
              value: 'left',
              id: 'f01e54aa-a1a4-4bd6-ba73-c395e48af8ce',
            },
            {
              label: 'right',
              value: 'right',
              id: 'b920ef96-ae27-4a01-bfad-b5b7d07218da',
            },
          ],
          dataSourceType: 'values',
        })
        .addTextArea({
          id: '2d32fe70-99a0-4825-ae6c-8b933004e119',
          propertyName: 'description',
          parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          label: 'Description',
        })
        .addTextField({
          id: "fbdb6bb1-5994-4205-86b4-236ca61ae54e",
          propertyName: "placeholder",
          parentId: "pnl54bf6-f76d-4139-a850-c99bf06c8b69",
          label: "Placeholder",
        })
        .addDropdown({
          id: '1692d566-fe48-43bd-84e0-28b7103354c1',
          propertyName: 'mode',
          parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          label: 'Mode',
          hidden: false,
          values: [
            {
              label: 'single',
              value: 'single',
              id: '329a001c-3c42-44b2-8616-a8fde0959323',
            },
            {
              label: 'multiple',
              value: 'multiple',
              id: '722eb4ea-9e00-4f4e-addb-e7300fa0c74c',
            },
          ],
          dataSourceType: 'values',
          defaultValue: ['single'],
        })
        .addAutocomplete({
          id: '6b0bd9c6-6a53-4a05-9de0-ad1b17eb0018',
          propertyName: 'entityType',
          label: 'Entity Type',
          labelAlign: 'right',
          parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          hidden: false,
          dataSourceType: 'url',
          validate: {},
          dataSourceUrl: '/api/services/app/Metadata/EntityTypeAutocomplete',
          settingsValidationErrors: [],
          useRawValues: true,
          queryParams: null,
        })
        .addContainer({
          id: "pn154bf6-f76d-4139-a850-c99bf06c8b69",
          parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          propertyName: 'filters',
          hidden: { _code: 'return !getSettingValue(data?.entityType);', _mode: 'code', _value: false } as any,
          components: new DesignerToolbarSettings()
            .addPropertyAutocomplete({
              id: 'hpm6rN_aj-L_KaG5MLIZt',
              propertyName: 'displayEntityKey',
              label: 'Display Property',
              labelAlign: 'right',
              parentId: 'pn154bf6-f76d-4139-a850-c99bf06c8b69',
              hidden: false,
              isDynamic: false,
              description:
                'Name of the property that should be displayed in the field. Live empty to use default display property defined on the back-end.',
              validate: {},
              modelType: '{{data.entityType}}',
              autoFillProps: false,
              settingsValidationErrors: [],
            })
            .addSectionSeparator({
              id: '14413162-429e-451c-b3e6-b3f0ab6d7b09',
              propertyName: 'sectionFilters',
              parentId: 'pn154bf6-f76d-4139-a850-c99bf06c8b69',
              label: 'Filters',
            })
            .addQueryBuilder({
              id: 'n4enebtmhFgvkP5ukQK1f',
              propertyName: 'filters',
              label: 'Entity Filter',
              labelAlign: 'right',
              parentId: 'pn154bf6-f76d-4139-a850-c99bf06c8b69',
              hidden: false,
              isDynamic: false,
              validate: {},
              settingsValidationErrors: [],
              modelType: '{{data.entityType}}',
              fieldsUnavailableHint: 'Please select `Entity Type` to be able to configure this filter.',
            })
            .addDropdown({
              id: 'acb2d566-fe48-43bd-84e0-28b7103354c1',
              propertyName: 'valueFormat',
              parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
              label: 'Value format',
              hidden: false,
              values: [
                {
                  label: 'Simple Id',
                  value: 'simple',
                  id: '329a001c-3c42-44b2-8616-a8fde0959323',
                },
                {
                  label: 'Entity reference',
                  value: 'entityReference',
                  id: '722eb4ea-9e00-4f4e-addb-e7300fa0c74c',
                },
                {
                  label: 'Custom',
                  value: 'custom',
                  id: 'faaeb4ea-9e00-4f4e-addb-e7300fa0c74c',
                },
              ],
              dataSourceType: 'values',
              defaultValue: ['simple'],
            })
            .addCodeEditor({
              id: '405b0599-914d-4d2d-875c-765a495472f8',
              propertyName: 'incomeCustomJs',
              label: 'Id value',
              parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
              validate: {},
              settingsValidationErrors: [],
              description: "Return string value of Id",
              hidden: { _code: 'return getSettingValue(data?.valueFormat) !== "custom";', _mode: 'code', _value: false } as any,
              exposedVariables: [{ name: 'value', type: 'object', description: 'Field value' }],
            })
            .addCodeEditor({
              id: '81fb0599-914d-4d2d-875c-765a495472f8',
              propertyName: 'outcomeCustomJs',
              label: 'Custom value',
              parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
              validate: {},
              settingsValidationErrors: [],
              description: "Return value that will be stored as field value",
              hidden: { _code: 'return getSettingValue(data?.valueFormat) !== "custom";', _mode: 'code', _value: false } as any,
              exposedVariables: [{ name: 'value', type: 'object', description: 'Selected value' }],
            })
            .addColumnsEditor({
              id: '2a6ee3b0-15f1-4521-cc6e-6a1c9d192ce2',
              propertyName: 'items',
              parentId: 'pn154bf6-f76d-4139-a850-c99bf06c8b69',
              label: 'Columns',
              items: [],
              modelType: '{{data.entityType}}',
            })
            .toJson(),
        })
        .addSectionSeparator({
          id: '253ee0fd-9916-4728-9f93-16ecc1ca3bb9',
          propertyName: 'sectionFilters',
          parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          label: '',
        })
        .addCheckbox({
          id: 'cfd7d45e-c7e3-4a27-987b-dc525c412448',
          propertyName: 'hidden',
          parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          label: 'Hidden',
        })
        .addCheckbox({
          id: 'c6885251-96a6-40ce-99b2-4b5209a9e01c',
          propertyName: 'hideLabel',
          parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          label: 'Hide Label',
        })
        .addEditMode({
          id: '24a8be15-98eb-40f7-99ea-ebb602693e9c',
          propertyName: 'editMode',
          parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          label: "Edit mode",
        })
        .toJson()
      ]
    }
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
                propertyName: 'modalFormId',
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
                id: nanoid(),
                propertyName: 'footerButtons',
                label: 'Buttons type',
                dataSourceType: 'values',
                values: [
                  { id: nanoid(), label: 'Default', value: 'default' },
                  { id: nanoid(), label: 'Custom', value: 'custom' },
                  { id: nanoid(), label: 'None', value: 'none' },
                ],
                defaultValue: 'default',
              })
              .addButtons({
                id: nanoid(),
                propertyName: 'buttons',
                hidden: { _code: 'return !(getSettingValue(data?.footerButtons) === "custom");', _mode: 'code', _value: false },
                label: 'Configure Modal Buttons',
              })
              .addDropdown({
                id: 'ea60aee4-a7aa-4fd6-a641-638a5a609157',
                propertyName: 'submitHttpVerb',
                parentId: '2a5acbcf-cd52-487e-9cd7-09594a04793a',
                label: 'Submit Http Verb',
                values: [
                  {
                    label: 'POST',
                    value: 'POST',
                    id: '8418606a-d85d-4795-a2ee-4a69fcc656f9',
                  },
                  {
                    label: 'PUT',
                    value: 'PUT',
                    id: '64bbca8a-2fb1-4448-ab71-3db077233bd2',
                  },
                ],
                dataSourceType: 'values',
                hidden: { _code: 'return !(getSettingValue(data?.showModalFooter) === true || getSettingValue(data?.footerButtons) === "default");', _mode: 'code', _value: false },
                defaultValue: 'POST',
              })
              .addTextField({
                id: 'e669632e-55e0-46f4-9585-9e81ef0ae174',
                propertyName: 'onSuccessRedirectUrl',
                parentId: '2a5acbcf-cd52-487e-9cd7-09594a04793a',
                label: 'Success Redirect URL',
                hidden: { _code: 'return !getSettingValue(data?.showModalFooter);', _mode: 'code', _value: false } as any,
                version: 0,
                textType: 'text',
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
    id: '2225bfe4-ee69-431e-931b-b0e0b9ceee6f',
    propertyName: 'pnlValidation',
    parentId: 'root',
    label: 'Validation',
    labelAlign: "left",
    expandIconPosition: "start",
    ghost: true,
    collapsible: 'header',
    content: {
      id: 'pnl34bf6-f76d-4139-a850-c99bf06c8b69',
      components: [...new DesignerToolbarSettings()
        .addCheckbox({
          id: '3be9da3f-f47e-48ae-b4c3-f5cc36e534d9',
          propertyName: 'validate.required',
          parentId: 'pnl34bf6-f76d-4139-a850-c99bf06c8b69',
          label: 'Required',
        }).toJson()
      ]
    }
  })
  .addCollapsiblePanel({
    id: '3335bfe4-ee69-431e-931b-b0e0b9ceee6f',
    propertyName: 'pnlStyle',
    parentId: 'root',
    label: 'Style',
    labelAlign: "left",
    expandIconPosition: "start",
    ghost: true,
    collapsible: 'header',
    content: {
      id: 'pnl44bf6-f76d-4139-a850-c99bf06c8b69',
      components: [...new DesignerToolbarSettings()
        .addCodeEditor({
          id: '06ab0599-914d-4d2d-875c-765a495472f8',
          propertyName: 'style',
          label: 'Style',
          parentId: 'pnl44bf6-f76d-4139-a850-c99bf06c8b69',
          validate: {},
          settingsValidationErrors: [],
          description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
          exposedVariables: [
            {
              id: nanoid(),
              name: 'data',
              description: 'Form values',
              type: 'object',
            },
          ],
        })
        .addDropdown({
          id: '8615d12f-6ea0-4b11-a1a1-6088c7160fd9',
          propertyName: 'size',
          parentId: 'pnl44bf6-f76d-4139-a850-c99bf06c8b69',
          label: 'Size',
          allowClear: true,
          values: [
            {
              label: 'Small',
              value: 'small',
              id: '4f11403c-95fd-4e49-bb60-cb8c25f0f3c3',
            },
            {
              label: 'Middle',
              value: 'middle',
              id: '8f85c476-e632-4fa7-89ad-2be6cfb7f1f1',
            },
            {
              label: 'Large',
              value: 'large',
              id: 'f01e54aa-a1a4-4bd6-ba73-c395e48af8ce',
            },
          ],
          dataSourceType: 'values',
        }).toJson()
      ]
    }
  })
  .addCollapsiblePanel({
    id: '3335bfe4-ee69-431e-931b-b0e0b9cexe6f',
    propertyName: 'pnlEvents',
    parentId: 'root',
    label: 'Events',
    labelAlign: "left",
    expandIconPosition: "start",
    ghost: true,
    version: 4,
    collapsible: 'header',
    content: {
      id: '44bf6-f76d-4139-a853-c99bf06c8b69',
      components: [...new DesignerToolbarSettings()
        .addCodeEditor(
          {
            id: "3cef348b-6bba-4176-93f6-f3a8b21e33c9",
            propertyName: "onChangeCustom",
            label: "On Change",
            labelAlign: "right",
            parentId: "44bf6-f76d-4139-a853-c99bf06c8b69",
            hidden: false,
            description: "Enter custom eventhandler on changing of event. (data, form, event) are exposed",
            validate: {},
            settingsValidationErrors: [],
            exposedVariables: EXPOSED_VARIABLES,
            version: 3,
            language: "typescript",
            wrapInTemplate: true,
            templateSettings: {
              functionName: "onChange"
            },
            availableConstantsExpression: async ({ metadataBuilder }) => {
              return metadataBuilder.object('constants')
                .addAllStandard(["shesha:selectedRow"])
                .addString("value", "Component current value")
                .addObject("event", "Event callback when user input", undefined)
                .build();
            },
          }
        )
        .toJson()
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
      id: 'pnl24bf6-f76d-4139-a850-c99bf06c8b71',
      components: [...new DesignerToolbarSettings()
        .addPermissionAutocomplete({
          id: '4d81ae9d-d222-4fc1-85b2-4dc3ee6a3721',
          propertyName: 'permissions',
          label: 'Permissions',
          labelAlign: 'right',
          parentId: 'root',
          hidden: false,
          validate: {},
        }).toJson()
      ]
    }
  })
  .toJson();
