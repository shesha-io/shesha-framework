import { IConfigurableFormComponent } from '.';
import { IAlertComponentProps } from '../components/formDesigner/components/alert/interfaces';
import { ICodeEditorComponentProps } from '../components/formDesigner/components/codeEditor/interfaces';
import { IColorPickerComponentProps } from '../components/formDesigner/components/colorPicker/interfaces';
import { IEditableTagGroupComponentProps } from '../components/formDesigner/components/editableTagGroup/interfaces';
import { IEndpointsAutocompleteComponentProps } from '../components/formDesigner/components/endpointsAutocomplete/interfaces';
import { IFormAutocompleteComponentProps } from '../components/formDesigner/components/formAutocomplete/interfaces';
import { IIconPickerComponentProps } from '../components/formDesigner/components/iconPicker/interfaces';
import { IPropertyAutocompleteComponentProps } from '../components/formDesigner/components/propertyAutocomplete/interfaces';
import { IReferenceListAutocompleteProps } from '../components/formDesigner/components/referenceListAutocomplete';
import { ISectionSeparatorComponentProps } from '../components/formDesigner/components/sectionSeprator/interfaces';
import { ISwitchComponentProps } from '../components/formDesigner/components/switch/interfaces';
import { IAutocompleteComponentProps } from '../designer-components/autocomplete/interfaces';
import { ICheckboxComponentProps } from '../designer-components/checkbox/interfaces';
import { ICollapsiblePanelComponentProps } from '../designer-components/collapsiblePanel/interfaces';
import { IConfigurableActionConfiguratorComponentProps } from '../designer-components/configurableActionsConfigurator/interfaces';
import { IContainerComponentProps } from '../designer-components/container/interfaces';
import { ICustomFilterComponentProps } from '../designer-components/dataTable/filter/interfaces';
import { IColumnsEditorComponentProps } from '../designer-components/dataTable/table/columnsEditor/interfaces';
import { IDropdownComponentProps } from '../designer-components/dropdown/interfaces';
import { INumberFieldComponentProps } from '../designer-components/numberField/interfaces';
import { IQueryBuilderComponentProps } from '../designer-components/queryBuilder/interfaces';
import { ITextFieldComponentProps } from '../designer-components/textField/interfaces';
import { IButtonsProps } from './../components/formDesigner/components/button/buttonGroup/buttonsComponent/interfaces';
import { ILabelValueEditorComponentProps } from './../components/formDesigner/components/labelValueEditor/interfaces';
import { ITextAreaComponentProps } from './../components/formDesigner/components/textArea/interfaces';

interface ToolbarSettingsProp extends Omit<IConfigurableFormComponent, 'type'> {}

type DropdownType = ToolbarSettingsProp & Omit<IDropdownComponentProps, 'type'>;

type SectionSeparatorType = ToolbarSettingsProp & Omit<ISectionSeparatorComponentProps, 'type'>;

type TextFieldType = ToolbarSettingsProp & Omit<ITextFieldComponentProps, 'type'>;

type PropertyAutocompleteType = ToolbarSettingsProp & Omit<IPropertyAutocompleteComponentProps, 'type'>;

type TextAreaType = ToolbarSettingsProp & Omit<ITextAreaComponentProps, 'type'>;

type IconPickerType = ToolbarSettingsProp & Omit<IIconPickerComponentProps, 'type'>;

type AutocompleteType = ToolbarSettingsProp & Omit<IAutocompleteComponentProps, 'type'>;

type EndpointsAutocompleteType = ToolbarSettingsProp & Omit<IEndpointsAutocompleteComponentProps, 'type'>;

type FormAutocompleteType = ToolbarSettingsProp & Omit<IFormAutocompleteComponentProps, 'type'>;

type ReferenceListAutocompleteType = ToolbarSettingsProp & Omit<IReferenceListAutocompleteProps, 'type'>;

type CheckboxType = ToolbarSettingsProp & Omit<ICheckboxComponentProps, 'type'>;

type SwitchType = ToolbarSettingsProp & Omit<ISwitchComponentProps, 'type'>;

type NumberFieldType = ToolbarSettingsProp & Omit<INumberFieldComponentProps, 'type'>;

type LabelValueEditorType = ToolbarSettingsProp & Omit<ILabelValueEditorComponentProps, 'type'>;

type QueryBuilderType = ToolbarSettingsProp & Omit<IQueryBuilderComponentProps, 'type'>;

type CodeEditorType = ToolbarSettingsProp & Omit<ICodeEditorComponentProps, 'type'>;

type ContainerType = ToolbarSettingsProp & Omit<IContainerComponentProps, 'type'>;

type ButtonGroupType = ToolbarSettingsProp & Omit<IButtonsProps, 'type'>;

type CustomFilterType = ToolbarSettingsProp & Omit<ICustomFilterComponentProps, 'type'>;

type ConfigurableActionConfiguratorType = ToolbarSettingsProp &
  Omit<IConfigurableActionConfiguratorComponentProps, 'type'>;

type EditableTagGroupType = ToolbarSettingsProp & Omit<IEditableTagGroupComponentProps, 'type'>;

type ColorPickerType = ToolbarSettingsProp & Omit<IColorPickerComponentProps, 'type'>;

type EntityPickerColumnsEditorType = ToolbarSettingsProp & Omit<IColumnsEditorComponentProps, 'type'>;

type ICollapsiblePanelPropsEditorType = ToolbarSettingsProp & Omit<ICollapsiblePanelComponentProps, 'type'>;

type AlertType = ToolbarSettingsProp & Omit<IAlertComponentProps, 'type'>;

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

  public addRefListAutocomplete(props: ReferenceListAutocompleteType | ((data: T) => ReferenceListAutocompleteType)) {
    return this.addProperty(props, 'referenceListAutocomplete');
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

    this.form.push({ ...obj, type, version: 'latest' });

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
