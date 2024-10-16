import { nanoid } from '@/utils/uuid';
import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import {
  ALIGN_ITEMS,
  ALIGN_SELF,
  FLEX_DIRECTION,
  FLEX_WRAP,
  JUSTIFY_CONTENT,
  JUSTIFY_ITEMS,
  JUSTIFY_SELF,
  TEXT_JUSTIFY,
} from './data';

export const getSettings = (data: any) =>
  new DesignerToolbarSettings(data)
    .addCollapsiblePanel({
      id: '11164664-cbc9-4cef-babc-6fbea44cd0ca',
      propertyName: 'pnlDisplay',
      parentId: 'root',
      label: 'Display',
      labelAlign: 'left',
      expandIconPosition: 'start',
      ghost: true,
      collapsible: 'header',
      content: {
        id: 'pnl64664-cbc9-4cef-babc-6fbea44cd0ca',
        components: [
          ...new DesignerToolbarSettings()
            .addTextField({
              id: '6d39921b-d20e-49cf-bc54-ec584f63be5c',
              propertyName: 'componentName',
              parentId: 'pnl64664-cbc9-4cef-babc-6fbea44cd0ca',
              label: 'Component name',
              validate: { required: true },
              jsSetting: false
            })
            .addCheckbox({
              id: 'bf1823d6-dca4-408a-b7d8-5b42eacb076d',
              propertyName: 'hidden',
              parentId: 'pnl64664-cbc9-4cef-babc-6fbea44cd0ca',
              label: 'Hidden',
            })
            .addEditMode({
              id: 'abc823d6-dca4-408a-b7d8-5b42eacb1234',
              propertyName: 'editMode',
              parentId: 'pnl64664-cbc9-4cef-babc-6fbea44cd0ca',
              label: 'Edit mode',
            })
            .addCheckbox({
              id: 'c9900272-11c6-4484-be5b-e48c859f86e4',
              propertyName: 'noDefaultStyling',
              parentId: 'pnl64664-cbc9-4cef-babc-6fbea44cd0ca',
              label: 'No Default Styling',
              description: 'If checked, the default styles and classes of the container will not be applied.',
            })
            .addDropdown({
              id: 'dbad943d-d498-454b-b13e-6845b69c8df1',
              propertyName: 'display',
              label: 'Display',
              labelAlign: 'right',
              parentId: 'pnl64664-cbc9-4cef-babc-6fbea44cd0ca',
              allowClear: false,
              hidden: false,
              dataSourceType: 'values',
              values: [
                {
                  id: '4ca3ef53-be97-457b-bacb-7d0c0e9b535d',
                  label: 'grid',
                  value: 'grid',
                },
                {
                  id: '219eff56-3005-4df1-9e52-5bd759a34bc2',
                  label: 'block',
                  value: 'block',
                },
                {
                  id: 'f1b3f920-1537-4c2f-86bd-bec683dae879',
                  label: 'flex',
                  value: 'flex',
                },
                {
                  id: '4f29e10f-f38f-48f5-b600-0920226493cc',
                  label: 'inline-grid',
                  value: 'inline-grid',
                },
              ],
              description:
                'The display CSS property sets whether an element is treated as a block or inline element and the layout used for its children, such as flow layout, grid or flex.',
              validate: {
                required: true,
              },
            })
            .addDropdown({
              id: '5699c634-286d-4d7e-a804-8405d2cb1721',
              propertyName: 'flexDirection',
              label: 'Flex Direction',
              labelAlign: 'right',
              parentId: 'pnl64664-cbc9-4cef-babc-6fbea44cd0ca',
              hidden: {
                _code: "return  getSettingValue(data?.display) !== 'flex';",
                _mode: 'code',
                _value: false,
              } as any,
              dataSourceType: 'values',
              values: FLEX_DIRECTION,
              description:
                'The flex-direction CSS property sets how flex items are placed in the flex container defining the main axis and the direction (normal or reversed).',
            })
            .addDropdown({
              id: '2706b1e3-83dd-43a9-8800-183ec05f6359',
              propertyName: 'flexWrap',
              label: 'Flex Wrap',
              labelAlign: 'right',
              parentId: 'pnl64664-cbc9-4cef-babc-6fbea44cd0ca',
              hidden: {
                _code: "return getSettingValue(data?.display) !== 'flex';",
                _mode: 'code',
                _value: false,
              } as any,
              dataSourceType: 'values',
              values: FLEX_WRAP,
              description:
                'The flex-wrap CSS property sets whether flex items are forced onto one line or can wrap onto multiple lines. If wrapping is allowed, it sets the direction that lines are stacked.',
            })
            .addTextField({
              id: 'bccb0c08-6d9e-4257-9c40-129974850f4c',
              propertyName: 'gap',
              parentId: 'pnl64664-cbc9-4cef-babc-6fbea44cd0ca',
              label: 'Gap',
              description: 'Examples of a valid gap include: `10` | `10px` | `20px 20px`',
              hidden: {
                _code: "return  getSettingValue(data?.display) === 'block';",
                _mode: 'code',
                _value: false,
              } as any,
            })
            .addNumberField({
              id: 'aae1d544-fe19-4865-9ef7-f885c72d8f61',
              propertyName: 'gridColumnsCount',
              parentId: 'pnl64664-cbc9-4cef-babc-6fbea44cd0ca',
              label: 'Grid Columns Count',
              description: 'Number of columns each grid should have',
              hidden: {
                _code:
                  "return getSettingValue(data?.display) !== 'grid' && getSettingValue(data?.display) !== 'inline-grid';",
                _mode: 'code',
                _value: false,
              } as any,
            })
            .addDropdown({
              id: '3069d513-09bc-41c1-9f63-e47ecf56fb41',
              propertyName: 'direction',
              label: 'Direction',
              labelAlign: 'right',
              parentId: 'pnl64664-cbc9-4cef-babc-6fbea44cd0ca',
              hidden: true,
              dataSourceType: 'values',
              values: [
                {
                  id: 'f6410e20-49ce-45d0-90e3-49a8469a2c30',
                  label: 'horizontal',
                  value: 'horizontal',
                },
                {
                  id: 'efd9da05-227c-43fb-b555-140561b6fefc',
                  label: 'vertical',
                  value: 'vertical',
                },
              ],
              validate: {
                required: true,
              },
            })
            .addDropdown({
              id: '2b17e6cf-0140-47e2-a5a8-f728544b8ef2',
              propertyName: 'alignItems',
              label: 'Align Items',
              labelAlign: 'right',
              parentId: 'pnl64664-cbc9-4cef-babc-6fbea44cd0ca',
              hidden: {
                _code: "return  getSettingValue(data?.direction) === 'block';",
                _mode: 'code',
                _value: false,
              } as any,
              dataSourceType: 'values',
              values: ALIGN_ITEMS,
              validate: {},
              description:
                'The CSS align-items property sets the align-self value on all direct children as a group. In Flexbox, it controls the alignment of items on the Cross Axis. In Grid Layout, it controls the alignment of items on the Block Axis within their grid area.',
            })
            .addDropdown({
              id: 'b9fc3571-5f6e-4bac-8ec9-9313a2e0f695',
              propertyName: 'alignSelf',
              label: 'Align Self',
              labelAlign: 'right',
              parentId: 'pnl64664-cbc9-4cef-babc-6fbea44cd0ca',
              hidden: {
                _code: "return  getSettingValue(data?.direction) === 'block';",
                _mode: 'code',
                _value: false,
              } as any,
              dataSourceType: 'values',
              values: ALIGN_SELF,
              validate: {},
              description:
                "The align-self CSS property overrides a grid or flex item's align-items value. In Grid, it aligns the item inside the grid area. In Flexbox, it aligns the item on the cross axis.",
            })
            .addDropdown({
              id: '41e13a88-21b5-4577-adbf-2f4ef09e5ffc',
              propertyName: 'justifyContent',
              label: 'Justify Content',
              labelAlign: 'right',
              parentId: 'pnl64664-cbc9-4cef-babc-6fbea44cd0ca',
              hidden: {
                _code: "return  getSettingValue(data?.direction) === 'block';",
                _mode: 'code',
                _value: false,
              } as any,
              dataSourceType: 'values',
              values: JUSTIFY_CONTENT,
              validate: {},
              description:
                'The CSS justify-content property defines how the browser distributes space between and around content items along the main-axis of a flex container, and the inline axis of a grid container.',
            })
            .addDropdown({
              id: 'daa3b98e-c6bc-4883-ae54-143756579c51',
              propertyName: 'justifySelf',
              label: 'Justify Self',
              labelAlign: 'right',
              parentId: 'pnl64664-cbc9-4cef-babc-6fbea44cd0ca',
              hidden: {
                _code: "return  getSettingValue(data?.direction) === 'block';",
                _mode: 'code',
                _value: false,
              } as any,
              dataSourceType: 'values',
              values: JUSTIFY_SELF,
              validate: {},
              description:
                'The CSS justify-self property sets the way a box is justified inside its alignment container along the appropriate axis.',
            })
            .addDropdown({
              id: 'a089965c-f1ca-45b1-8f2f-2c8355cc83f9',
              propertyName: 'textJustify',
              label: 'Text Justify',
              labelAlign: 'right',
              parentId: 'pnl64664-cbc9-4cef-babc-6fbea44cd0ca',
              hidden: {
                _code: "return  getSettingValue(data?.direction) === 'block';",
                _mode: 'code',
                _value: false,
              } as any,
              dataSourceType: 'values',
              values: TEXT_JUSTIFY,
              validate: {},
              description:
                'The text-justify CSS property sets what type of justification should be applied to text when text-align: justify; is set on an element.',
            })
            .addDropdown({
              id: '2d75b63f-cee9-44b5-afb7-db1d8f05f005',
              propertyName: 'justifyItems',
              label: 'Justify Items',
              labelAlign: 'right',
              parentId: 'pnl64664-cbc9-4cef-babc-6fbea44cd0ca',
              dataSourceType: 'values',
              values: JUSTIFY_ITEMS,
              validate: {},
              description:
                'The CSS justify-items property defines the default justify-self for all items of the box, giving them all a default way of justifying each box along the appropriate axis.',
            })
            .addDropdown({
              id: nanoid(),
              propertyName: 'overflow',
              label: 'Overflow',
              labelAlign: 'right',
              parentId: 'pnl64664-cbc9-4cef-babc-6fbea44cd0ca',
              dataSourceType: 'values',
              values: [
                {
                  label: "Auto",
                  value: "auto",
                  id: nanoid()
                },
                {
                  label: "Hidden",
                  value: "hidden",
                  id: nanoid()
                },
                {
                  label: "Scroll",
                  value: "scroll",
                  id: nanoid()
                },
              
              ],
              validate: {},
              description:
                'The CSS justify-items property defines the default justify-self for all items of the box, giving them all a default way of justifying each box along the appropriate axis.',
            })
            .addDropdown({
              id: nanoid(),
              propertyName: 'shadowStyle',
              label: 'Shadow Style',
              labelAlign: 'right',
              parentId: 'pnl64664-cbc9-4cef-babc-6fbea44cd0ca',
              dataSourceType: 'values',
              values: [
                {
                  label: "None",
                  value: "none",
                  id: nanoid()
                },
                {
                  label: "Above",
                  value: "above",
                  id: nanoid()
                },
                {
                  label: "Below",
                  value: "below",
                  id: nanoid()
                }
              
              ],
              validate: {},
              description:
                'Determines visibility and position of the box shadow.',
            })
            .toJson(),
        ],
      },
    })
    .addCollapsiblePanel({
      id: 'pnlc68f29dc-6af4-4ad6-8a30-c71681aca484',
      propertyName: 'pnlBorder',
      parentId: 'root',
      label: 'Border',
      labelAlign: "left",
      expandIconPosition: "start",
      ghost: true,
      collapsible: 'header',
      content: {
        id: 'pnl75426727-1739-4812-9eac-9da4d950d311',
        components: [...new DesignerToolbarSettings()
          .addTextField({
            id: '4ed82d6b-b297-4757-aa3d-6428337d0a18',
            propertyName: 'borderWidth',
            label: 'Border Width',
            labelAlign: 'right',
            parentId: 'pnlc68f29dc-6af4-4ad6-8a30-c71681aca484',
            validate: {},
            description:
              'Container border width (can px)',
          })
          .addDropdown({
            id: nanoid(),
            propertyName: 'borderStyle',
            label: 'Border Type',
            labelAlign: 'right',
            dataSourceType: "values",
            values: [
              {
                label: "Solid",
                value: "solid",
                id: nanoid()
              },
              {
                label: "Dashed",
                value: "dashed",
                id: nanoid()
              },
              {
                label: "Dotted",
                value: "dotted",
                id: nanoid()
              }
            ]
          })
          .addColorPicker({
            id: nanoid(),
            propertyName: 'borderColor',
            label: 'Border Color',
            title: 'Choose Border color',
            allowClear: true,
            showText: true,
          })
          .addTextField({
            id: '31598a37-c351-4c3c-8f87-3809d2ebaa85',
            propertyName: 'borderRadius',
            label: 'Border Radius',
            labelAlign: 'right',
            parentId: 'pnlc68f29dc-6af4-4ad6-8a30-c71681aca484',
            validate: {},
            description:
              'Container corner radius (can px or %)',
          })
          .toJson()
        ]
      }
    })

    .addCollapsiblePanel({
      id: nanoid(),
      propertyName: 'pnlBackground',
      parentId: 'root',
      label: 'Background',
      labelAlign: "left",
      expandIconPosition: "start",
      ghost: true,
      collapsible: 'header',
      content: {
        id: nanoid(),
        components: [...new DesignerToolbarSettings()
          .addDropdown({
            id: nanoid(),
            propertyName: 'backgroundType',
            label: 'Background Type',
            labelAlign: 'right',
            parentId: 'pnl64664-cbc9-4cef-babc-6fbea44cd0ca',
            dataSourceType: "values",
            values: [
              {
                label: "Color",
                value: "color",
                id: nanoid()
              },
              {
                label: "Image",
                value: "image",
                id: nanoid()
              }
            ]
          })
          .addColorPicker({
            id: nanoid(),
            propertyName: 'backgroundColor',
            label: 'Color',
            title: 'Choose Background color',
            allowClear: true,
            showText: true,
            hidden: {
              _code: "return getSettingValue(data?.backgroundType) !== 'color';",
              _mode: 'code',
              _value: false,
            } as any
          })
          .addDropdown({
            id: nanoid(),
            propertyName: 'backgroundDataSource',
            label: 'Image Source Type',
            labelAlign: 'right',
            parentId: 'pnl64664-cbc9-4cef-babc-6fbea44cd0ca',
            dataSourceType: "values",
            values: [
              {
                label: "StoredFile",
                value: "storedFileId",
                id: nanoid()
              },
              {
                label: "Url",
                value: "url",
                id: nanoid()
              },
              {
                label: "Base64",
                value: "base64",
                id: nanoid()
              }
            ],
            hidden: {
              _code: "return getSettingValue(data?.backgroundType) !== 'image';",
              _mode: 'code',
              _value: false,
            } as any
          })
          .addDropdown({
            id: nanoid(),
            propertyName: 'backgroundCover',
            label: 'Background Size',
            labelAlign: 'right',
            parentId: 'pnl64664-cbc9-4cef-babc-6fbea44cd0ca',
            dataSourceType: "values",
            hidden: {
              _code: "return getSettingValue(data?.backgroundType) !== 'image';",
              _mode: 'code',
              _value: false,
            } as any,
            values: [
              {
                label: "Contain",
                value: "contain",
                id: nanoid()
              },
              {
                label: "Cover",
                value: "cover",
                id: nanoid()
              }
            ],
          })
          .addDropdown({
            id: nanoid(),
            propertyName: 'backgroundRepeat',
            label: 'Background Repeat',
            labelAlign: 'right',
            parentId: 'pnl64664-cbc9-4cef-babc-6fbea44cd0ca',
            dataSourceType: "values",
            hidden: {
              _code: "return getSettingValue(data?.backgroundType) !== 'image';",
              _mode: 'code',
              _value: false,
            } as any,
            values: [
              {
                label: "Repeat",
                value: "repeat",
                id: nanoid()
              },
              {
                label: "No Repeat",
                value: "no-repeat",
                id: nanoid()
              }, {
                label: "Repeat-X",
                value: "repeat-x",
                id: nanoid()
              },
              {
                label: "Repeat-Y",
                value: "repeat-y",
                id: nanoid()
              },
              {
                label: "Round",
                value: "round",
                id: nanoid()
              },
            ],
          })
          .addTextField({
            id: nanoid(),
            propertyName: 'backgroundUrl',
            parentId: 'pnl64664-cbc9-4cef-babc-6fbea44cd0ca',
            label: 'Background Image URL',
            description: 'Add a background image URL',
            hidden: {
              _code: "return getSettingValue(data?.backgroundDataSource) !== 'url' || getSettingValue(data?.backgroundType) !== 'image';",
              _mode: 'code',
              _value: false,
            } as any,
          })
          .addTextArea({
            id: nanoid(),
            propertyName: 'backgroundBase64',
            parentId: 'pnl64664-cbc9-4cef-babc-6fbea44cd0ca',
            label: 'Base64',
            description: 'Add a base64 encoded image',
            hidden: {
              _code: "return getSettingValue(data?.backgroundDataSource) !== 'base64' || getSettingValue(data?.backgroundType) !== 'image';",
              _mode: 'code',
              _value: false,
            } as any,
          })
          .addTextField({
            id: nanoid(),
            propertyName: "backgroundStoredFileId",
            parentId: 'pnl64664-cbc9-4cef-babc-6fbea44cd0ca',
            label: "StoredFile ID",
            hidden: {
              _code: "return getSettingValue(data?.backgroundDataSource) !== 'storedFileId' || getSettingValue(data?.backgroundType) !== 'image';",
              _mode: 'code',
              _value: false,
            } as any,
          })
          .toJson()
        ]
      }
    })
    .addPropertyRouter({
      id: nanoid(),
      propertyName: 'propertyRouter2',
      componentName: 'propertyRouter2',
      label: 'Property router2',
      labelAlign: 'right',
      parentId: 'root',
      hidden: false,
      propertyRouteName: {
        _mode: "code",
        _code: "    return contexts.canvasContext?.designerDevice || 'desktop';",
        _value: ""
      },
      components: [
        ...new DesignerToolbarSettings()
        .addCollapsiblePanel({
          id: 'db6e32f3-7a8b-4686-a0eb-81b2e36796ef',
          propertyName: 'pnlStyle',
          parentId: 'root',
          label: 'Style',
          labelAlign: 'left',
          expandIconPosition: 'start',
          ghost: true,
          collapsible: 'header',
          content: {
            id: 'pnl64664-cbc9-4cef-bdbc-6fbea44cd0ca',
            components: [
              ...new DesignerToolbarSettings()
                .addTextField({
                  id: 'e6be0d18-7f9e-4ee6-ab4a-19dacf3a3fd6',
                  propertyName: 'width',
                  label: 'Width',
                  labelAlign: 'right',
                  parentId: 'pnld3933cd3-8810-4e29-a434-c84105d46fa2',
                  validate: {},
                  description:
                    'Container default width (can be %, px, or vw)',
                })
                .addTextField({
                  id: '4e024dd1-e7e2-4a0e-8478-e4f6eeba1c94',
                  propertyName: 'minWidth',
                  label: 'Min Width',
                  labelAlign: 'right',
                  parentId: 'pnld3933cd3-8810-4e29-a434-c84105d46fa2',
                  validate: {},
                  description:
                    'Container minimum width (can be %, px, or vw)',
                })
                .addTextField({
                  id: '747d4a30-02e1-4136-ad78-7126e4d36e29',
                  propertyName: 'maxWidth',
                  label: 'Max Width',
                  labelAlign: 'right',
                  parentId: 'pnld3933cd3-8810-4e29-a434-c84105d46fa2',
                  validate: {},
                  description:
                    'Container maximum width (can be %, px, or vw)',
                })
                .addTextField({
                  id: '789ef4cf-843d-4cbf-a932-953d313a3293s',
                  propertyName: 'height',
                  label: 'Height',
                  labelAlign: 'right',
                  parentId: 'pnld3933cd3-8810-4e29-a434-c84105d46fa2',
                  validate: {},
                  description:
                    'Container default height (can be %, px, or vw)',
                })
                .addTextField({
                  id: 'e5b2ef1b-e72b-4477-8794-e1aaa33c0efa',
                  propertyName: 'minHeight',
                  label: 'Min Height',
                  labelAlign: 'right',
                  parentId: 'pnld3933cd3-8810-4e29-a434-c84105d46fa2',
                  validate: {},
                  description:
                    'Container minimum height (can be %, px, or vw)',
                })
                .addTextField({
                  id: '95f424dc-d307-47d8-bad8-ebe6be282cc0',
                  propertyName: 'maxHeight',
                  label: 'Max Height',
                  labelAlign: 'right',
                  parentId: 'pnld3933cd3-8810-4e29-a434-c84105d46fa2',
                  validate: {},
                  description:
                    'Container maximum height (can be %, px, or vw)',
                })
                .addTextField({
                  textType: 'text',
                  id: '648fea09-e548-44b3-9c90-2187ad63fd07',
                  propertyName: 'className',
                  label: 'Custom CSS Class',
                  labelAlign: 'right',
                  parentId: 'root',
                  hidden: false,
                  description: 'Custom CSS Class to add to this component',
                  validate: {},
                  settingsValidationErrors: [],
                })
                .addCodeEditor({
                  id: '4e319199-d27c-4ed0-9934-fa2cb62745d1',
                  propertyName: 'style',
                  label: 'Style',
                  parentId: 'root',
                  mode: 'dialog',
                  description: 'The style that will be applied to the container',
                  exposedVariables: [{ id: nanoid(), name: 'data', description: 'Form data', type: 'object' }],
                })
                .addCodeEditor({
                  id: '71b5da4f-9300-41bf-b0c4-9d9f3757d402',
                  propertyName: 'wrapperStyle',
                  label: 'Wrapper Style',
                  parentId: 'root',
                  mode: 'dialog',
                  description: 'The style that will be applied to the container wrapper',
                  exposedVariables: [{ id: nanoid(), name: 'data', description: 'Form data', type: 'object' }],
                  hidden: { _code: 'return  getSettingValue(data?.noDefaultStyling);', _mode: 'code', _value: false } as any,
                })
                .addStyleBox({
                  id: 'c26c0e0d-f3f6-425f-a8d0-e69f6a4139bd',
                  propertyName: 'stylingBox',
                  parentId: 'root',
                  validate: {},
                  settingsValidationErrors: [],
                  jsSetting: false,
                }).toJson(),
            ],
          },
        }).toJson(),
      ]}) 
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
