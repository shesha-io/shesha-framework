import { IButtonsProps } from './../components/formDesigner/components/button/buttonGroup/buttonsComponent/index';
import { IDropdownProps } from './../components/formDesigner/components/dropdown/models';
import { ITextAreaProps } from './../components/formDesigner/components/textArea/textArea';
import { ILabelValueEditorProps } from './../components/formDesigner/components/labelValueEditor/labelValueEditorComponent';
import { ITextFieldProps } from './../components/formDesigner/components/textField/textField';
import { IConfigurableFormComponent } from '.';
import { ISectionSeparatorProps } from '../components/sectionSeparator';
import { IIconPickerComponentProps } from '../components/formDesigner/components/iconPicker';
import { IAutocompleteProps } from '../components/formDesigner/components/autocomplete/autocomplete';
import { IEndpointsAutocompleteComponentProps } from '../components/formDesigner/components/endpointsAutocomplete/endpointsAutocomplete';
import { ICheckboxProps } from '../components/formDesigner/components/checkbox/checkbox';
import { INumberFieldProps } from '../components/formDesigner/components/numberField/models';
import { IQueryBuilderProps } from '../components/formDesigner/components/queryBuilder/queryBuilderComponent';
import { ICodeEditorComponentProps } from '../components/formDesigner/components/codeEditor';
import { IContainerComponentProps } from '../components/formDesigner/components/container/containerComponent';
import { ICustomFilterProps } from '../components/formDesigner/components/dataTable/filter/models';
import { IFormAutocompleteProps } from '../components/formDesigner/components/formAutocomplete';
import { IConfigurableActionNamesComponentProps } from '../components/formDesigner/components/configurableActionsConfigurator';
import { IEditableTagGroupProps } from '../components/formDesigner/components/editableTagGroup';
import { IColorPickerComponentProps } from '../components/formDesigner/components/colorPicker';
import { IColumnsEditorComponentProps } from '../components/formDesigner/components/dataTable/table/columnsEditor/columnsEditorComponent';
import { ICollapsiblePanelProps } from '../components/formDesigner/components/collapsiblePanel/collapsiblePanelComponent';
import { IPropertyAutocompleteComponentProps } from '../components/formDesigner/components/propertyAutocomplete';

interface ToolbarSettingsProp extends Omit<IConfigurableFormComponent, 'type'> {}

type DropdownType = ToolbarSettingsProp & Omit<IDropdownProps, 'type'>;

type SectionSeparatorType = ToolbarSettingsProp & Omit<ISectionSeparatorProps, 'type'>;

type TextFieldType = ToolbarSettingsProp & Omit<ITextFieldProps, 'type'>;

type PropertyAutocompleteType = ToolbarSettingsProp & Omit<IPropertyAutocompleteComponentProps, 'type'>;

type TextAreaType = ToolbarSettingsProp & Omit<ITextAreaProps, 'type'>;

type IconPickerType = ToolbarSettingsProp & Omit<IIconPickerComponentProps, 'type'>;

type AutocompleteType = ToolbarSettingsProp & Omit<IAutocompleteProps, 'type'>;

type EndpointsAutocompleteType = ToolbarSettingsProp & Omit<IEndpointsAutocompleteComponentProps, 'type'>;

type FormAutocompleteType = ToolbarSettingsProp & Omit<IFormAutocompleteProps, 'type'>;

type CheckboxType = ToolbarSettingsProp & Omit<ICheckboxProps, 'type'>;

type NumberFieldType = ToolbarSettingsProp & Omit<INumberFieldProps, 'type'>;

type LabelValueEditorType = ToolbarSettingsProp & Omit<ILabelValueEditorProps, 'type'>;

type QueryBuilderType = ToolbarSettingsProp & Omit<IQueryBuilderProps, 'type'>;

type CodeEditorType = ToolbarSettingsProp & Omit<ICodeEditorComponentProps, 'type'>;

type ContainerType = ToolbarSettingsProp & Omit<IContainerComponentProps, 'type'>;

type ButtonGroupType = ToolbarSettingsProp & Omit<IButtonsProps, 'type'>;

type CustomFilterType = ToolbarSettingsProp & Omit<ICustomFilterProps, 'type'>;

type ConfigurableActionConfiguratorType = ToolbarSettingsProp & Omit<IConfigurableActionNamesComponentProps, 'type'>;

type EditableTagGroupType = ToolbarSettingsProp & Omit<IEditableTagGroupProps, 'type'>;

type ColorPickerType = ToolbarSettingsProp & Omit<IColorPickerComponentProps, 'type'>;

type EntityPickerColumnsEditorType = ToolbarSettingsProp & Omit<IColumnsEditorComponentProps, 'type'>;

type ICollapsiblePanelPropsEditorType = ToolbarSettingsProp & Omit<ICollapsiblePanelProps, 'type'>;

export class DesignerToolbarSettings<T> {
  protected readonly form: IConfigurableFormComponent[];
  protected readonly data?: T;

  constructor();
  constructor(model: T);
  constructor(model?: T) {
    this.data = model;
    this.form = [];
  }

  public addButtons(props: ButtonGroupType | ((data: T) => ButtonGroupType)) {
    return this.addProperty(props, 'buttons');
  }

  public addCollapsiblePanel(
    props: ICollapsiblePanelPropsEditorType | ((data: T) => ICollapsiblePanelPropsEditorType)
  ) {
    return this.addProperty(props, 'collapsiblePanel');
  }

  public addDropdown(props: DropdownType | ((data: T) => DropdownType)) {
    return this.addProperty(props, 'dropdown');
  }

  public addEntityPickerColumnsEditor(
    props: EntityPickerColumnsEditorType | ((data: T) => EntityPickerColumnsEditorType)
  ) {
    return this.addProperty(props, 'entityPickerColumnsEditorComponent');
  }

  public addSectionSeparator(props: SectionSeparatorType | ((data: T) => SectionSeparatorType)) {
    return this.addProperty(props, 'sectionSeparator');
  }

  public addTextField(props: TextFieldType | ((data: T) => TextFieldType)) {
    return this.addProperty(props, 'textField');
  }

  public addPropertyAutocomplete(props: PropertyAutocompleteType | ((data: T) => PropertyAutocompleteType)) {
    return this.addProperty(props, 'propertyAutocomplete');
  }

  public addColorPicker(props: ColorPickerType | ((data: T) => PropertyAutocompleteType)) {
    return this.addProperty(props, 'colorPicker');
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
    return this.addProperty(props, 'formAutocomplete');
  }

  public addCheckbox(props: CheckboxType | ((data: T) => CheckboxType)) {
    return this.addProperty(props, 'checkbox');
  }

  public addCodeEditor(props: CodeEditorType | ((data: T) => CodeEditorType)) {
    return this.addProperty(props, 'codeEditor');
  }

  public addContainer(props: ContainerType | ((data: T) => ContainerType)) {
    return this.addProperty(props, 'container');
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

  public addCustomFilter(props: CustomFilterType | ((data: T) => CustomFilterType)) {
    return this.addProperty(props, 'filter');
  }

  public addConfigurableActionConfigurator(
    props: ConfigurableActionConfiguratorType | ((data: T) => ConfigurableActionConfiguratorType)
  ) {
    return this.addProperty(props, 'configurableActionConfigurator');
  }

  public addEditableTagGroupProps(props: EditableTagGroupType | ((data: T) => EditableTagGroupType)) {
    return this.addProperty(props, 'editableTagGroup');
  }

  private addProperty(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp), type: string) {
    const obj = typeof props !== 'function' ? props : props(this.data);

    this.form.push({ ...obj, type });

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
