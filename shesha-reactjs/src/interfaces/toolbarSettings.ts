import { IConfigurableFormComponent, IPropertySetting } from '.';
import { IAlertComponentProps } from '@/designer-components/alert/interfaces';
import { ICodeEditorComponentProps } from '@/designer-components/codeEditor/interfaces';
import { IColorPickerComponentProps } from '@/designer-components/colorPicker/interfaces';
import { IEditableTagGroupComponentProps } from '@/designer-components/editableTagGroup/interfaces';
import { IEndpointsAutocompleteComponentProps } from '@/designer-components/endpointsAutocomplete/interfaces';
import { IFormAutocompleteComponentProps } from '@/designer-components/formAutocomplete/interfaces';
import { IIconPickerComponentProps } from '@/designer-components/iconPicker/interfaces';
import { IPropertyAutocompleteComponentProps } from '@/designer-components/propertyAutocomplete/interfaces';
import { IReferenceListAutocompleteProps } from '@/designer-components/referenceListAutocomplete';
import { ISectionSeparatorComponentProps } from '@/designer-components/sectionSeprator/interfaces';
import { ISwitchComponentProps } from '@/designer-components/switch/interfaces';
import { IAutocompleteComponentProps } from '@/designer-components/autocomplete/interfaces';
import { ICheckboxComponentProps } from '@/designer-components/checkbox/interfaces';
import { ICollapsiblePanelComponentProps } from '@/designer-components/collapsiblePanel/interfaces';
import { IConfigurableActionConfiguratorComponentProps } from '@/designer-components/configurableActionsConfigurator/interfaces';
import { IContainerComponentProps } from '@/designer-components/container/interfaces';
import { IColumnsEditorComponentProps } from '@/designer-components/dataTable/table/columnsEditor/interfaces';
import { IDropdownComponentProps } from '@/designer-components/dropdown/model';
import { INumberFieldComponentProps } from '@/designer-components/numberField/interfaces';
import { IQueryBuilderComponentProps } from '@/designer-components/queryBuilder/interfaces';
import { ITextFieldComponentProps } from '@/designer-components/textField/interfaces';
import { IButtonsProps } from '@/designer-components/button/buttonGroup/buttonsComponent/interfaces';
import { ILabelValueEditorComponentProps } from '@/designer-components/labelValueEditor/interfaces';
import { IContextPropertyAutocompleteComponentProps } from '@/designer-components/contextPropertyAutocomplete';
import { ITextAreaComponentProps } from '@/designer-components/textArea/interfaces';
import { IRadioProps } from '@/designer-components/radio/utils';
import { IReadOnlyModeSelectorProps } from '@/components/editModeSelector/index';
import { IStyleBoxComponentProps } from '@/designer-components/styleBox/interfaces';
import { IPermissionAutocompleteComponentProps } from '@/designer-components/permissions/permissionAutocomplete';
import { ISliderComponentProps } from '@/designer-components/slider/interfaces';
import { ILabelComponentProps } from '@/designer-components/styleLabel/interfaces';
import { ITabsComponentProps } from '@/designer-components/tabs/models';
import { ISettingsInputRowProps } from '@/designer-components/settingsInputRow';
import { IPropertyRouterProps } from '@/designer-components/propertyRouter/interfaces';
import { IRadioOption, ISettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import { IImageFieldProps } from '@/designer-components/image/image';

interface ToolbarSettingsProp extends Omit<IConfigurableFormComponent, 'hidden' | 'type'> {
  hidden?: boolean | IPropertySetting;
  jsSetting?: boolean;
  labelAlignOptions?: IRadioOption[];
}

type DropdownType = ToolbarSettingsProp & Omit<IDropdownComponentProps, 'hidden' | 'type'>;

type SectionSeparatorType = ToolbarSettingsProp & Omit<ISectionSeparatorComponentProps, 'hidden' | 'type'>;

type TextFieldType = ToolbarSettingsProp & Omit<ITextFieldComponentProps, 'hidden' | 'type'>;

type ContextPropertyAutocompleteType = ToolbarSettingsProp &
  Omit<IContextPropertyAutocompleteComponentProps, 'hidden' | 'type'>;

type PropertyAutocompleteType = ToolbarSettingsProp & Omit<IPropertyAutocompleteComponentProps, 'hidden' | 'type'>;

type ImagePickerType = ToolbarSettingsProp & Omit<IImageFieldProps, 'hidden' | 'type'>;

type TextAreaType = ToolbarSettingsProp & Omit<ITextAreaComponentProps, 'hidden' | 'type'>;

type IconPickerType = ToolbarSettingsProp & Omit<IIconPickerComponentProps, 'hidden' | 'type'>;

type AutocompleteType = ToolbarSettingsProp & Omit<IAutocompleteComponentProps, 'hidden' | 'type'>;

type EndpointsAutocompleteType = ToolbarSettingsProp & Omit<IEndpointsAutocompleteComponentProps, 'hidden' | 'type'>;

type FormAutocompleteType = ToolbarSettingsProp & Omit<IFormAutocompleteComponentProps, 'hidden' | 'type'>;

type ReferenceListAutocompleteType = ToolbarSettingsProp & Omit<IReferenceListAutocompleteProps, 'hidden' | 'type'>;

type CheckboxType = ToolbarSettingsProp & Omit<ICheckboxComponentProps, 'hidden' | 'type'>;

type SwitchType = ToolbarSettingsProp & Omit<ISwitchComponentProps, 'hidden' | 'type'>;

type NumberFieldType = ToolbarSettingsProp & Omit<INumberFieldComponentProps, 'hidden' | 'type'>;

type LabelValueEditorType = ToolbarSettingsProp & Omit<ILabelValueEditorComponentProps, 'hidden' | 'type'>;

type QueryBuilderType = ToolbarSettingsProp & Omit<IQueryBuilderComponentProps, 'hidden' | 'type'>;

type CodeEditorType = ToolbarSettingsProp & Omit<ICodeEditorComponentProps, 'hidden' | 'type'>;

type ContainerType = ToolbarSettingsProp & Omit<IContainerComponentProps, 'hidden' | 'type'>;

type ButtonGroupType = ToolbarSettingsProp & Omit<IButtonsProps, 'hidden' | 'type'>;

type ConfigurableActionConfiguratorType = ToolbarSettingsProp &
  Omit<IConfigurableActionConfiguratorComponentProps, 'hidden' | 'type'>;

type EditableTagGroupType = ToolbarSettingsProp & Omit<IEditableTagGroupComponentProps, 'hidden' | 'type'>;

type PermissionAutocompleteType = ToolbarSettingsProp & Omit<IPermissionAutocompleteComponentProps, 'hidden' | 'type'>;

type ColorPickerType = ToolbarSettingsProp & Omit<IColorPickerComponentProps, 'hidden' | 'type'>;

type ColumnsEditorType = ToolbarSettingsProp & Omit<IColumnsEditorComponentProps, 'hidden' | 'type'>;

type ICollapsiblePanelPropsEditorType = ToolbarSettingsProp & Omit<ICollapsiblePanelComponentProps, 'hidden' | 'type'>;

type ITabsComponentPropsType = ToolbarSettingsProp & Omit<ITabsComponentProps, 'hidden' | 'type'>;
type AlertType = ToolbarSettingsProp & Omit<IAlertComponentProps, 'hidden' | 'type'>;

type RadioType = ToolbarSettingsProp & Omit<IRadioProps, 'hidden' | 'type'>;

type ReadOnlyModeType = ToolbarSettingsProp & Omit<IReadOnlyModeSelectorProps, 'hidden' | 'type'>;

type StyleBoxType = ToolbarSettingsProp & Omit<IStyleBoxComponentProps, 'hidden' | 'type'>;

type LabelStyleType = ToolbarSettingsProp & Omit<ILabelComponentProps, 'hidden' | 'type'>;

type SliderType = ToolbarSettingsProp & Omit<ISliderComponentProps, 'hidden' | 'type'>;

type SettingInputType = ToolbarSettingsProp & Omit<ISettingsInputProps, 'hidden' | 'type'>;

type SettingInputRowType = ToolbarSettingsProp & Omit<ISettingsInputRowProps, 'hidden' | 'type'>;

type PropertyRouterType = ToolbarSettingsProp & Omit<IPropertyRouterProps, 'hidden' | 'type'>;

export class DesignerToolbarSettings<T> {
  protected readonly form: IConfigurableFormComponent[];
  protected readonly data?: T;

  constructor();
  constructor(model: T);
  constructor(model?: T) {
    this.data = model;
    this.form = [];
  }

  public addAlert(props: AlertType | ((data: T) => AlertType)) {
    return this.addProperty(props, 'alert');
  }

  public addButtons(props: ButtonGroupType | ((data: T) => ButtonGroupType)) {
    return this.addProperty(props, 'buttons');
  }

  public addCollapsiblePanel(
    props: ICollapsiblePanelPropsEditorType | ((data: T) => ICollapsiblePanelPropsEditorType)
  ) {
    const obj = typeof props !== 'function' ? props : props(this.data);
    obj.isDynamic = obj.isDynamic === undefined ? true : obj.isDynamic;
    return this.addProperty(obj, 'collapsiblePanel');
  }

  public addSearchableTabs(props: ITabsComponentPropsType | ((data: T) => ITabsComponentPropsType)) {
    return this.addProperty(props, 'searchableTabs');
  }

  public addDropdown(props: DropdownType | ((data: T) => DropdownType)) {
    return this.addProperty(props, 'dropdown');
  }

  public addColumnsEditor(props: ColumnsEditorType | ((data: T) => ColumnsEditorType)) {
    return this.addProperty(props, 'columnsEditorComponent');
  }

  public addSectionSeparator(props: SectionSeparatorType | ((data: T) => SectionSeparatorType)) {
    return this.addProperty(props, 'sectionSeparator');
  }

  public addTextField(props: TextFieldType | ((data: T) => TextFieldType)) {
    return this.addProperty(props, 'textField');
  }

  public addContextPropertyAutocomplete(
    props: ContextPropertyAutocompleteType | ((data: T) => ContextPropertyAutocompleteType)
  ) {
    return this.addProperty(props, 'contextPropertyAutocomplete');
  }

  public addPropertyAutocomplete(props: PropertyAutocompleteType | ((data: T) => PropertyAutocompleteType)) {
    return this.addProperty(props, 'propertyAutocomplete');
  }

  public addColorPicker(props: ColorPickerType | ((data: T) => PropertyAutocompleteType)) {
    return this.addProperty(props, 'colorPicker');
  }

  public addImagePicker(props: ImagePickerType | ((data: T) => ImagePickerType)) {
    return this.addProperty(props, 'imagePicker');
  }

  public addTextArea(props: TextAreaType | ((data: T) => TextAreaType)) {
    return this.addProperty(props, 'textArea');
  }

  public addIconPicker(props: IconPickerType | ((data: T) => IconPickerType)) {
    return this.addProperty(props, 'iconPicker');
  }

  public addAutocomplete(props: AutocompleteType | ((data: T) => AutocompleteType)) {
    return this.addProperty(props, 'autocomplete');
  }

  public addEndpointsAutocomplete(props: EndpointsAutocompleteType | ((data: T) => EndpointsAutocompleteType)) {
    return this.addProperty(props, 'endpointsAutocomplete');
  }

  public addFormAutocomplete(props: FormAutocompleteType | ((data: T) => FormAutocompleteType)) {
    const model = typeof props !== 'function'
      ? props
      : props(this.data);
    return this.addProperty({ ...model, version: 2 }, 'formAutocomplete');
  }

  public addRefListAutocomplete(props: ReferenceListAutocompleteType | ((data: T) => ReferenceListAutocompleteType)) {
    const model = typeof props !== 'function'
      ? props
      : props(this.data);
    return this.addProperty({ ...model, version: 2 }, 'referenceListAutocomplete');
  }

  public addCheckbox(props: CheckboxType | ((data: T) => CheckboxType)) {
    return this.addProperty(props, 'checkbox');
  }

  public addSwitch(props: SwitchType | ((data: T) => SwitchType)) {
    return this.addProperty(props, 'switch');
  }

  public addCodeEditor(props: CodeEditorType | ((data: T) => CodeEditorType)) {
    return this.addProperty(props, 'codeEditor');
  }

  public addContainer(props: ContainerType | ((data: T) => ContainerType)) {
    const obj = typeof props !== 'function' ? props : props(this.data);
    obj.isDynamic = obj.isDynamic === undefined ? true : obj.isDynamic;
    return this.addProperty(obj, 'container');
  }

  public addNumberField(props: NumberFieldType | ((data: T) => NumberFieldType)) {
    return this.addProperty(props, 'numberField');
  }

  public addLabelValueEditor(props: LabelValueEditorType | ((data: T) => LabelValueEditorType)) {
    return this.addProperty(props, 'labelValueEditor');
  }

  public addQueryBuilder(props: QueryBuilderType | ((data: T) => QueryBuilderType)) {
    return this.addProperty(props, 'queryBuilder');
  }

  public addRadio(props: RadioType | ((data: T) => RadioType)) {
    return this.addProperty(props, 'radio');
  }

  public addConfigurableActionConfigurator(
    props: ConfigurableActionConfiguratorType | ((data: T) => ConfigurableActionConfiguratorType)
  ) {
    return this.addProperty(props, 'configurableActionConfigurator');
  }

  public addEditableTagGroupProps(props: EditableTagGroupType | ((data: T) => EditableTagGroupType)) {
    return this.addProperty(props, 'editableTagGroup');
  }

  public addPermissionAutocomplete(props: PermissionAutocompleteType | ((data: T) => PermissionAutocompleteType)) {
    return this.addProperty(props, 'permissionAutocomplete');
  }

  public addEditMode(props: ReadOnlyModeType | ((data: T) => ReadOnlyModeType)) {
    return this.addProperty(props, 'editModeSelector');
  }

  public addStyleBox(props: StyleBoxType | ((data: T) => StyleBoxType)) {
    return this.addProperty(props, 'styleBox');
  }

  public addLabelConfigurator(props: LabelStyleType | ((data: T) => LabelStyleType)) {
    return this.addProperty(props, 'labelConfigurator');
  }

  public addSlider(props: SliderType | ((data: T) => SliderType)) {
    return this.addProperty(props, 'slider');
  }

  public addSettingsInput(props: SettingInputType | ((data: T) => SettingInputType)) {
    return this.addProperty(props, 'settingsInput');
  }

  public addSettingsInputRow(props: SettingInputRowType | ((data: T) => SettingInputRowType)) {
    return this.addProperty(props, 'settingsInputRow');
  }

  public addPropertyRouter(props: PropertyRouterType | ((data: T) => PropertyRouterType)) {
    const obj = typeof props !== 'function' ? props : props(this.data);
    obj.isDynamic = obj.isDynamic === undefined ? true : obj.isDynamic;
    return this.addProperty(obj, 'propertyRouter');
  }

  private addProperty(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp), type: string) {
    const obj = typeof props !== 'function' ? props : props(this.data);

    this.form.push({
      ...obj,
      type,
      hidden: obj?.hidden as any,
      version: typeof (obj?.version) === 'number'
        ? obj?.version
        : 'latest'
    });

    return this;
  }

  get settings() {
    return this.form;
  }

  get model() {
    return this.model;
  }

  public toJson() {
    return this.form;
  }

  public toJsonString() {
    return JSON?.stringify(this.form);
  }
}
