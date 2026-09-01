import { FormLayout } from 'antd/lib/form/Form';
import { nanoid } from '@/utils/uuid';
import { DataTypes, SettingsFormMarkupFactory } from '@/interfaces';
import { FILE_EVENTS } from '../_common/events';

export const getSettings: SettingsFormMarkupFactory = ({ fbf, removeStyleRouter }) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const eventsTabId = nanoid();
  const appearanceTabId = nanoid();

  const styleRouterId = nanoid();

  // The thumbnail tile is the only box this component draws, so the box-style panels are shown only
  // for that display type (matching releases/0.45).
  /* A dragger renders a drop area with a plain text list and has no tile, whatever listType says —
     so the tile's box panels must not be offered for one either. */
  /* Every Display Style but File name draws a tile. Listed rather than tested as "not text" so an
     unset value reads as file-name instead of silently enabling every tile-only panel. */
  const THUMBNAIL_STYLES = '["thumbnailSmall","thumbnailMedium","thumbnailLarge","thumbnailCustom"]';
  const IS_THUMBNAIL_JS = `${THUMBNAIL_STYLES}.includes(getSettingValue(data?.displayStyle))`;
  const THUMBNAIL_ONLY_JS = `return ${IS_THUMBNAIL_JS} && getSettingValue(data?.isDragger) !== true;`;
  /* The presets set the tile size themselves, so the dimensions are offered only where they decide it. */
  const CUSTOM_THUMBNAIL_ONLY_JS = 'return getSettingValue(data?.displayStyle) === "thumbnailCustom" && getSettingValue(data?.isDragger) !== true;';
  /* Align applies only to a plain file-name list: a thumbnail tile centres its content, and so does a
     dragger's drop area. The two Font variants must between them cover every combination, or a model
     saved with both thumbnail and dragger set (reachable through jsSetting, and possible in older
     saved forms) would show no Font panel at all — so the no-Align variant is the fallback rather
     than a second positive condition. */
  const FILE_NAME_WITH_ALIGN_JS = `return !${IS_THUMBNAIL_JS} && getSettingValue(data?.isDragger) !== true;`;
  const NO_ALIGN_JS = `return ${IS_THUMBNAIL_JS} || getSettingValue(data?.isDragger) === true;`;

  const displayStyleOptions = [
    { value: 'text', label: 'File name' },
    { value: 'thumbnailSmall', label: 'Small Thumbnail' },
    { value: 'thumbnailMedium', label: 'Med Thumbnail' },
    { value: 'thumbnailLarge', label: 'Large Thumbnail' },
    { value: 'thumbnailCustom', label: 'Custom Thumbnail' },
  ];

  const json = {
    components: fbf('root')
      .addSearchableTabs({ id: searchableTabsId, propertyName: 'settingsTabs', label: 'Settings', hideLabel: true, labelAlign: 'right', size: 'small',
        tabs: [
          { key: 'common', title: 'Common', id: commonTabId, components: fbf(commonTabId)
            .addContextPropertyAutocomplete({ propertyName: 'propertyName', label: 'Property Name', styledLabel: true, size: 'small', validate: { required: true }, jsSetting: true })
            .addLabelConfigurator({ propertyName: 'hideLabel', label: 'Label', hideLabel: true })
            /* Tooltip only — no Placeholder. The standard pair assumes a text input with empty space
               to prompt into; this component's control is an upload trigger and a single file, which
               have nowhere to show one, and nothing ever read the property. Same as the file list. */
            .addSettingsInputRow({ inputs: [{ type: 'textArea', propertyName: 'description', label: 'Tooltip', jsSetting: true }] })
            .stdVisibleEditableInputs('full')
            .stdCollapsiblePanel('Display', (fb) => fb
              .addSettingsInputRow({ inputs: [
                { type: 'dropdown', propertyName: 'displayStyle', label: 'Display Style', size: 'small', jsSetting: true, dropdownOptions: displayStyleOptions,
                  tooltip: 'How the selected file is presented: as its name, or as a tile at a preset size. Custom Thumbnail takes its size from the Dimensions panel.',
                  visibleJs: 'return getSettingValue(data?.isDragger) !== true;' },
                { type: 'switch', propertyName: 'isDragger', label: 'Is Dragger', size: 'small', jsSetting: true, layout: 'horizontal',
                  tooltip: 'Whether the uploader should show a drop area instead of a button',
                  visibleJs: `return !${IS_THUMBNAIL_JS};` },
              ] })
              .addSettingsInputRow({ inputs: [
                { type: 'switch', propertyName: 'hideFileName', label: 'Hide File Name', size: 'small', jsSetting: true, layout: 'horizontal' },
              ], visibleJs: `return ${IS_THUMBNAIL_JS};` }))
            .stdCollapsiblePanel('Files', (fb) => fb
              .addSettingsInputRow({ inputs: [
                { type: 'switch', propertyName: 'allowUpload', label: 'Allow Upload', size: 'small', jsSetting: true, layout: 'horizontal' },
                { type: 'switch', propertyName: 'allowReplace', label: 'Allow Replace', size: 'small', jsSetting: true, layout: 'horizontal' },
              ] })
              .addSettingsInputRow({ inputs: [
                { type: 'switch', propertyName: 'allowDelete', label: 'Allow Delete', size: 'small', jsSetting: true, layout: 'horizontal' },
                { type: 'switch', propertyName: 'useSync', label: 'Synchronous Upload', size: 'small', jsSetting: true, layout: 'horizontal',
                  tooltip: 'Upload the file with the form submission rather than immediately on selection' },
              ] })
              .addSettingsInput({ inputType: 'editableTagGroupProps', propertyName: 'allowedFileTypes', label: 'Allowed File Types', size: 'small',
                tooltip: 'File types that can be accepted. The file type should include the leading dot, for example: .png' })
              .addSettingsInputRow({ inputs: [
                { type: 'textField', propertyName: 'ownerId', label: 'Owner ID', size: 'small', jsSetting: true,
                  tooltip: 'Id of the entity the file is attached to. Defaults to the form data entity when empty' },
                { type: 'entityTypeAutocomplete', propertyName: 'ownerType', label: 'Owner Type', size: 'small', jsSetting: true,
                  tooltip: 'Type of the entity the file is attached to. Defaults to the form model type when empty' },
              ] }))
            .stdCollapsiblePanel('Validations', (fb) => fb
              .addSettingsInput({ inputType: 'switch', propertyName: 'validate.required', label: 'Required', size: 'small', layout: 'horizontal', jsSetting: true }))
            .toJson(),
          },
          {
            key: 'events', title: 'Events', id: eventsTabId,
            components: fbf(eventsTabId).stdEventHandlers([...FILE_EVENTS], DataTypes.file).toJson(),
          },
          {
            key: 'appearance', title: 'Appearance', id: appearanceTabId,
            components: fbf(appearanceTabId)
              .addPropertyRouter({
                id: styleRouterId, propertyName: 'propertyRouter1', componentName: 'propertyRouter', label: 'Property router1', labelAlign: 'right',
                propertyRouteName: removeStyleRouter === true
                  ? ''
                  : { _mode: 'code', _code: "    return contexts.canvasContext?.designerDevice || 'desktop';", _value: '' },
                components: [
                  ...fbf(styleRouterId)
                    // Font applies in every display type, but Align does not: in thumbnail mode the
                    // content is forced to centre, so the input would collect a value that never
                    // renders. Two variants of the panel, one with Align and one without, keep it
                    // visible only where it does something (matching releases/0.45).
                    .stdContainer((fb) => fb.stdFontPanel(undefined, 'font'), FILE_NAME_WITH_ALIGN_JS)
                    .stdContainer((fb) => fb.stdFontPanel(undefined, 'font', ['font.align']), NO_ALIGN_JS)
                    // The box styles describe the thumbnail tile, which only exists in thumbnail
                    // mode. In file-name mode the component is a plain file name and an upload
                    // button with no box to style, so these panels are hidden rather than left to
                    // collect values that never render.
                    .stdContainer((fb) => fb.stdDimensionsPanel('dimensions'), CUSTOM_THUMBNAIL_ONLY_JS)
                    .stdContainer((fb) => fb
                      .stdBorderPanel(removeStyleRouter !== true, 'border')
                      .stdBackgroundPanel(removeStyleRouter !== true, 'background')
                      .stdShadowPanel('shadow'),
                    THUMBNAIL_ONLY_JS)
                    // Spacing and the Custom style apply to the component as a whole, so they stay.
                    .stdMarginPaddingPanel('stylingBoxJson')
                    .stdCustomStylePanel(undefined, 'style')
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
