import { IAlertComponentProps } from "@/designer-components/alert/interfaces";
import { IAutocompleteComponentProps } from "@/designer-components/autocomplete/interfaces";
import { IButtonsProps } from "@/designer-components/button/buttonGroup/buttonsComponent/interfaces";
import { ICheckboxComponentProps } from "@/designer-components/checkbox/interfaces";
import { ICodeEditorComponentProps } from "@/designer-components/codeEditor/interfaces";
import { ICollapsiblePanelComponentProps } from "@/designer-components/collapsiblePanel/interfaces";
import { IColorPickerComponentProps } from "@/designer-components/colorPicker/interfaces";
import { IColumnsComponentProps } from "@/designer-components/columns/interfaces";
import { IConfigurableActionConfiguratorComponentProps } from "@/designer-components/configurableActionsConfigurator/interfaces";
import { IEntityTypeAutocompleteComponentProps } from "@/designer-components/configurableItemAutocomplete/entityTypeAutocomplete/interfaces";
import { IContextPropertyAutocompleteComponentProps } from "@/designer-components/contextPropertyAutocomplete/interfaces";
import { IPagerComponentProps } from "@/designer-components/dataTable/pager/interfaces";
import { IQuickSearchComponentProps } from "@/designer-components/dataTable/quickSearch/interfaces";
import { IColumnsEditorComponentProps } from "@/designer-components/dataTable/table/columnsEditor/interfaces";
import { ITableComponentProps } from "@/designer-components/dataTable/table/models";
import { ITableContextComponentProps } from "@/designer-components/dataTable/tableContext/models";
import { ITableViewSelectorComponentProps } from "@/designer-components/dataTable/tableViewSelector/models";
import { IDateFieldProps } from "@/designer-components/dateField/interfaces";
import { IDropdownComponentProps } from "@/designer-components/dropdown/model";
import { IEditableTagGroupComponentProps } from "@/designer-components/editableTagGroup/interfaces";
import { IEndpointsAutocompleteComponentProps } from "@/designer-components/endpointsAutocomplete/interfaces";
import { IFileUploadProps } from "@/designer-components/fileUpload/interfaces";
import { IIconPickerComponentProps } from "@/designer-components/iconPicker/interfaces";
import { IKeyInformationBarProps } from "@/designer-components/keyInformationBar/interfaces";
import { ILabelValueEditorComponentProps } from "@/designer-components/labelValueEditor/interfaces";
import { ILinkProps } from "@/designer-components/link/interfaces";
import { INumberFieldComponentProps } from "@/designer-components/numberField/interfaces";
import { IPropertiesTabsComponentProps } from "@/designer-components/propertiesTabs/models";
import { IPropertyAutocompleteComponentProps } from "@/designer-components/propertyAutocomplete/interfaces";
import { IPropertyRouterComponent } from "@/designer-components/propertyRouter/interfaces";
import { IQueryBuilderComponentProps } from "@/designer-components/queryBuilder/interfaces";
import { IEnhancedRadioProps } from "@/designer-components/radio/interfaces";
import { ISectionSeparatorComponentProps } from "@/designer-components/sectionSeprator/interfaces";
import { SettingsInputComponentProps } from "@/designer-components/settingsInput/interfaces";
import { ISettingsInputRowProps } from "@/designer-components/settingsInputRow/interfaces";
import { ISliderComponentProps } from "@/designer-components/slider/interfaces";
import { IStyleBoxComponentProps } from "@/designer-components/styleBox/interfaces";
import { ILabelComponentProps } from "@/designer-components/styleLabel/interfaces";
import { ISwitchComponentProps } from "@/designer-components/switch/interfaces";
import { ITabsComponentProps } from "@/designer-components/tabs/models";
import { ITextTypographyProps } from "@/designer-components/text/models";
import { ITextAreaComponentProps } from "@/designer-components/textArea/interfaces";
import { ITextFieldComponentProps } from "@/designer-components/textField/interfaces";
import { ITimePickerComponentProps } from "@/designer-components/timeField/models";
import { DEFAULT_FORM_SETTINGS, IConfigurableFormComponent, IContainerComponentProps, IPropertyMetadata, IToolboxComponent } from "@/interfaces";
import { ComponentTypes, FluentSettings, FormBuilder, FormBuilderFactory } from "./interfaces";
import { nanoid } from "@/utils/uuid";
import { linkComponentToModelMetadata, upgradeComponent } from "@/providers/form/utils";
import { getComponentDefinitions } from "@/providers/form/defaults/toolboxComponents";

export class FormBuilderImplementation implements FormBuilder {
  addKeyInformationBar = (props: FluentSettings<IKeyInformationBarProps>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'KeyInformationBar', meta);

  addEditModeSelector = (props: FluentSettings<IConfigurableFormComponent>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'editModeSelector', meta);

  addSettingsInput = (props: FluentSettings<SettingsInputComponentProps>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'settingsInput', meta);

  addTabs = (props: FluentSettings<ITabsComponentProps>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'tabs', meta);

  addDateField = (props: FluentSettings<IDateFieldProps>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'dateField', meta);

  addDropdown = (props: FluentSettings<IDropdownComponentProps>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'dropdown', meta);

  addEditableTagGroup = (props: FluentSettings<IEditableTagGroupComponentProps>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'editableTagGroup', meta);

  addEndpointsAutocomplete = (props: FluentSettings<IEndpointsAutocompleteComponentProps>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'endpointsAutocomplete', meta);

  addFileUpload = (props: FluentSettings<IFileUploadProps>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'fileUpload', meta);

  addFormAutocomplete = (props: FluentSettings<IConfigurableFormComponent>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'formAutocomplete', meta);

  addIconPicker = (props: FluentSettings<IIconPickerComponentProps>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'iconPicker', meta);

  addLabelValueEditor = (props: FluentSettings<ILabelValueEditorComponentProps>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'labelValueEditor', meta);

  addNumberField = (props: FluentSettings<INumberFieldComponentProps>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'numberField', meta);

  addPermissionAutocomplete = (props: FluentSettings<IConfigurableFormComponent>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'permissionAutocomplete', meta);

  addPropertyAutocomplete = (props: FluentSettings<IPropertyAutocompleteComponentProps>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'propertyAutocomplete', meta);

  addPropertyRouter = (props: FluentSettings<IPropertyRouterComponent>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'propertyRouter', meta);

  addQueryBuilder = (props: FluentSettings<IQueryBuilderComponentProps>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'queryBuilder', meta);

  addRadio = (props: FluentSettings<IEnhancedRadioProps>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'radio', meta);

  addReferenceListAutocomplete = (props: FluentSettings<IConfigurableFormComponent>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'referenceListAutocomplete', meta);

  addSectionSeparator = (props: FluentSettings<ISectionSeparatorComponentProps>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'sectionSeparator', meta);

  addSwitch = (props: FluentSettings<ISwitchComponentProps>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'switch', meta);

  addTextField = (props: FluentSettings<ITextFieldComponentProps>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'textField', meta);

  addTextArea = (props: FluentSettings<ITextAreaComponentProps>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'textArea', meta);

  addLink = (props: FluentSettings<ILinkProps>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'link', meta);

  addSettingsInputRow = (props: FluentSettings<ISettingsInputRowProps & IConfigurableFormComponent>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'settingsInputRow', meta);

  addSlider = (props: FluentSettings<ISliderComponentProps>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'slider', meta);

  addStyleBox = (props: FluentSettings<IStyleBoxComponentProps>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'styleBox', meta);

  addLabelConfigurator = (props: FluentSettings<ILabelComponentProps>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'labelConfigurator', meta);

  addText = (props: FluentSettings<ITextTypographyProps>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'text', meta);

  addTimePicker = (props: FluentSettings<ITimePickerComponentProps>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'timePicker', meta);

  addSearchableTabs = (props: FluentSettings<IPropertiesTabsComponentProps>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'searchableTabs', meta);

  addAlert = (props: FluentSettings<IAlertComponentProps>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'alert', meta);

  addAutocomplete = (props: FluentSettings<IAutocompleteComponentProps>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'autocomplete', meta);

  addButtons = (props: FluentSettings<IButtonsProps>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'buttons', meta);

  addCheckbox = (props: FluentSettings<ICheckboxComponentProps>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'checkbox', meta);

  addCodeEditor = (props: FluentSettings<ICodeEditorComponentProps>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'codeEditor', meta);

  addColorPicker = (props: FluentSettings<IColorPickerComponentProps>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'colorPicker', meta);

  addColumns = (props: FluentSettings<IColumnsComponentProps>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'columns', meta);

  addConfigurableActionConfigurator = (props: FluentSettings<IConfigurableActionConfiguratorComponentProps>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'configurableActionConfigurator', meta);

  addEntityTypeAutocomplete = (props: FluentSettings<IEntityTypeAutocompleteComponentProps>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'entityTypeAutocomplete', meta);

  addContainer = (props: FluentSettings<IContainerComponentProps>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'container', meta);

  addContextPropertyAutocomplete = (props: FluentSettings<IContextPropertyAutocompleteComponentProps>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'contextPropertyAutocomplete', meta);

  addDatatablePager = (props: FluentSettings<IPagerComponentProps>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'datatable.pager', meta);

  addDatatableQuickSearch = (props: FluentSettings<IQuickSearchComponentProps>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'datatable.quickSearch', meta);

  addDatatable = (props: FluentSettings<ITableComponentProps>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'datatable', meta);

  addColumnsEditorComponent = (props: FluentSettings<IColumnsEditorComponentProps>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'columnsEditorComponent', meta);

  /**
   *
   * @deprecated use `addDataContext` instead
   */
  addDatatableContext = (props: FluentSettings<ITableContextComponentProps>): FormBuilder => this.addProperty(props, 'datatableContext');

  addDataContext = (props: FluentSettings<ITableContextComponentProps>): FormBuilder => this.addProperty(props, 'dataContext');

  addTableViewSelector = (props: FluentSettings<ITableViewSelectorComponentProps>, meta?: IPropertyMetadata): FormBuilder => this.addProperty(props, 'tableViewSelector', meta);

  addCollapsiblePanel = (props: FluentSettings<ICollapsiblePanelComponentProps>, meta?: IPropertyMetadata): FormBuilder => {
    const fixedProps = {
      ...props,
      isDynamic: props.isDynamic === undefined ? true : props.isDynamic,
      header: props.header ?? {
        id: nanoid(),
        components: [],
      },
    };

    return this.addProperty(fixedProps, 'collapsiblePanel', meta);
  };

  protected readonly form: IConfigurableFormComponent[];

  private componentDefinitions: Map<string, IToolboxComponent> | undefined;

  private getComponentDefinition = (type: string): IToolboxComponent | undefined => {
    return this.componentDefinitions?.get(type);
  };

  constructor(componentDefinitions?: Map<string, IToolboxComponent>) {
    this.componentDefinitions = componentDefinitions;
    this.form = [];
  }

  protected addProperty(props: FluentSettings<IConfigurableFormComponent>, type: ComponentTypes, meta?: IPropertyMetadata): FormBuilder {
    const { id, hidden, version, ...restProps } = props;

    const componentDefinition = this.getComponentDefinition(type);

    let formComponent: IConfigurableFormComponent = {
      ...restProps, // use restProps for correct migrations (migrations can initialise some properties depends on other properties)
      id: id ?? nanoid(),
      type,
      version: typeof (version) === 'number'
        ? version
        : undefined,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      hidden: hidden as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      // TODO: review types and remove `any`
    };
    if (componentDefinition) {
      if (componentDefinition.initModel) formComponent = componentDefinition.initModel(formComponent);

      if (componentDefinition.migrator) {
        formComponent = upgradeComponent(formComponent, componentDefinition, DEFAULT_FORM_SETTINGS, {
          allComponents: {},
          componentRelations: {},
        }, true);
      }
    } else
      formComponent.version = "latest";

    formComponent = { ...formComponent, ...restProps };

    if (meta && componentDefinition)
      formComponent = linkComponentToModelMetadata(componentDefinition, formComponent, meta);

    this.form.push(formComponent);

    return this;
  }

  toJson(): IConfigurableFormComponent[] {
    return this.form;
  }

  build(): string {
    return JSON.stringify(this.form);
  }
};

export const makeFormBuliderFactory: () => FormBuilderFactory = () => {
  const components = getComponentDefinitions();
  return () => new FormBuilderImplementation(components);
};
