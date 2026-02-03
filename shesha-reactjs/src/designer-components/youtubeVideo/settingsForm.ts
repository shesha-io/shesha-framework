import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { FormLayout } from 'antd/lib/form/Form';
import { nanoid } from '@/utils/uuid';
import { FormMarkupWithSettings } from '@/interfaces';
import { getBorderInputs, getCornerInputs } from '../_settings/utils/border/utils';

export const getSettings = (data: object): FormMarkupWithSettings => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const playbackTabId = nanoid();
  const appearanceTabId = nanoid();
  const eventsTabId = nanoid();
  const advancedTabId = nanoid();
  const securityTabId = nanoid();
  const styleRouterId = nanoid();

  return {
    components: new DesignerToolbarSettings(data)
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
            components: [
              ...new DesignerToolbarSettings()
                .addContextPropertyAutocomplete({
                  id: nanoid(),
                  propertyName: 'propertyName',
                  label: 'Property Name',
                  parentId: commonTabId,
                  styledLabel: true,
                  size: 'small',
                  validate: {
                    required: true,
                  },
                  jsSetting: true,
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  inputs: [
                    {
                      type: 'textField',
                      id: nanoid(),
                      propertyName: 'videoId',
                      label: 'Video ID',
                      size: 'small',
                      jsSetting: true,
                      validate: {
                        required: true,
                      },
                      tooltip: 'YouTube video ID (e.g., dQw4w9WgXcQ)',
                    },
                  ],
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  inputs: [
                    {
                      type: 'textField',
                      id: nanoid(),
                      propertyName: 'title',
                      label: 'Title',
                      size: 'small',
                      jsSetting: true,
                    },
                  ],
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  inputs: [
                    {
                      type: 'textArea',
                      id: nanoid(),
                      propertyName: 'description',
                      label: 'Description',
                      size: 'small',
                      jsSetting: true,
                    },
                  ],
                })
                .addCollapsiblePanel({
                  id: nanoid(),
                  propertyName: 'pnlTypography',
                  label: 'Typography Options',
                  labelAlign: 'right',
                  ghost: true,
                  parentId: commonTabId,
                  collapsible: 'header',
                  content: {
                    id: nanoid(),
                    components: [
                      ...new DesignerToolbarSettings()
                        .addSettingsInputRow({
                          id: nanoid(),
                          parentId: commonTabId,
                          inputs: [
                            {
                              type: 'dropdown',
                              id: nanoid(),
                              propertyName: 'titleLevel',
                              label: 'Title Level',
                              size: 'small',
                              jsSetting: true,
                              tooltip: 'Heading level for the title (h1-h5)',
                              dropdownOptions: [
                                { label: '1 (Largest)', value: '1' },
                                { label: '2', value: '2' },
                                { label: '3 (Default)', value: '3' },
                                { label: '4', value: '4' },
                                { label: '5 (Smallest)', value: '5' },
                              ],
                            },
                          ],
                        })
                        .toJson(),
                    ],
                  },
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  inputs: [
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'responsive',
                      label: 'Responsive (16:9)',
                      size: 'small',
                      jsSetting: true,
                      tooltip: 'A 16:9 aspect ratio mode. Width from Appearance tab will auto-convert to % (e.g., 500px → 500%) height is ignored.',
                    },
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'hidden',
                      label: 'Hide',
                      size: 'small',
                      jsSetting: true,
                    },
                  ],
                })
                .toJson(),
            ],
          },
          {
            key: '2',
            title: 'Playback',
            id: playbackTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: playbackTabId,
                  inputs: [
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'autoplay',
                      label: 'Autoplay',
                      size: 'small',
                      jsSetting: true,
                      tooltip: 'Automatically start playing the video when the page loads',
                    },
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'mute',
                      label: 'Mute',
                      size: 'small',
                      jsSetting: true,
                      tooltip: 'Start video with audio muted',
                    },
                  ],
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: playbackTabId,
                  inputs: [
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'loop',
                      label: 'Loop',
                      size: 'small',
                      jsSetting: true,
                      tooltip: 'Replay video continuously from the beginning when it ends',
                    },
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'showControls',
                      label: 'Show Controls',
                      size: 'small',
                      jsSetting: true,
                      tooltip: 'Display video player controls (play, pause, volume, etc.)',
                    },
                  ],
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: playbackTabId,
                  inputs: [
                    {
                      type: 'numberField',
                      id: nanoid(),
                      propertyName: 'startTime',
                      label: 'Start Time (seconds)',
                      size: 'small',
                      jsSetting: true,
                      tooltip: 'Time in seconds where the video should start playing',
                    },
                    {
                      type: 'numberField',
                      id: nanoid(),
                      propertyName: 'endTime',
                      label: 'End Time (seconds)',
                      size: 'small',
                      jsSetting: true,
                      tooltip: 'Time in seconds where the video should stop playing',
                    },
                  ],
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: playbackTabId,
                  inputs: [
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'fullscreen',
                      label: 'Show Fullscreen Button',
                      size: 'small',
                      jsSetting: true,
                      tooltip: 'Display the fullscreen button in player controls',
                    },
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'disableKeyboard',
                      label: 'Disable Keyboard Controls',
                      size: 'small',
                      jsSetting: true,
                      tooltip: 'Prevent keyboard shortcuts from controlling the player',
                    },
                  ],
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: playbackTabId,
                  inputs: [
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'ccLoadPolicy',
                      label: 'Auto-Show Captions',
                      size: 'small',
                      jsSetting: true,
                      tooltip: 'Automatically display closed captions by default',
                    },
                  ],
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: playbackTabId,
                  inputs: [
                    {
                      type: 'textField',
                      id: nanoid(),
                      propertyName: 'ccLangPref',
                      label: 'Caption Language',
                      size: 'small',
                      jsSetting: true,
                      tooltip: 'ISO 639-1 language code for captions (e.g., en, es, fr)',
                    },
                  ],
                })
                .toJson(),
            ],
          },
          {
            key: '3',
            title: 'Appearance',
            id: appearanceTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addPropertyRouter({
                  id: styleRouterId,
                  propertyName: 'propertyRouter1',
                  componentName: 'propertyRouter',
                  label: 'Property router1',
                  labelAlign: 'right',
                  parentId: appearanceTabId,
                  hidden: false,
                  propertyRouteName: {
                    _mode: 'code',
                    _code: "    return contexts.canvasContext?.designerDevice || 'desktop';",
                    _value: '',
                  },
                  components: [
                    ...new DesignerToolbarSettings()
                      .addCollapsiblePanel({
                        id: nanoid(),
                        propertyName: 'pnlDimensions',
                        label: 'Dimensions',
                        parentId: styleRouterId,
                        labelAlign: 'right',
                        ghost: true,
                        collapsible: 'header',
                        content: {
                          id: nanoid(),
                          components: [
                            ...new DesignerToolbarSettings()
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: styleRouterId,
                                inline: true,
                                inputs: [
                                  {
                                    type: 'textField',
                                    id: nanoid(),
                                    label: 'Width',
                                    width: 85,
                                    propertyName: 'dimensions.width',
                                    icon: 'widthIcon',
                                    tooltip: 'You can use any unit (%, px, em, etc). px by default if without unit',
                                  },
                                  {
                                    type: 'textField',
                                    id: nanoid(),
                                    label: 'Min Width',
                                    width: 85,
                                    hideLabel: true,
                                    propertyName: 'dimensions.minWidth',
                                    icon: 'minWidthIcon',
                                  },
                                  {
                                    type: 'textField',
                                    id: nanoid(),
                                    label: 'Max Width',
                                    width: 85,
                                    hideLabel: true,
                                    propertyName: 'dimensions.maxWidth',
                                    icon: 'maxWidthIcon',
                                  },
                                ],
                              })
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: styleRouterId,
                                inline: true,
                                inputs: [
                                  {
                                    type: 'textField',
                                    id: nanoid(),
                                    label: 'Height',
                                    width: 85,
                                    propertyName: 'dimensions.height',
                                    icon: 'heightIcon',
                                    tooltip: 'You can use any unit (%, px, em, etc). px by default if without unit',
                                  },
                                  {
                                    type: 'textField',
                                    id: nanoid(),
                                    label: 'Min Height',
                                    width: 85,
                                    hideLabel: true,
                                    propertyName: 'dimensions.minHeight',
                                    icon: 'minHeightIcon',
                                  },
                                  {
                                    type: 'textField',
                                    id: nanoid(),
                                    label: 'Max Height',
                                    width: 85,
                                    hideLabel: true,
                                    propertyName: 'dimensions.maxHeight',
                                    icon: 'maxHeightIcon',
                                  },
                                ],
                              })
                              .toJson(),
                          ],
                        },
                      })
                      .addCollapsiblePanel({
                        id: nanoid(),
                        propertyName: 'pnlBorderStyle',
                        label: 'Border',
                        labelAlign: 'right',
                        ghost: true,
                        parentId: styleRouterId,
                        collapsible: 'header',
                        content: {
                          id: nanoid(),
                          components: [
                            ...new DesignerToolbarSettings()
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: styleRouterId,
                                hidden: {
                                  _code: 'return  !getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.border?.hideBorder);',
                                  _mode: 'code',
                                  _value: false,
                                } as any,
                                inputs: [
                                  {
                                    type: 'button',
                                    id: nanoid(),
                                    label: 'Border',
                                    hideLabel: true,
                                    propertyName: 'border.hideBorder',
                                    icon: 'EyeOutlined',
                                    iconAlt: 'EyeInvisibleOutlined',
                                  },
                                ],
                              })
                              .addContainer({
                                id: nanoid(),
                                parentId: styleRouterId,
                                components: getBorderInputs() as any,
                              })
                              .addContainer({
                                id: nanoid(),
                                parentId: styleRouterId,
                                components: getCornerInputs() as any,
                              })
                              .toJson(),
                          ],
                        },
                      })
                      .addCollapsiblePanel({
                        id: nanoid(),
                        propertyName: 'pnlShadowStyle',
                        label: 'Shadow',
                        labelAlign: 'right',
                        ghost: true,
                        parentId: styleRouterId,
                        collapsible: 'header',
                        content: {
                          id: nanoid(),
                          components: [
                            ...new DesignerToolbarSettings()
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: styleRouterId,
                                inline: true,
                                inputs: [
                                  {
                                    type: 'numberField',
                                    id: nanoid(),
                                    label: 'Offset X',
                                    hideLabel: true,
                                    tooltip: 'Offset X',
                                    width: 80,
                                    icon: 'offsetHorizontalIcon',
                                    propertyName: 'shadow.offsetX',
                                  },
                                  {
                                    type: 'numberField',
                                    id: nanoid(),
                                    label: 'Offset Y',
                                    hideLabel: true,
                                    tooltip: 'Offset Y',
                                    width: 80,
                                    icon: 'offsetVerticalIcon',
                                    propertyName: 'shadow.offsetY',
                                  },
                                  {
                                    type: 'numberField',
                                    id: nanoid(),
                                    label: 'Blur',
                                    hideLabel: true,
                                    tooltip: 'Blur Radius',
                                    width: 80,
                                    icon: 'blurIcon',
                                    propertyName: 'shadow.blurRadius',
                                  },
                                  {
                                    type: 'numberField',
                                    id: nanoid(),
                                    label: 'Spread',
                                    hideLabel: true,
                                    tooltip: 'Spread Radius',
                                    width: 80,
                                    icon: 'spreadIcon',
                                    propertyName: 'shadow.spreadRadius',
                                  },
                                  {
                                    type: 'colorPicker',
                                    id: nanoid(),
                                    label: 'Color',
                                    hideLabel: true,
                                    propertyName: 'shadow.color',
                                  },
                                ],
                              })
                              .toJson(),
                          ],
                        },
                      })
                      .addCollapsiblePanel({
                        id: nanoid(),
                        propertyName: 'stylingBox',
                        label: 'Margin & Padding',
                        labelAlign: 'right',
                        ghost: true,
                        collapsible: 'header',
                        content: {
                          id: nanoid(),
                          components: [
                            ...new DesignerToolbarSettings()
                              .addStyleBox({
                                id: nanoid(),
                                label: 'Margin Padding',
                                hideLabel: true,
                                propertyName: 'stylingBox',
                              })
                              .toJson(),
                          ],
                        },
                      })
                      .addCollapsiblePanel({
                        id: nanoid(),
                        propertyName: 'customStyle',
                        label: 'Custom Styles',
                        labelAlign: 'right',
                        ghost: true,
                        parentId: styleRouterId,
                        collapsible: 'header',
                        content: {
                          id: nanoid(),
                          components: [
                            ...new DesignerToolbarSettings()
                              .addSettingsInput({
                                id: nanoid(),
                                inputType: 'codeEditor',
                                propertyName: 'style',
                                label: 'Style',
                                tooltip: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                              })
                              .toJson(),
                          ],
                        },
                      })
                      .toJson(),
                  ],
                })
                .toJson(),
            ],
          },
          {
            key: '4',
            title: 'Events',
            id: eventsTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addConfigurableActionConfigurator({
                  id: nanoid(),
                  propertyName: 'onPlay',
                  label: 'On Play',
                  labelAlign: 'right',
                  parentId: eventsTabId,
                  description: 'Action to execute when the video starts playing',
                  validate: {},
                })
                .addConfigurableActionConfigurator({
                  id: nanoid(),
                  propertyName: 'onPause',
                  label: 'On Pause',
                  labelAlign: 'right',
                  parentId: eventsTabId,
                  description: 'Action to execute when the video is paused',
                  validate: {},
                })
                .addConfigurableActionConfigurator({
                  id: nanoid(),
                  propertyName: 'onEnd',
                  label: 'On End',
                  labelAlign: 'right',
                  parentId: eventsTabId,
                  description: 'Action to execute when the video finishes playing',
                  validate: {},
                })
                .addConfigurableActionConfigurator({
                  id: nanoid(),
                  propertyName: 'onReady',
                  label: 'On Ready',
                  labelAlign: 'right',
                  parentId: eventsTabId,
                  description: 'Action to execute when the video player is ready',
                  validate: {},
                })
                .toJson(),
            ],
          },
          {
            key: '5',
            title: 'Advanced',
            id: advancedTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: advancedTabId,
                  inputs: [
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'privacyMode',
                      label: 'Privacy Mode',
                      size: 'small',
                      jsSetting: true,
                      tooltip: 'Use youtube-nocookie.com',
                    },
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'playsinline',
                      label: 'Play Inline (iOS)',
                      size: 'small',
                      jsSetting: true,
                      tooltip: 'Enable inline playback on iOS devices (instead of fullscreen)',
                    },
                  ],
                })
                .addSettingsInput({
                  id: nanoid(),
                  parentId: advancedTabId,
                  label: 'Thumbnail Source Type',
                  jsSetting: true,
                  propertyName: 'thumbnailSource',
                  inputType: 'radio',
                  buttonGroupOptions: [
                    { title: 'Url', icon: 'LinkOutlined', value: 'url' },
                    { title: 'Upload', icon: 'PictureOutlined', value: 'base64' },
                    { title: 'StoredFile', icon: 'DatabaseOutlined', value: 'storedFile' },
                  ],
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: advancedTabId,
                  inputs: [{
                    type: 'textField',
                    id: nanoid(),
                    propertyName: 'thumbnailUrl',
                    jsSetting: false,
                    label: 'Thumbnail URL',
                  }],
                  hidden: {
                    _code: "return getSettingValue(data?.thumbnailSource) !== 'url';",
                    _mode: 'code',
                    _value: false,
                  },
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: advancedTabId,
                  inputs: [{
                    id: nanoid(),
                    type: 'imageUploader',
                    parentId: advancedTabId,
                    label: 'Upload Thumbnail',
                    propertyName: 'thumbnailBase64',
                  }],
                  hidden: {
                    _code: "return getSettingValue(data?.thumbnailSource) !== 'base64';",
                    _mode: 'code',
                    _value: false,
                  },
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: advancedTabId,
                  inputs: [{
                    type: 'textField',
                    id: nanoid(),
                    jsSetting: false,
                    propertyName: 'thumbnailStoredFileId',
                    label: 'Stored File ID',
                  }],
                  hidden: {
                    _code: "return getSettingValue(data?.thumbnailSource) !== 'storedFile';",
                    _mode: 'code',
                    _value: false,
                  },
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: advancedTabId,
                  inputs: [
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'watchCompletionRequired',
                      label: 'Require Watch Completion',
                      size: 'small',
                      jsSetting: true,
                      tooltip: 'When enabled, the form cannot be submitted until the user watches the entire video. The completion state is stored in the form data.',
                    },
                  ],
                })
                .toJson(),
            ],
          },
          {
            key: '6',
            title: 'Security',
            id: securityTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInput({
                  id: nanoid(),
                  inputType: 'permissions',
                  propertyName: 'permissions',
                  label: 'Permissions',
                  size: 'small',
                  parentId: securityTabId,
                  jsSetting: true,
                })
                .toJson(),
            ],
          },
        ],
      })
      .toJson(),
    formSettings: {
      colon: false,
      layout: 'vertical' as FormLayout,
      labelCol: { span: 24 },
      wrapperCol: { span: 24 },
    },
  };
};
