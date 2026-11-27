import { FormLayout } from 'antd/lib/form/Form';
import { SettingsFormMarkupFactory } from '@/interfaces';

/** Only the title itself: its font comes from the header (Header Style), not from the title. */
export const getSettings: SettingsFormMarkupFactory = ({ fbf }) => ({
  components: fbf('root')
    .addSettingsInput({ inputType: 'textField', propertyName: 'componentName', label: 'Component Name', size: 'small', validate: { required: true }, jsSetting: false })
    .addSettingsInputRow({ inputs: [
      { type: 'switch', propertyName: 'visible', label: 'Visible', size: 'small', jsSetting: true, permissionSettings: true },
    ] })
    .addSettingsInput({ inputType: 'textArea', propertyName: 'content', label: 'Title', size: 'small', jsSetting: true,
      description: 'The font is set in the Header Style of the card or panel.' })
    .toJson(),
  formSettings: {
    isSettingsForm: true,
    colon: false,
    layout: 'vertical' as FormLayout,
    labelCol: { span: 24 },
    wrapperCol: { span: 24 },
  },
});
