import { FormLayout } from 'antd/lib/form/Form';
import { nanoid } from '@/utils/uuid';
import { DataTypes, SettingsFormMarkupFactory } from '@/interfaces';
import { FILE_EVENTS } from '../_common/events';

const isThumbnailJs = 'return getSettingValue(data?.listType) === "thumbnail";';
const isNotThumbnailJs = 'return getSettingValue(data?.listType) !== "thumbnail";';
const isNotDraggerJs = 'return getSettingValue(data?.isDragger) !== true;';
const isThumbnailListJs = 'return getSettingValue(data?.listType) === "thumbnail" && !getSettingValue(data?.isDragger);';
const isEditableJs = 'const r = getSettingValue(data?.readOnly); return r !== true && r !== "readOnly";';
const showCustomContentFormJs = 'return !!getSettingValue(data?.customContent) && getSettingValue(data?.extraFormSelectionMode) !== "dynamic";';
const styleDownloadedFilesJs = 'return !!getSettingValue(data?.[`${contexts?.canvasContext?.designerDevice || "desktop"}`]?.styleDownloadedFiles);';

export const getSettings: SettingsFormMarkupFactory = ({ fbf, removeStyleRouter }) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const eventsTabId = nanoid();
  const appearanceTabId = nanoid();
  const styleRouterId = nanoid();

  const listTypeOptions = [
    { label: 'File name', value: 'text' },
    { label: 'Thumbnail', value: 'thumbnail' },
  ];

  const filesLayoutOptions = [
    { label: 'Horizontal', value: 'horizontal' },
    { label: 'Vertical', value: 'vertical' },
    { label: 'Grid', value: 'grid' },
  ];

  const json = {
    components: fbf('root')
      .addSearchableTabs({
        id: searchableTabsId,
        propertyName: 'settingsTabs',
        label: 'Settings',
        hideLabel: true,
        labelAlign: 'right',
        size: 'small',
        tabs: [
          {
            key: 'common', title: 'Common', id: commonTabId,
            components: fbf(commonTabId)
              .addContextPropertyAutocomplete({ propertyName: 'propertyName', label: 'Property Name', styledLabel: true, size: 'small', jsSetting: true })
              .addLabelConfigurator({ propertyName: 'hideLabel', label: 'Label', hideLabel: true })
              .stdPlaceholderDescriptionInputs()
              .stdVisibleEditableInputs('full')
              .stdCollapsiblePanel('Display', (fb) => fb
                .addSettingsInputRow({
                  inputs: [
                    /* Mutually exclusive with Is Dragger, in both directions: a dragger is a drop
                       area with a plain text list, so it has no list type to choose. Matches how
                       main gates these two against each other. */
                    { type: 'dropdown', propertyName: 'listType', label: 'List Type', jsSetting: true, dropdownOptions: listTypeOptions, visibleJs: isNotDraggerJs },
                    {
                      type: 'switch', propertyName: 'isDragger', label: 'Is Dragger', jsSetting: true,
                      tooltip: 'Whether the uploader should show a drop area instead of a button.',
                      visibleJs: isNotThumbnailJs,
                    },
                  ],
                })
                .addSettingsInputRow({
                  visibleJs: isThumbnailJs,
                  inputs: [
                    { type: 'switch', propertyName: 'hideFileName', label: 'Hide File Name', jsSetting: true },
                  ],
                }))
              .stdCollapsiblePanel('Behaviour', (fb) => fb
                .addSettingsInputRow({
                  visibleJs: isEditableJs,
                  inputs: [
                    { type: 'switch', propertyName: 'allowAdd', label: 'Allow Add', jsSetting: true },
                    { type: 'switch', propertyName: 'allowDelete', label: 'Allow Remove', jsSetting: true },
                  ],
                })
                .addSettingsInputRow({
                  visibleJs: isEditableJs,
                  inputs: [
                    { type: 'switch', propertyName: 'allowReplace', label: 'Allow Replace', jsSetting: true },
                    { type: 'switch', propertyName: 'allowRename', label: 'Allow Rename', jsSetting: true },
                  ],
                })
                .addSettingsInputRow({
                  inputs: [
                    { type: 'switch', propertyName: 'allowViewHistory', label: 'Allow View History', jsSetting: true },
                    { type: 'switch', propertyName: 'downloadZip', label: 'Download Zip', jsSetting: true },
                  ],
                }))
              .stdCollapsiblePanel('Data', (fb) => fb
                .addSettingsInput({ inputType: 'propertyAutocomplete', propertyName: 'ownerName', label: 'Owner', autoFillProps: false })
                .addSettingsInput({ inputType: 'entityTypeAutocomplete', propertyName: 'ownerType', label: 'Owner Type', jsSetting: true })
                .addSettingsInputRow({
                  inputs: [
                    { type: 'textField', propertyName: 'ownerId', label: 'Owner ID', jsSetting: true },
                    { type: 'textField', propertyName: 'filesCategory', label: 'Files Category', jsSetting: true },
                  ],
                })
                .addSettingsInput({
                  inputType: 'editableTagGroupProps', propertyName: 'allowedFileTypes', label: 'Allowed File Types', jsSetting: true,
                  tooltip: 'File types that can be accepted. The file type should include the leading dot, for example .png',
                }))
              .stdCollapsiblePanel('Custom', (fb) => fb
                .addSettingsInputRow({
                  inputs: [
                    {
                      type: 'buttonGroupConfigurator', propertyName: 'customActions', label: 'Custom Actions',
                      buttonText: 'Customize Actions', buttonTextReadOnly: 'View Actions', title: 'Actions Configuration',
                      tooltip: 'Configure custom actions that appear when hovering over files.',
                      jsSetting: false,
                    },
                    {
                      type: 'switch', propertyName: 'customContent', label: 'Show Custom Content', jsSetting: false,
                      tooltip: 'Enable to show custom content below each file.',
                    },
                  ],
                })
                .addSettingsInputRow({
                  visibleJs: showCustomContentFormJs,
                  inputs: [
                    { type: 'formAutocomplete', propertyName: 'extraFormId', label: 'Form', jsSetting: true },
                  ],
                }))
              .stdCollapsiblePanel('Validations', (fb) => fb
                .addSettingsInput({ inputType: 'switch', propertyName: 'validate.required', label: 'Required', size: 'small', layout: 'horizontal', jsSetting: true })
                .addSettingsInputRow({
                  inputs: [
                    { type: 'textField', propertyName: 'validate.message', label: 'Message', size: 'small', jsSetting: true },
                  ],
                }))
              .toJson(),
          },
          {
            key: 'events', title: 'Events', id: eventsTabId,
            components: fbf(eventsTabId)
              /* See FILE_EVENTS: the standard input set minus onDoubleClick and the keyboard events.
                 The pointer and focus events are bound to the wrapper the component renders into, so
                 they fire for the list as a whole rather than for an individual file. */
              .stdEventHandlers([...FILE_EVENTS], DataTypes.array, undefined, 'File List ')
              .addSettingsInput({
                inputType: 'codeEditor', propertyName: 'onDownload', label: 'On Download', labelAlign: 'right',
                tooltip: 'Callback that is triggered when a file is downloaded.',
                wrapInTemplate: true,
                templateSettings: { functionName: 'onDownload', useAsyncDeclaration: true },
                availableConstantsExpression: 'return metadataBuilder.object("constants").addAllStandard().addString("value", "Component current value").addObject("event", "Event callback when user input", undefined).build();',
              })
              .toJson(),
          },
          {
            key: 'appearance', title: 'Appearance', id: appearanceTabId,
            components: fbf(appearanceTabId)
              .addPropertyRouter({
                id: styleRouterId,
                propertyName: 'propertyRouter1',
                componentName: 'propertyRouter',
                label: 'Property router1',
                labelAlign: 'right',
                propertyRouteName: removeStyleRouter === true
                  ? ''
                  : { _mode: 'code', _code: "    return contexts.canvasContext?.designerDevice || 'desktop';", _value: '' },
                components: [
                  ...fbf(styleRouterId)
                    .stdCollapsiblePanel('Layout', (f) => f
                      .addSettingsInputRow({
                        inputs: [
                          { type: 'dropdown', propertyName: 'filesLayout', label: 'Files Layout', jsSetting: true, dropdownOptions: filesLayoutOptions },
                          { type: 'numberField', propertyName: 'gap', label: 'Gap', jsSetting: true },
                        ],
                      }),
                    false, isThumbnailListJs,
                    )
                    .stdAppearancePanels(['font', 'dimensions', 'border', 'background', 'shadow', 'marginPadding', 'customStyle'], removeStyleRouter)
                    .stdCollapsiblePanel('Thumbnail Style', (f) => f
                      .stdDimensionsPanel('thumbnailStyle.dimensions')
                      .stdBorderPanel(removeStyleRouter !== true, 'thumbnailStyle.border')
                      .stdBackgroundPanel(removeStyleRouter !== true, 'thumbnailStyle.background')
                      .stdShadowPanel('thumbnailStyle.shadow')
                      .stdMarginPaddingPanel('thumbnailStyle.stylingBoxJson')
                      .stdCustomStylePanel('thumbnailStyle.style'),
                    true, isThumbnailListJs,
                    )
                    .addSettingsInputRow({
                      inputs: [
                        { type: 'switch', propertyName: 'styleDownloadedFiles', label: 'Style Downloaded Files', jsSetting: true },
                      ],
                    })
                    .stdCollapsiblePanel('Downloaded Files', (f) => f
                      .addSettingsInputRow({
                        visibleJs: styleDownloadedFilesJs,
                        inputs: [
                          { type: 'iconPicker', propertyName: 'downloadedIcon', label: 'Downloaded Icon', jsSetting: true },
                        ],
                      })
                      .stdFontPanel('downloadedFileStyles.font')
                      .stdCustomStylePanel('downloadedFileStyles.style'),
                    false, styleDownloadedFilesJs)
                    .toJson(),
                ],
              })
              .toJson(),
          },
        ],
      })
      .toJson(),
    formSettings: { colon: false, layout: 'vertical' as FormLayout, labelCol: { span: 24 }, wrapperCol: { span: 24 } },
  };

  return json;
};
