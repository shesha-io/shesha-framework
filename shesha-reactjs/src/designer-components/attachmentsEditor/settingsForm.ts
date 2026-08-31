import { FormLayout } from 'antd/lib/form/Form';
import { nanoid } from '@/utils/uuid';
import { DataTypes, SettingsFormMarkupFactory } from '@/interfaces';
import { FILE_EVENTS_WITHOUT_CHANGE } from '../_common/events';
import { deviceDataPath } from '@/form-factory/implementation';

/* Every Display Style but File name renders a tile. Listed rather than tested as "not text" so an
   unset value reads as file-name instead of silently enabling every thumbnail-only setting. */
const THUMBNAIL_STYLES = '["thumbnailSmall","thumbnailMedium","thumbnailLarge","thumbnailCustom"]';
const isThumbnailJs = `return ${THUMBNAIL_STYLES}.includes(getSettingValue(data?.displayStyle));`;
const isNotThumbnailJs = `return !${THUMBNAIL_STYLES}.includes(getSettingValue(data?.displayStyle));`;
const isNotDraggerJs = 'return getSettingValue(data?.isDragger) !== true;';
const isDraggerJs = 'return getSettingValue(data?.isDragger) === true;';
const isThumbnailListJs = `return ${THUMBNAIL_STYLES}.includes(getSettingValue(data?.displayStyle)) && !getSettingValue(data?.isDragger);`;
/* The presets set the tile size themselves, so the dimensions are offered only where they decide it. */
const isCustomThumbnailJs = 'return getSettingValue(data?.displayStyle) === "thumbnailCustom" && !getSettingValue(data?.isDragger);';
const isEditableJs = 'const r = getSettingValue(data?.readOnly); return r !== true && r !== "readOnly";';
const showCustomContentFormJs = 'return !!getSettingValue(data?.customContent) && getSettingValue(data?.extraFormSelectionMode) !== "dynamic";';

/**
 * Style Downloaded Files gates the Downloaded Files panel, and it is device-scoped, so the condition
 * has to read the slice the Appearance tab is actually editing. That is not always a device: the
 * theme settings page renders these settings with the style router removed, and the settings sit flat
 * on `data`. Spelled out for the device case only, the condition read `data.desktop` on that page,
 * found nothing, and hid the panel outright — which is why the Downloaded Files styling could not be
 * reached from theme settings at all.
 */
const styleDownloadedFilesJs = (removeStyleRouter?: boolean): string =>
  `return !!getSettingValue(${deviceDataPath(removeStyleRouter !== true)}?.styleDownloadedFiles);`;

/**
 * One of the four per-action handlers on the Events tab. `value` is the list as it stands after the
 * action, which is what On Download has always passed; `file` is the one it happened to, and is
 * undefined only for a zip download, which has no single subject.
 */
interface IFileActionHandler {
  inputType: 'codeEditor';
  propertyName: string;
  label: string;
  labelAlign: 'right';
  tooltip: string;
  wrapInTemplate: boolean;
  templateSettings: { functionName: string; useAsyncDeclaration: boolean };
  availableConstantsExpression: string;
}

const fileActionHandler = (propertyName: string, label: string, when: string): IFileActionHandler => ({
  inputType: 'codeEditor', propertyName, label, labelAlign: 'right',
  tooltip: `Callback that is triggered when ${when}.`,
  wrapInTemplate: true,
  templateSettings: { functionName: propertyName, useAsyncDeclaration: true },
  /* No `event`, unlike the pointer and focus handlers: these fire after the API call that did the
     work has resolved, and a zip download has no originating element at all, so there is nothing to
     hand over and advertising one would only offer scripts an always-undefined constant. */
  availableConstantsExpression: 'return metadataBuilder.object("constants").addAllStandard().addArray("value", "Files in the list after the action").addObject("file", "The file the action happened to", undefined).build();',
});

export const getSettings: SettingsFormMarkupFactory = ({ fbf, removeStyleRouter }) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const eventsTabId = nanoid();
  const appearanceTabId = nanoid();
  const styleRouterId = nanoid();

  const displayStyleOptions = [
    { label: 'File name', value: 'text' },
    { label: 'Small Thumbnail', value: 'thumbnailSmall' },
    { label: 'Med Thumbnail', value: 'thumbnailMedium' },
    { label: 'Large Thumbnail', value: 'thumbnailLarge' },
    { label: 'Custom Thumbnail', value: 'thumbnailCustom' },
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
              /* Tooltip only — no Placeholder. The standard pair assumes a text input with empty
                 space to prompt into; this component's control is an upload trigger and a file list,
                 which have nowhere to show one, and nothing ever read the property. Same shape the
                 checkbox group uses for the same reason. */
              .addSettingsInputRow({ inputs: [{ type: 'textArea', propertyName: 'description', label: 'Tooltip', jsSetting: true }] })
              .stdVisibleEditableInputs('full')
              .stdCollapsiblePanel('Display', (fb) => fb
                .addSettingsInputRow({
                  inputs: [
                    /* Mutually exclusive with Is Dragger, in both directions: a dragger is a drop
                       area with a plain text list, so it has no list type to choose. Matches how
                       main gates these two against each other. */
                    {
                      type: 'dropdown', propertyName: 'displayStyle', label: 'Display Style', jsSetting: true,
                      dropdownOptions: displayStyleOptions, visibleJs: isNotDraggerJs,
                      tooltip: 'How each file is presented: as its name, or as a tile at a preset size. Custom Thumbnail takes its size from the Thumbnail Style dimensions.',
                    },
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
                })
                .addSettingsInputRow({
                  visibleJs: isDraggerJs,
                  inputs: [
                    {
                      type: 'textArea', propertyName: 'dropzoneText', label: 'Dropzone Text', jsSetting: true,
                      tooltip: 'Replaces the prompt in the drop area. Left empty, it keeps the stock wording and its hint; set, it stands alone, and its line breaks are shown.',
                    },
                  ],
                })
                .addSettingsInputRow({
                  inputs: [
                    {
                      type: 'textArea', propertyName: 'emptyText', label: 'Empty Text', jsSetting: true,
                      tooltip: 'Shown when there are no files and none can be added — a read-only or disabled list. Left empty, such a list renders nothing at all.',
                    },
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
                .addSettingsInput({ inputType: 'entityTypeAutocomplete', propertyName: 'ownerType', label: 'Parent Entity Type', jsSetting: true })
                .addSettingsInputRow({
                  inputs: [
                    { type: 'textField', propertyName: 'ownerId', label: 'Parent Record ID', jsSetting: true },
                    { type: 'textField', propertyName: 'filesCategory', label: 'File Group', jsSetting: true },
                  ],
                })
                .addSettingsInput({
                  inputType: 'editableTagGroupProps', propertyName: 'allowedFileTypes', label: 'Accepted File Types', jsSetting: true,
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
              /* The four actions first: they are what the component is for, and what a reader looks
                 for. The generic pointer and focus events follow. */
              .addSettingsInput(fileActionHandler('onUpload', 'On Upload', 'a file is uploaded'))
              .addSettingsInput(fileActionHandler('onDownload', 'On Download', 'a file is downloaded, including as part of a zip'))
              .addSettingsInput(fileActionHandler('onReplace', 'On Replace', 'a file is replaced with a new version'))
              .addSettingsInput(fileActionHandler('onDelete', 'On Delete', 'a file is deleted'))
              /* FILE_EVENTS_WITHOUT_CHANGE, matching what the runtime binds: the standard input set
                 minus onDoubleClick and the keyboard events, and minus onChange, which the four
                 handlers above replace. They are bound to the wrapper the component renders into, so
                 they fire for the list as a whole rather than for an individual file — which is what
                 the tooltips say, so the labels carry no prefix of their own. */
              .stdEventHandlers([...FILE_EVENTS_WITHOUT_CHANGE], DataTypes.array)
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
                      .stdContainer((fb) => fb.stdDimensionsPanel('thumbnailStyle.dimensions'), isCustomThumbnailJs)
                      .stdBorderPanel(removeStyleRouter !== true, 'thumbnailStyle.border')
                      .stdBackgroundPanel(removeStyleRouter !== true, 'thumbnailStyle.background')
                      .stdShadowPanel('thumbnailStyle.shadow')
                      .stdMarginPaddingPanel('thumbnailStyle.stylingBoxJson')
                      .stdCustomStylePanel(undefined, 'thumbnailStyle.style'),
                    true, isThumbnailListJs,
                    )
                    .addSettingsInputRow({
                      inputs: [
                        { type: 'switch', propertyName: 'styleDownloadedFiles', label: 'Style Downloaded Files', jsSetting: true },
                      ],
                    })
                    /* The panel's own gate is enough for everything inside it, so the Font and Custom
                       Style panels carry no condition of their own — they are only reachable when it
                       is open. Both still take the device flag, since their property names resolve
                       through the same router. */
                    .stdCollapsiblePanel('Downloaded Files', (f) => f
                      .addSettingsInputRow({
                        visibleJs: styleDownloadedFilesJs(removeStyleRouter),
                        inputs: [
                          { type: 'iconPicker', propertyName: 'downloadedIcon', label: 'Downloaded Icon', jsSetting: true },
                        ],
                      })
                      .stdFontPanel(removeStyleRouter !== true, 'downloadedFileStyles.font')
                      .stdCustomStylePanel(removeStyleRouter !== true, 'downloadedFileStyles.style'),
                    false, styleDownloadedFilesJs(removeStyleRouter))
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
