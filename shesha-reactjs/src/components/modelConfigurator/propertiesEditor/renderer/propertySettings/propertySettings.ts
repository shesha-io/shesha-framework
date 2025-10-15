import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { FormLayout } from 'antd/lib/form/Form';
import { nanoid } from '@/utils/uuid';
import { ModelPropertyDto } from '@/apis/modelConfigurations';
import { SimplePropertySettings } from './simplePropertySettings';
import { DataTypes, FormMarkupWithSettings, IToolboxComponents } from '@/index';

export const getSettings = (data: ModelPropertyDto, components: IToolboxComponents): FormMarkupWithSettings => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const dataTabId = nanoid();
  const cascadeTabId = nanoid();
  const attributesTabId = nanoid();
  const databaseTabId = nanoid();

  const entityFormatId = nanoid();
  const objectRefFormatId = nanoid();
  const listFormatId = nanoid();
  const advancedFormatId = nanoid();
  const listDbFormatId = nanoid();
  const listRelFormatId = nanoid();
  const manyToOneFormatId = nanoid();
  const manyToManyFormatId = nanoid();

  let editorsCode = `\n`;
  editorsCode += `const components = {\n`;
  for (const component in components) {
    if (component.indexOf('.') > -1 || component.indexOf('-') > -1) continue;
    editorsCode += `'${component}': '${components[component]?.name}',\n`;
  }
  editorsCode += '}\n';
  editorsCode += DataTypes.allowedCompoenentsCode;
  editorsCode += '\n';
  editorsCode += 'const editors = allowedComponents(data.dataType, data.dataFormat);\n';
  editorsCode += 'return editors.map((e) => ({ value: e, label: components[e] }));\n';

  let defaultEditorCode = DataTypes.allowedCompoenentsCode;
  defaultEditorCode += '\n';
  defaultEditorCode += 'const editors = allowedComponents(data.dataType, data.dataFormat);\n';
  defaultEditorCode += 'return editors?.[0];\n';

  return {
    components: new DesignerToolbarSettings<ModelPropertyDto>(data)
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
            key: '1',
            title: 'Common',
            id: commonTabId,
            components: [...new DesignerToolbarSettings()
              .addSettingsInput({ parentId: commonTabId, inputType: 'switch', propertyName: 'suppress', label: 'Hidden' })
              .addSettingsInput({ parentId: commonTabId, inputType: 'textField', propertyName: 'name', label: 'Name', validate: { required: true },
                editMode: { _value: 'inherited', _mode: 'code', _code: 'return !data.createdInDb && data.source != 1;' } as any,
              })
              .addSettingsInput({ parentId: commonTabId, inputType: 'textField', propertyName: 'label', label: 'Label', validate: { required: true } })
              .addSettingsInput({ parentId: commonTabId, inputType: 'textArea', propertyName: 'description', label: 'Description' })
              .toJson(),
            ],
          },
          {
            key: '2',
            title: 'Data Type',
            id: dataTabId,
            components: [

              // Main properties and Simple format

              ...SimplePropertySettings(dataTabId, 'full')

              // Entity format

                .addContainer({ id: entityFormatId, parentId: dataTabId, hidden: { _code: 'return data?.dataType !== \'entity\';', _mode: 'code', _value: false },
                  components: [...new DesignerToolbarSettings()
                    .addSettingsInput({ parentId: entityFormatId, inputType: 'autocomplete', propertyName: 'entityType',
                      label: 'Entity Type', dataSourceType: "url", dataSourceUrl: "/api/services/app/Metadata/EntityTypeAutocomplete",
                      queryParams: { _value: '', _mode: 'code', _code: 'return { baseClass:data.baseEntityType};' } as any,
                      editMode: { _value: 'inherited', _mode: 'code', _code: 'return !(data.createdInDb && !data.inheritedFromId) && data.source != 1;' } as any,
                    })
                    .addSettingsInput({ parentId: entityFormatId, inputType: 'queryBuilder', propertyName: 'formatting.filter', label: 'Filter',
                      modelType: { _value: '', _mode: 'code', _code: 'return data.entityType;' } as any,
                    })
                    .toJson(),
                  ],
                })

              // Object and objectreference format

                .addContainer({ id: objectRefFormatId, parentId: dataTabId, hidden: { _code: 'return data?.dataType !== \'object\';', _mode: 'code', _value: false },
                  components: [...new DesignerToolbarSettings()
                    .addSettingsInput({ parentId: objectRefFormatId, inputType: 'dropdown', propertyName: 'dataFormat', label: 'Object Format', mode: 'single',
                      editMode: { _value: 'inherited', _mode: 'code', _code: 'return !data.createdInDb && data.source != 1;' } as any,
                      dropdownOptions: [
                        { label: 'Nested object', value: 'object' },
                        { label: 'Part of entity', value: 'interface' },
                      ],
                    })
                    .addSettingsInputRow({ parentId: objectRefFormatId, inputs: [
                      { type: 'autocomplete', propertyName: 'entityType', label: 'Part Of Entity Type', dataSourceType: "url", dataSourceUrl: "/api/services/app/Metadata/JsonEntityTypeAutocomplete",
                        queryParams: { baseClass: "{{data.baseEntityType}}" },
                      },
                    ],
                    hidden: { _code: 'return data?.dataFormat !== \'interface\';', _mode: 'code', _value: false },
                    editMode: { _value: 'inherited', _mode: 'code', _code: 'return !(data.createdInDb && !data.inheritedFromId) && data.source != 1;' } as any,
                    })
                    .toJson(),
                  ],
                })

              // Advanced format

                .addContainer({ id: advancedFormatId, parentId: dataTabId, hidden: { _code: 'return data?.dataType !== \'advanced\';', _mode: 'code', _value: false },
                  components: [...new DesignerToolbarSettings()
                    .addSettingsInput({ parentId: advancedFormatId, inputType: 'dropdown', propertyName: 'dataFormat', label: 'Advanced format', mode: 'single',
                      dropdownOptions: [
                        { label: 'List of files', value: 'attachmentsEditor' },
                        { label: 'Notes', value: 'notes' },
                      ],
                      onChangeSetting: (_value, _data, setFormData) => {
                        const newData = { formatting: { defaultEditor: null } };
                        setFormData({ values: newData, mergeValues: true });
                      },
                    })
                    .toJson(),
                  ],
                })

              // List format

                .addContainer({ id: listFormatId, parentId: dataTabId, hidden: { _code: 'return data?.dataType !== \'array\';', _mode: 'code', _value: false },
                  components: [...new DesignerToolbarSettings()
                    .addSettingsInput({ parentId: advancedFormatId, inputType: 'dropdown', propertyName: 'dataFormat', label: 'List Format', mode: 'single',
                      editMode: { _value: 'inherited', _mode: 'code', _code: 'return !data.createdInDb && data.source != 1;' } as any,
                      dropdownOptions: [
                        { label: 'Simple Values', value: 'simple' },
                        { label: 'Referencing Entities', value: 'entity' },
                        { label: 'Entities', value: 'many-entity' },
                        { label: 'Child Objects', value: 'object' },
                        { label: 'Child Entities', value: 'child-entity' },
                        { label: 'Multi Value Reference List Item', value: 'multivalue-reference-list' },
                      ],
                    })

                  // Referencing entities and Entities (many-entity )

                    .addSettingsInputRow({ parentId: listFormatId, inputs: [
                      { type: 'autocomplete', propertyName: 'entityType', label: 'Entity Type', dataSourceType: "url", dataSourceUrl: "/api/services/app/Metadata/EntityTypeAutocomplete" },
                    ],
                    hidden: { _code: 'const d = data?.dataFormat; return d !== \'many-entity\' && d !== \'entity\';', _mode: 'code', _value: false },
                    editMode: { _value: 'inherited', _mode: 'code', _code: 'return !data.createdInDb && data.source != 1;' } as any,
                    })
                    .addSettingsInputRow({ parentId: listFormatId, inputs: [
                      { type: 'propertyAutocomplete', propertyName: 'listConfiguration.foreignProperty', label: 'Referencing property',
                        modelType: { _code: 'return data?.entityType;', _mode: 'code', _value: false } as any },
                    ],
                    hidden: { _code: 'return data?.dataFormat !== \'entity\';', _mode: 'code', _value: false },
                    })

                  // Child objects

                    .addSettingsInputRow({ parentId: listFormatId, inputs: [
                      { type: 'dropdown', propertyName: 'itemsType.dataFormat', label: 'Object Format', mode: 'single',
                        editMode: { _value: 'inherited', _mode: 'code', _code: 'return !data.createdInDb && data.source != 1;' } as any,
                        dropdownOptions: [
                          { label: 'Nested object', value: 'object' },
                          { label: 'Part of entity', value: 'interface' },
                        ],
                      }],
                    hidden: { _code: 'return data?.dataFormat !== \'object\';', _mode: 'code', _value: false },
                    })
                    .addSettingsInputRow({ parentId: listFormatId, inputs: [
                      { type: 'autocomplete', propertyName: 'entityType', label: 'Part Of Entity Type', dataSourceType: "url", dataSourceUrl: "/api/services/app/Metadata/JsonEntityTypeAutocomplete" },
                    ],
                    hidden: { _code: 'return data?.dataFormat !== \'object\' || data?.itemsType?.dataFormat !== \'interface\';', _mode: 'code', _value: false },
                    editMode: { _value: 'inherited', _mode: 'code', _code: 'return !data.createdInDb && data.source != 1;' } as any,
                    })

                  // Reference list format

                    .addSettingsInputRow({ parentId: listFormatId, inputs: [
                      { type: 'referenceListAutocomplete', propertyName: `itemsType.referenceListId`, label: 'Reference List' },
                    ],
                    hidden: { _code: 'return data?.dataFormat !== \'multivalue-reference-list\';', _mode: 'code', _value: false },
                    })

                  // simple

                    .addContainer({ id: listFormatId, parentId: dataTabId, hidden: { _code: 'return data?.dataFormat !== \'simple\';', _mode: 'code', _value: false },
                      components: [...SimplePropertySettings(listFormatId, 'array', 'itemsType.').toJson()],
                    })

                    .toJson(),
                  ],
                })

              // Default editor

                .addSettingsInput({ parentId: objectRefFormatId, inputType: 'dropdown', propertyName: 'formatting.defaultEditor', label: 'Default Editor', mode: 'single',
                  defaultValue: { _value: '', _mode: 'code', _code: defaultEditorCode } as any,
                  dropdownOptions: { _value: '', _mode: 'code', _code: editorsCode } as any,
                })

              // Validation message

                .addSettingsInput({ parentId: dataTabId, inputType: 'textField', propertyName: 'validationMessage', label: 'Validation Message' })

                .toJson(),
            ],
          },
          {
            key: '3',
            title: 'Attributes',
            id: attributesTabId,
            components: [...new DesignerToolbarSettings()
              .addSettingsInput({ parentId: attributesTabId, inputType: 'switch', propertyName: 'audited', label: 'Audited' /* tooltip: 'Allows to create child/nested entity'*/ })
              .addSettingsInput({ parentId: attributesTabId, inputType: 'switch', propertyName: 'required', label: 'Required' /* tooltip: 'Allows to create child/nested entity'*/ })
              .addSettingsInput({ parentId: attributesTabId, inputType: 'switch', propertyName: 'readOnly', label: 'ReadOnly' /* tooltip: 'Allows to create child/nested entity'*/ })
              .toJson(),
            ],
            hidden: { _code: 'return data?.isChildProperty;', _mode: 'code', _value: false },
          },
          {
            key: '4',
            title: 'Cascade rules',
            id: cascadeTabId,
            hidden: { _code: 'return data?.isChildProperty || data?.dataType !== \'entity\';', _mode: 'code', _value: false },
            components: [...new DesignerToolbarSettings()
              .addSettingsInput({ parentId: cascadeTabId, inputType: 'switch', propertyName: 'cascadeCreate', label: 'Create', tooltip: 'On creation of this entity, will cascade creation to the referenced entity' })
              .addSettingsInput({ parentId: cascadeTabId, inputType: 'switch', propertyName: 'cascadeUpdate', label: 'Update ', tooltip: 'On update of this entity, will cascade the update action to the referenced entity' })
              .addSettingsInput({ parentId: cascadeTabId, inputType: 'switch', propertyName: 'cascadeDeleteUnreferenced', label: 'Delete',
                tooltip: 'On deletion of this entity, will cascade the delete action to the referenced entity if not referenced by any other entity' })
              .toJson(),
            ],
          },
          {
            key: '5',
            title: 'Database',
            id: databaseTabId,
            hidden: { _code: 'return data?.isChildProperty || (!data?.createdInDb && data.dataFormat !== \'entity\');', _mode: 'code', _value: false },
            components: [...new DesignerToolbarSettings()
              .addSettingsInput({ parentId: cascadeTabId, inputType: 'textField', propertyName: 'columnName', label: 'DB column name', editMode: false })
              .addContainer({ id: listDbFormatId, parentId: dataTabId, hidden: { _code: 'return data?.dataType !== \'array\';', _mode: 'code', _value: false },
                components: [...new DesignerToolbarSettings()
                  .addContainer({ id: listRelFormatId, parentId: dataTabId, hidden: { _code: 'return !data?.listConfiguration;', _mode: 'code', _value: false },
                    components: [...new DesignerToolbarSettings()
                      .addSettingsInput({ parentId: listRelFormatId, inputType: 'dropdown', propertyName: 'listConfiguration.mappingType', label: 'Mapping type', mode: 'single',
                        dropdownOptions: [
                          { label: 'Many to many', value: 'many-to-many' },
                          { label: 'Many to one', value: 'many-to-one' },
                        ],
                        editMode: false,
                      })
                      .toJson(),
                    ],
                  })
                  .addContainer({ id: manyToOneFormatId, parentId: dataTabId, hidden: { _code: 'return data?.listConfiguration?.mappingType !== \'many-to-one\';', _mode: 'code', _value: false },
                    components: [...new DesignerToolbarSettings()
                      .addSettingsInput({ parentId: manyToOneFormatId, inputType: 'textField', propertyName: 'listConfiguration.foreignProperty', label: 'Foreign ptoperty name', editMode: false })
                      .toJson(),
                    ],
                  })
                  .addContainer({ id: manyToManyFormatId, parentId: dataTabId, hidden: { _code: 'return data?.listConfiguration?.mappingType !== \'many-to-many\';', _mode: 'code', _value: false },
                    components: [...new DesignerToolbarSettings()
                      .addSettingsInput({ parentId: manyToManyFormatId, inputType: 'textField',
                        propertyName: 'listConfiguration.dbMapping.manyToManyTableName', label: 'Many to many table name', editMode: false })
                      .addSettingsInput({ parentId: manyToManyFormatId, inputType: 'textField',
                        propertyName: 'listConfiguration.dbMapping.manyToManyKeyColumnName', label: 'Key column name', editMode: false })
                      .addSettingsInput({ parentId: manyToManyFormatId, inputType: 'textField',
                        propertyName: 'listConfiguration.dbMapping.manyToManyChildColumnName', label: 'Child column name', editMode: false })
                      .addSettingsInput({ parentId: manyToManyFormatId, inputType: 'textField',
                        propertyName: 'listConfiguration.dbMapping.manyToManyInversePropertyName', label: 'Inverse property', editMode: false })
                      .toJson(),
                    ],
                  })
                  .toJson(),
                ],
              })
              .toJson(),
            ],
          },
        ],
      }).toJson(),
    formSettings: {
      colon: false,
      layout: 'vertical' as FormLayout,
      labelCol: { span: 24 },
      wrapperCol: { span: 24 },
    },
  };
};
