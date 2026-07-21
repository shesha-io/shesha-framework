import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { FormLayout } from 'antd/lib/form/Form';
import { nanoid } from '@/utils/uuid';
import { FormMarkupWithSettings } from '@/interfaces';

export const getSettings = (data: object): FormMarkupWithSettings => {
  const basicPanelId = nanoid();
  const playbackPanelId = nanoid();
  const advancedPanelId = nanoid();
  const stylePanelId = nanoid();
  const securityPanelId = nanoid();
  const styleRouterId = nanoid();

  return {
    components: new DesignerToolbarSettings(data)
      .addCollapsiblePanel({
        id: nanoid(),
        propertyName: 'pnlBasic',
        parentId: 'root',
        label: 'Basic',
        labelAlign: 'left',
        expandIconPosition: 'start',
        ghost: true,
        collapsible: 'header',
        content: {
          id: basicPanelId,
          components: [
            ...new DesignerToolbarSettings()
              .addContextPropertyAutocomplete({
                id: nanoid(),
                propertyName: 'propertyName',
                parentId: basicPanelId,
                label: 'Property Name',
                validate: { required: true },
                description: 'Identifier for this component. Required as the bound field when "Require Watching" or "Require Watch Completion" is enabled.',
              })
              .addTextField({
                id: nanoid(),
                propertyName: 'videoId',
                parentId: basicPanelId,
                label: 'Video ID',
                validate: { required: true },
                description: 'YouTube video ID (e.g., dQw4w9WgXcQ)',
              })
              .addTextField({
                id: nanoid(),
                propertyName: 'title',
                parentId: basicPanelId,
                label: 'Title',
              })
              .addTextArea({
                id: nanoid(),
                propertyName: 'description',
                parentId: basicPanelId,
                label: 'Description',
              })
              .addSwitch({
                id: nanoid(),
                propertyName: 'responsive',
                parentId: basicPanelId,
                label: 'Responsive (16:9)',
                description: 'Automatically size the player to the container using a 16:9 ratio',
              })
              .addSwitch({
                id: nanoid(),
                propertyName: 'hidden',
                parentId: basicPanelId,
                label: 'Hide',
              })
              .addTextField({
                id: nanoid(),
                propertyName: 'width',
                parentId: basicPanelId,
                label: 'Width',
                description: 'Player width. Any unit (%, px, em, etc). px by default if no unit is given.',
                hidden: {
                  _code: 'return getSettingValue(data?.responsive) === true;',
                  _mode: 'code',
                  _value: false,
                } as any,
              })
              .addTextField({
                id: nanoid(),
                propertyName: 'height',
                parentId: basicPanelId,
                label: 'Height',
                description: 'Player height. Any unit (%, px, em, etc). px by default if no unit is given.',
                hidden: {
                  _code: 'return getSettingValue(data?.responsive) === true;',
                  _mode: 'code',
                  _value: false,
                } as any,
              })
              .toJson(),
          ],
        },
      })
      .addCollapsiblePanel({
        id: nanoid(),
        propertyName: 'pnlPlayback',
        parentId: 'root',
        label: 'Playback',
        labelAlign: 'left',
        expandIconPosition: 'start',
        ghost: true,
        collapsible: 'header',
        content: {
          id: playbackPanelId,
          components: [
            ...new DesignerToolbarSettings()
              .addSwitch({
                id: nanoid(),
                propertyName: 'autoplay',
                parentId: playbackPanelId,
                label: 'Autoplay',
                description: 'Automatically start playing the video when the page loads',
              })
              .addSwitch({
                id: nanoid(),
                propertyName: 'mute',
                parentId: playbackPanelId,
                label: 'Mute',
                description: 'Start the video with audio muted',
              })
              .addSwitch({
                id: nanoid(),
                propertyName: 'loop',
                parentId: playbackPanelId,
                label: 'Loop',
                description: 'Replay the video continuously when it ends',
              })
              .addSwitch({
                id: nanoid(),
                propertyName: 'showControls',
                parentId: playbackPanelId,
                label: 'Show Controls',
                description: 'Display the player controls (play, pause, volume, etc.)',
              })
              .addNumberField({
                id: nanoid(),
                propertyName: 'startTime',
                parentId: playbackPanelId,
                label: 'Start Time (seconds)',
                description: 'Time in seconds where the video should start playing',
              })
              .addNumberField({
                id: nanoid(),
                propertyName: 'endTime',
                parentId: playbackPanelId,
                label: 'End Time (seconds)',
                description: 'Time in seconds where the video should stop playing',
              })
              .addSwitch({
                id: nanoid(),
                propertyName: 'rel',
                parentId: playbackPanelId,
                label: 'Show Related Videos',
                description: 'Show related videos when the video ends',
              })
              .addSwitch({
                id: nanoid(),
                propertyName: 'modestBranding',
                parentId: playbackPanelId,
                label: 'Modest Branding',
                description: 'Reduce the YouTube logo shown in the player control bar',
              })
              .toJson(),
          ],
        },
      })
      .addCollapsiblePanel({
        id: nanoid(),
        propertyName: 'pnlAdvanced',
        parentId: 'root',
        label: 'Advanced',
        labelAlign: 'left',
        expandIconPosition: 'start',
        ghost: true,
        collapsible: 'header',
        content: {
          id: advancedPanelId,
          components: [
            ...new DesignerToolbarSettings()
              .addSwitch({
                id: nanoid(),
                propertyName: 'privacyMode',
                parentId: advancedPanelId,
                label: 'Privacy Mode',
                description: 'Embed using youtube-nocookie.com (privacy-enhanced mode)',
              })
              .addTextField({
                id: nanoid(),
                propertyName: 'customThumbnail',
                parentId: advancedPanelId,
                label: 'Custom Thumbnail URL',
                description: 'URL of an image to show before the viewer starts the video',
              })
              .addSwitch({
                id: nanoid(),
                propertyName: 'isRequired',
                parentId: advancedPanelId,
                label: 'Require Watching',
                description: 'Block form submission until the viewer starts the video. Needs a Property Name.',
              })
              .addSwitch({
                id: nanoid(),
                propertyName: 'watchCompletionRequired',
                parentId: advancedPanelId,
                label: 'Require Watch Completion',
                description: 'Block form submission until the viewer watches the video to the end. Needs a Property Name.',
              })
              .addSwitch({
                id: nanoid(),
                propertyName: 'interactionEvents',
                parentId: advancedPanelId,
                label: 'Track Interactions',
                description: 'Enable the YouTube JS API and the optional play/pause/end handlers below',
              })
              .addCodeEditor({
                id: nanoid(),
                propertyName: 'onPlay',
                parentId: advancedPanelId,
                label: 'On Play',
                mode: 'dialog',
                description: 'Runs when playback starts. Available: event, data, globalState.',
                hidden: {
                  _code: 'return !getSettingValue(data?.interactionEvents);',
                  _mode: 'code',
                  _value: false,
                } as any,
                exposedVariables: [
                  { id: nanoid(), name: 'event', description: 'YouTube player event', type: 'object' },
                  { id: nanoid(), name: 'data', description: 'Form data', type: 'object' },
                  { id: nanoid(), name: 'globalState', description: 'Global state', type: 'object' },
                ],
              })
              .addCodeEditor({
                id: nanoid(),
                propertyName: 'onPause',
                parentId: advancedPanelId,
                label: 'On Pause',
                mode: 'dialog',
                description: 'Runs when playback is paused. Available: event, data, globalState.',
                hidden: {
                  _code: 'return !getSettingValue(data?.interactionEvents);',
                  _mode: 'code',
                  _value: false,
                } as any,
                exposedVariables: [
                  { id: nanoid(), name: 'event', description: 'YouTube player event', type: 'object' },
                  { id: nanoid(), name: 'data', description: 'Form data', type: 'object' },
                  { id: nanoid(), name: 'globalState', description: 'Global state', type: 'object' },
                ],
              })
              .addCodeEditor({
                id: nanoid(),
                propertyName: 'onEnd',
                parentId: advancedPanelId,
                label: 'On End',
                mode: 'dialog',
                description: 'Runs when the video ends. Available: event, data, globalState.',
                hidden: {
                  _code: 'return !getSettingValue(data?.interactionEvents);',
                  _mode: 'code',
                  _value: false,
                } as any,
                exposedVariables: [
                  { id: nanoid(), name: 'event', description: 'YouTube player event', type: 'object' },
                  { id: nanoid(), name: 'data', description: 'Form data', type: 'object' },
                  { id: nanoid(), name: 'globalState', description: 'Global state', type: 'object' },
                ],
              })
              .toJson(),
          ],
        },
      })
      .addPropertyRouter({
        id: styleRouterId,
        propertyName: 'propertyRouter1',
        componentName: 'propertyRouter',
        label: 'Property router',
        labelAlign: 'right',
        parentId: 'root',
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
              propertyName: 'pnlStyle',
              parentId: 'root',
              label: 'Style',
              labelAlign: 'left',
              expandIconPosition: 'start',
              ghost: true,
              collapsible: 'header',
              content: {
                id: stylePanelId,
                components: [
                  ...new DesignerToolbarSettings()
                    .addTextField({
                      id: nanoid(),
                      propertyName: 'className',
                      parentId: stylePanelId,
                      label: 'Custom CSS Class',
                      description: 'Custom CSS class to add to this component',
                    })
                    .addCodeEditor({
                      id: nanoid(),
                      propertyName: 'style',
                      parentId: stylePanelId,
                      label: 'Style',
                      mode: 'dialog',
                      description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                      exposedVariables: [
                        { id: nanoid(), name: 'data', description: 'Form data', type: 'object' },
                      ],
                    })
                    .addStyleBox({
                      id: nanoid(),
                      propertyName: 'stylingBox',
                      parentId: stylePanelId,
                      validate: {},
                      jsSetting: false,
                    })
                    .toJson(),
                ],
              },
            })
            .toJson(),
        ],
      })
      .addCollapsiblePanel({
        id: nanoid(),
        propertyName: 'pnlSecurity',
        parentId: 'root',
        label: 'Security',
        labelAlign: 'left',
        expandIconPosition: 'start',
        ghost: true,
        collapsible: 'header',
        content: {
          id: securityPanelId,
          components: [
            ...new DesignerToolbarSettings()
              .addPermissionAutocomplete({
                id: nanoid(),
                propertyName: 'permissions',
                parentId: securityPanelId,
                label: 'Permissions',
                validate: {},
              })
              .toJson(),
          ],
        },
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
