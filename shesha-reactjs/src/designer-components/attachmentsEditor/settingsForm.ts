import { FormLayout } from 'antd/lib/form/Form';
import { nanoid } from '@/utils/uuid';
import { DataTypes, SettingsFormMarkupFactory } from '@/interfaces';

const isThumbnailJs = 'return getSettingValue(data?.listType) === "thumbnail";';
const isNotThumbnailJs = 'return getSettingValue(data?.listType) !== "thumbnail";';
const isNotDraggerJs = 'return !getSettingValue(data?.isDragger);';
const isEditableJs = 'const r = getSettingValue(data?.readOnly); return r !== true && r !== "readOnly";';
const showCustomContentFormJs = 'return !!getSettingValue(data?.customContent) && getSettingValue(data?.extraFormSelectionMode) !== "dynamic";';
const styleDownloadedFilesJs = 'return !!getSettingValue(data?.styleDownloadedFiles);';

export const getSettings: SettingsFormMarkupFactory = ({ fbf, removeStyleRouter }) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const eventsTabId = nanoid();
  const appearanceTabId = nanoid();

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
                    { type: 'dropdown', propertyName: 'listType', label: 'List Type', jsSetting: true, dropdownOptions: listTypeOptions },
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
              // The list has no free-text input and no focusable control of its own: files are added
              // through the antd Upload trigger and acted on through the hover popover. Only the two
              // events the component actually emits are offered, so the tab cannot advertise a
              // handler that would silently never run.
              .stdEventHandlers(['onChange'], DataTypes.array, undefined, 'File List ')
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
              .addSettingsInputRow({
                inputs: [
                  { type: 'dropdown', propertyName: 'filesLayout', label: 'Files Layout', jsSetting: true, dropdownOptions: filesLayoutOptions, visibleJs: isNotDraggerJs },
                  { type: 'numberField', propertyName: 'gap', label: 'Gap', jsSetting: true, visibleJs: isNotDraggerJs },
                ],
              })
              // The root style set is the list container — the scrolling box the files sit in — so the
              // standard panels bind to it unprefixed. The thumbnail and downloaded-file sets below
              // are nested and bind through their own property prefixes.
              .stdAppearancePanels(['font', 'dimensions', 'marginPadding', 'customStyle'], removeStyleRouter)
              /* The Thumbnail set styles the image box only, so it is hidden unless the list is
                 actually showing thumbnails — matching 0.45, which gates Dimensions, Border,
                 Background, Shadow and Custom style on the same condition.

                 It carries no Font panel on purpose: the file name is a separate element that takes
                 its typography from the root Font panel above, which is why 0.45 leaves that one
                 panel ungated. */
              .stdCollapsiblePanel('Thumbnail', (fb) => fb
                .stdDimensionsPanel('thumbnail.dimensions')
                .stdBorderPanel(removeStyleRouter !== true, 'thumbnail.border')
                .stdBackgroundPanel(removeStyleRouter !== true, 'thumbnail.background')
                .stdShadowPanel('thumbnail.shadow')
                .stdMarginPaddingPanel('thumbnail.stylingBoxJson')
                // Must name the nested property: a bare `stdCustomStylePanel()` defaults to 'style'
                // and would bind this editor to the same property as the root one.
                .stdCustomStylePanel('thumbnail.style'),
              false, isThumbnailJs)
              .stdCollapsiblePanel('Downloaded Files', (fb) => fb
                .addSettingsInputRow({
                  inputs: [
                    { type: 'switch', propertyName: 'styleDownloadedFiles', label: 'Style Downloaded Files', jsSetting: true },
                  ],
                })
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
          },
        ],
      })
      .toJson(),
    formSettings: { colon: false, layout: 'vertical' as FormLayout, labelCol: { span: 24 }, wrapperCol: { span: 24 } },
  };

  return json;
};
