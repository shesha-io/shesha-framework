import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { nanoid } from '@/utils/uuid';

export const getSettings = () =>
  new DesignerToolbarSettings()
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
          .addPropertyAutocomplete({
            id: '5c813b1a-04c5-4658-ac0f-cbcbae6b3bd4',
            propertyName: 'componentName',
            parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
            label: 'Component name',
            validate: {
              required: true,
            },
            jsSetting: false
          })
          .addTextField({
            id: '46d07439-4c18-468c-89e1-60c002ce96c5',
            propertyName: 'label',
            parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
            label: 'Label',
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
                id: 'f01e54aa-a1a4-4bd6-ba73-c395e48ap8ce',
              },
              {
                label: 'right',
                value: 'right',
                id: 'b920ef96-ae27-4a01-bfad-b5b7d07218dr',
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
          .addCheckbox({
            id: 'cfd7d45e-c7e3-4a27-987b-dc525c412447',
            propertyName: 'isDragger',
            parentId: 'root',
            label: 'Is Dragger',
            description: 'Where the uploader should show a dragger instead of buttom',
            hidden: { _code: 'return getSettingValue(data?.listType) === "thumbnail";', _mode: 'code', _value: false } ,
          })

          .addDropdown({
            id: 'b920ef96-ae27-4a01-bfad-bob7d07218da',
            propertyName: 'listType',
            parentId: 'abc54bf6-f76d-4139-a850-c99bf06c8b69',
            label: 'List Type',
            hidden: { _code: 'return getSettingValue(data?.isDragger);', _mode: 'code', _value: false } ,
            dataSourceType: 'values',
            values: [
              {
                label: 'File Name',
                value: 'text',
                id: 'f01e54aa-a1a4-4bd6-ba3-c395e48af8ce',
              },
              {
                label: 'Thumbnail',
                value: 'thumbnail',
                id: 'b920ef9w-ae27-4a01-bfad-b5b7d07218da',
              },
            ],
          })
          .addCheckbox({
            id: 'b920ef96-ae27-4a01-bfad-b5b7d0xc18da',
            label: 'Hide File Name',
            propertyName: 'hideFileName',
            parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
            hidden: { _code: 'return getSettingValue(data?.listType) !== "thumbnail";', _mode: 'code', _value: false },
          })
          .addDropdown({
            id: 'f01e54aa-a1a4-4bd6-ba73-c39te48af8ce',
            propertyName: 'layout',
            parentId: 'abc54bf6-f76d-4139-a850-c99bf06c8b69',
            label: 'Layout',
            dataSourceType: 'values',
            hidden: { _code: 'return getSettingValue(data?.listType) !== "thumbnail" || getSettingValue(data?.isDragger);', _mode: 'code', _value: false } ,
            values: [
              {
                label: 'Vertical',
                value: 'vertical',
                id: 'f01e54aa-a1a4-4bd6-ba73-c395e48af8se',
              },
              {
                label: 'Horizontal',
                value: 'horizontal',
                id: 'b920ef96-aeq7-4a01-bfad-b5b7d07218da',
              },
              {
                label: 'Grid',
                value: 'grid',
                id: 'b920ef96-ae27-4a01-bfad-b5b7x07218da',
              }
            ],
          })
          .addNumberField({
            id: 'b920ef96-ae27-4a01-bfad-b5b7d07218da',
            propertyName: 'gap',
            parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
            label: 'Gap',
            description: 'The gap between the thumbnails.',
            hidden: { _code: 'return getSettingValue(data?.listType) !== "thumbnail";', _mode: 'code', _value: false } ,
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
          .addCheckbox({
            id: '40024b1c-edd4-4b5d-9c85-1dda6fb8db6c',
            propertyName: 'allowAdd',
            parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
            label: 'Allow Add',
            validate: {},
            hidden: { _code: 'const r = getSettingValue(data?.readOnly); return r === true || r === "readOnly";', _mode: 'code', _value: false } ,
          })
          .addCheckbox({
            id: '6b3d298a-0e82-4420-ae3c-38bf5a2246d4',
            propertyName: 'allowDelete',
            parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
            label: 'Allow Remove',
            validate: {},
            hidden: { _code: 'const r = getSettingValue(data?.readOnly); return r === true || r === "readOnly";', _mode: 'code', _value: false } ,
          })
          .addCheckbox({
            id: nanoid(),
            propertyName: 'allowReplace',
            parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
            label: 'Allow Replace',
            validate: {},
            hidden: { _code: 'const r = getSettingValue(data?.readOnly); return r === true || r === "readOnly";', _mode: 'code', _value: false } ,
          })
          .addCheckbox({
            id: nanoid(),
            propertyName: 'allowViewHistory',
            parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
            label: 'Allow View History',
            validate: {},
          })
          .addCheckbox({
            id: '332d298a-0e82-4420-ae3c-38bf5a2246d4',
            propertyName: 'downloadZip',
            parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
            label: 'Download Zip',
            validate: {},
          })
          .addCodeEditor({
            id: '48ff91b3-5fb1-4e1b-a17f-ff86bce22e0b',
            propertyName: 'onFileChanged',
            label: 'On File List Changed',
            labelAlign: 'right',
            parentId: 'root',
            hidden: false,
            description: 'Callback that is triggered when the file is changed.',
            validate: {},
            settingsValidationErrors: [],
            wrapInTemplate: true,
            templateSettings: {
              functionName: 'onFileListChanged',
              useAsyncDeclaration: true,
            },
            availableConstantsExpression: "    return metadataBuilder.object(\"constants\")\r\n        .addAllStandard()\r\n        .addString(\"value\", \"Component current value\")\r\n        .addObject(\"event\", \"Event callback when user input\", undefined)\r\n        .build();"

          })
          .addCodeEditor({
            id: '48ff91b3-5fb1-4e1b-a17f-fskj3e2-d32323dxc',
            propertyName: 'onDownload',
            label: 'On Download',
            labelAlign: 'right',
            parentId: 'root',
            hidden: false,
            description: 'Callback that is triggered when a file is downloaded.',
            validate: {},
            settingsValidationErrors: [],
            wrapInTemplate: true,
            templateSettings: {
              functionName: 'onDownload',
              useAsyncDeclaration: true,
            },
            availableConstantsExpression: "    return metadataBuilder.object(\"constants\")\r\n        .addAllStandard()\r\n        .addString(\"value\", \"Component current value\")\r\n        .addObject(\"event\", \"Event callback when user input\", undefined)\r\n        .build();"
          })
          .toJson()
        ]
      }
    })
    .addCollapsiblePanel({
      id: nanoid(),
      propertyName: 'pnlCustom',
      parentId: 'root',
      label: 'Custom',
      labelAlign: "left",
      expandIconPosition: "start",
      ghost: true,
      collapsible: 'header',
      content: {
        id: nanoid(),
        components: [...new DesignerToolbarSettings()
          .addCheckbox({
            id: nanoid(),
            propertyName: 'customContent',
            parentId: 'root',
            label: 'Show Custom Content',
            description: 'Enable to show custom content below each file.',
          })
          .addFormAutocomplete({
            id: nanoid(),
            propertyName: 'extraFormId',
            parentId: 'root',
            label: 'Custom Content Form',
            description: 'Select a form to display custom content under each file.',
            hidden: { _code: 'return !getSettingValue(data?.customContent);', _mode: 'code', _value: false } ,
          })
          .toJson()
        ]
      }
    })
    .addCollapsiblePanel({
      id: '9b302942-a0a6-4805-ac47-8f45486a69d4',
      propertyName: 'pnlFiles',
      parentId: 'root',
      label: 'Files',
      labelAlign: "right",
      expandIconPosition: "start",
      ghost: true,
      collapsible: 'header',
      content: {
        id: 'pnl02942-a0a6-4805-ac47-8f45486a69d4',
        components: [...new DesignerToolbarSettings()
          .addPropertyAutocomplete({
            id: '3fe73b1a-04c5-4658-ac0f-cbcbae6b3bd4',
            autoFillProps: false,
            propertyName: 'ownerName',
            parentId: 'pnl02942-a0a6-4805-ac47-8f45486a69d4',
            label: 'Owner',
          })
          .addTextField({
            id: '1c03863c-880d-4308-8667-c3d996619cb7',
            propertyName: 'ownerId',
            parentId: 'pnl02942-a0a6-4805-ac47-8f45486a69d4',
            label: 'Owner Id',
          })
          .addAutocomplete({
            id: '0009bf13-04a3-49d5-a9d8-1b23df20b97c',
            propertyName: 'ownerType',
            label: 'Owner Type',
            labelAlign: 'right',
            parentId: 'pnl02942-a0a6-4805-ac47-8f45486a69d4',
            hidden: false,
            dataSourceType: 'url',
            validate: {},
            dataSourceUrl: '/api/services/app/Metadata/EntityTypeAutocomplete',
            settingsValidationErrors: [],
            useRawValues: true,
          })
          .addTextField({
            id: 'db913b1b-3b25-46c9-afef-21854d917ba7',
            propertyName: 'filesCategory',
            parentId: 'pnl02942-a0a6-4805-ac47-8f45486a69d4',
            label: 'Files Category',
          })
          .addEditableTagGroupProps({
            id: nanoid(),
            parentId: 'pnl02942-a0a6-4805-ac47-8f45486a69d4',
            propertyName: 'allowedFileTypes',
            label: 'Allowed File Types',
            description: 'File types that can be accepted.',
          }).toJson()
        ]
      }
    })
    .addCollapsiblePanel({
      id: 'd675bfe4-ee69-431e-931b-b0e0b9ceee6f',
      propertyName: 'pnlValidation',
      parentId: 'root',
      label: 'Validation',
      labelAlign: "right",
      expandIconPosition: "start",
      ghost: true,
      collapsible: 'header',
      content: {
        id: 'pnl5bfe4-ee69-431e-931b-b0e0b9ceee6f',
        components: [...new DesignerToolbarSettings()
          .addCheckbox({
            id: '3be9da3f-f47e-48ae-b4c3-f5cc36e534d9',
            propertyName: 'validate.required',
            parentId: 'pnl5bfe4-ee69-431e-931b-b0e0b9ceee6f',
            label: 'Required',
          }).toJson()
        ]
      }
    })
    .addCollapsiblePanel({
      id: 'd675bfe4-ee69-431e-931b-b0e0b9ceee6',
      propertyName: 'styles',
      parentId: 'root',

      label: 'Styles',
      labelAlign: "right",
      expandIconPosition: "start",
      ghost: true,
      collapsible: 'header',
      content: {
        id: 'pnl5bfe4-ee69-431e-931b-b0e0b9ceee6s',
        components: [...new DesignerToolbarSettings()
          .addCollapsiblePanel({
            id: 'item-styles-1c03863c-880d-4308-8667-c3d996619cb',
            propertyName: 'itemStyles',
            parentId: 'pnl5bfe4-ee69-431e-931b-b0e0b9ceee6s',
            label: 'Item Styles',
            hideWhenEmpty: true,
            content: {
              id: 'item-styles-content-880d-4308-c3d996619cb',
              components: [...new DesignerToolbarSettings()
                .addTextField({
                  id: '1c03863c-880d-4308-8667-c3d996619cb3',
                  propertyName: 'fontSize',
                  parentId: 'pnl5bfe4-ee69-431e-931b-b0e0b9ceee6s',
                  label: 'Font Size',
                  hidden: { _code: 'return getSettingValue(data?.hideFileName);', _mode: 'code', _value: false } ,
                })
                .addColorPicker({
                  id: '1c03863c-880d-4308-8667-c3d996619cb0',
                  propertyName: 'fontColor',
                  parentId: 'pnl5bfe4-ee69-431e-931b-b0e0b9ceee6s',
                  label: 'Color',
                  hidden: { _code: 'return getSettingValue(data?.hideFileName);', _mode: 'code', _value: false } ,
                  allowClear: true
                })
                .addTextField({
                  id: '1c03863c-880d-4308-8667-c3d996619cb8',
                  propertyName: 'thumbnailWidth',
                  parentId: 'pnl5bfe4-ee69-431e-931b-b0e0b9ceee6s',
                  label: 'Thumbnail Width',
                  hidden: { _code: 'return getSettingValue(data?.listType) !== "thumbnail";', _mode: 'code', _value: false } ,
                })
                .addTextField({
                  id: '1c03863c-880d-4308-8667-c3d9966197',
                  propertyName: 'thumbnailHeight',
                  parentId: 'pnl5bfe4-ee69-431e-931b-b0e0b9ceee6s',
                  label: 'Thumbnail Height',
                  hidden: { _code: 'return getSettingValue(data?.listType) !== "thumbnail";', _mode: 'code', _value: false } ,
                })
                .addTextField({
                  id: '1c03863c-880d-4308-8667-c3d996619cb5',
                  propertyName: 'borderSize',
                  parentId: 'pnl5bfe4-ee69-431e-931b-b0e0b9ceee6s',
                  label: 'Border Width',
                  hidden: { _code: 'return getSettingValue(data?.listType) !== "thumbnail";', _mode: 'code', _value: false } ,
                })
                .addColorPicker({
                  id: '1c03863c-880d-4308-8667-c3d996619cb6',
                  propertyName: 'borderColor',
                  parentId: 'pnl5bfe4-ee69-431e-931b-b0e0b9ceee6s',
                  label: 'Border Color',
                  allowClear: true,
                  hidden: { _code: 'return getSettingValue(data?.listType) !== "thumbnail";', _mode: 'code', _value: false } ,
                })
                .addDropdown({
                  id: '1c03863c-type-4308-8667-c3d996619cb9',
                  propertyName: 'borderType',
                  parentId: 'pnl5bfe4-ee69-431e-931b-b0e0b9ceee6s',
                  label: 'Border Type',
                  hidden: { _code: 'return getSettingValue(data?.listType) !== "thumbnail";', _mode: 'code', _value: false } ,
                  dataSourceType: 'values',
                  values: [
                    {
                      label: 'dashed',
                      value: 'dashed',
                      id: 'f01e54aa-a1a4-4bd6-ba73-c395e48af8ce',
                    },
                    {
                      label: 'solid',
                      value: 'solid',
                      id: 'b920ef96-ae27-4a01-bfad-b5b7d07218da',
                    },
                  ],
                })
                .addTextField({
                  id: '1c03863c-880d-4308-8667-c3d996619cb',
                  propertyName: 'borderRadius',
                  parentId: 'pnl5bfe4-ee69-431e-931b-b0e0b9ceee6s',
                  label: 'Border Radius',
                  hidden: { _code: 'return getSettingValue(data?.listType) !== "thumbnail";', _mode: 'code', _value: false } ,
                })
                .toJson()]
            }
          })
          .addCollapsiblePanel({
            id: 'container-styles-1c03863c-880d-4308-8667-c3d996619cb',
            propertyName: 'containerStyles',
            parentId: 'pnl5bfe4-ee69-431e-931b-b0e0b9ceee6s',
            label: 'Container Styles',
            content: {
              id: 'container-styles-content-880d-4308-c3d996619cb',
              components: [...new DesignerToolbarSettings()
                .addTextField({
                  id: '1c03863c-880d-4308-8667-c3d996619cb1',
                  propertyName: 'width',
                  parentId: 'container-styles-content-880d-4308-c3d996619cb',
                label: 'Width',
                  hidden: { _code: 'return getSettingValue(data?.layout) === "vertical";', _mode: 'code', _value: false } ,
                })
                .addTextField({
                  id: '1c03863c-880d-4308-8667-c3d996619cb2',
                  propertyName: 'height',
                  parentId: 'container-styles-content-880d-4308-c3d996619cb',
                  label: 'Height',
                  hidden: { _code: 'return getSettingValue(data?.layout) === "horizontal";', _mode: 'code', _value: false } ,
                })
                .addStyleBox({
                  id: '1c03863c-880d-4308-8567-c3d996619cb3',
                  propertyName: 'stylingBox',
                  parentId: 'container-styles-content-880d-4308-c3d996619cb',
                  jsSetting: false,
                })
                .addCodeEditor({
                  id: '1c03863c-880d-4308-8667-c3d996619cb4',
                  propertyName: 'style',
                  label: 'Style',
                })
                .toJson()]
            }
          })
          .addCollapsiblePanel({
            id: 'downloaded-file-style',
            label: 'Downloaded File Style',
            parentId: 'pnl5bfe4-ee69-431e-931b-b0e0b9ceee6s',
            content: {
              id: 'downloaded-file-style-880d-4308-c3d996619cb',
              components: [...new DesignerToolbarSettings()
                .addCheckbox({
                    id: nanoid(),
                    label: 'Style Downloaded File',
                    propertyName: 'styleDownloadedFiles'
                  })
                .addIconPicker({
                    id: nanoid(),
                    label: 'Icon',
                    propertyName: 'downloadedIcon',
                    hidden: { _code: 'return !getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.styleDownloadedFiles);', _mode: 'code', _value: false } ,
                  })
                  .addNumberField({
                      id: nanoid(),
                      label: 'Font Size',
                      propertyName: 'downloadedFileStyles.fontSize',
                      hidden: { _code: 'return !getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.styleDownloadedFiles);', _mode: 'code', _value: false } ,
                    })
                    .addColorPicker({
                      id: nanoid(),
                      label: 'Font Color',
                      propertyName: 'downloadedFileStyles.color',
                      hidden: { _code: 'return !getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.styleDownloadedFiles);', _mode: 'code', _value: false } ,
                    })
                    .addCodeEditor({
                      id: nanoid(),
                      hideLabel: false,
                      label: 'Style',
                      propertyName: 'downloadedFileStyles.style',
                      description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                      parentId: 'pnlDownloadedFileCustomStylePanel',
                      hidden: { _code: 'return !getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.styleDownloadedFiles);', _mode: 'code', _value: false } ,
                    })
                .toJson()]
            },
          })
          .toJson()]
      }
    })
    .addCollapsiblePanel({
      id: 'eb91c2f5-592e-4f60-ba1a-f1d2011a5290',
      propertyName: 'pnlData',
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
