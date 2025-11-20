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
import { DEFAULT_FORM_SETTINGS, IConfigurableFormComponent, IContainerComponentProps, IToolboxComponent } from "@/interfaces";
import { ComponentTypes, FluentSettings, FormBuilder, FormBuilderFactory } from "./interfaces";
import { nanoid } from "@/utils/uuid";
import { upgradeComponent } from "@/providers/form/utils";
import { getComponentDefinitions } from "@/providers/form/defaults/toolboxComponents";

export class FormBuilderImplementation implements FormBuilder {
  addKeyInformationBar = (props: FluentSettings<IKeyInformationBarProps>): FormBuilder => this.addProperty(props, 'KeyInformationBar');

  addEditModeSelector = (props: FluentSettings<IConfigurableFormComponent>): FormBuilder => this.addProperty(props, 'editModeSelector');

  addSettingsInput = (props: FluentSettings<SettingsInputComponentProps>): FormBuilder => this.addProperty(props, 'settingsInput');

  addTabs = (props: FluentSettings<ITabsComponentProps>): FormBuilder => this.addProperty(props, 'tabs');

  addDateField = (props: FluentSettings<IDateFieldProps>): FormBuilder => this.addProperty(props, 'dateField');

  addDropdown = (props: FluentSettings<IDropdownComponentProps>): FormBuilder => this.addProperty(props, 'dropdown');

  addEditableTagGroup = (props: FluentSettings<IEditableTagGroupComponentProps>): FormBuilder => this.addProperty(props, 'editableTagGroup');

  addEndpointsAutocomplete = (props: FluentSettings<IEndpointsAutocompleteComponentProps>): FormBuilder => this.addProperty(props, 'endpointsAutocomplete');

  addFileUpload = (props: FluentSettings<IFileUploadProps>): FormBuilder => this.addProperty(props, 'fileUpload');

  addFormAutocomplete = (props: FluentSettings<IConfigurableFormComponent>): FormBuilder => this.addProperty(props, 'formAutocomplete');

  addIconPicker = (props: FluentSettings<IIconPickerComponentProps>): FormBuilder => this.addProperty(props, 'iconPicker');

  addLabelValueEditor = (props: FluentSettings<ILabelValueEditorComponentProps>): FormBuilder => this.addProperty(props, 'labelValueEditor');

  addNumberField = (props: FluentSettings<INumberFieldComponentProps>): FormBuilder => this.addProperty(props, 'numberField');

  addPermissionAutocomplete = (props: FluentSettings<IConfigurableFormComponent>): FormBuilder => this.addProperty(props, 'permissionAutocomplete');

  addPropertyAutocomplete = (props: FluentSettings<IPropertyAutocompleteComponentProps>): FormBuilder => this.addProperty(props, 'propertyAutocomplete');

  addPropertyRouter = (props: FluentSettings<IPropertyRouterComponent>): FormBuilder => this.addProperty(props, 'propertyRouter');

  addQueryBuilder = (props: FluentSettings<IQueryBuilderComponentProps>): FormBuilder => this.addProperty(props, 'queryBuilder');

  addRadio = (props: FluentSettings<IEnhancedRadioProps>): FormBuilder => this.addProperty(props, 'radio');

  addReferenceListAutocomplete = (props: FluentSettings<IConfigurableFormComponent>): FormBuilder => this.addProperty(props, 'referenceListAutocomplete');

  addSectionSeparator = (props: FluentSettings<ISectionSeparatorComponentProps>): FormBuilder => this.addProperty(props, 'sectionSeparator');

  addSwitch = (props: FluentSettings<ISwitchComponentProps>): FormBuilder => this.addProperty(props, 'switch');

  addTextField = (props: FluentSettings<ITextFieldComponentProps>): FormBuilder => this.addProperty(props, 'textField');

  addTextArea = (props: FluentSettings<ITextAreaComponentProps>): FormBuilder => this.addProperty(props, 'textArea');

  addLink = (props: FluentSettings<ILinkProps>): FormBuilder => this.addProperty(props, 'link');

  addSettingsInputRow = (props: FluentSettings<ISettingsInputRowProps & IConfigurableFormComponent>): FormBuilder => this.addProperty(props, 'settingsInputRow');

  addSlider = (props: FluentSettings<ISliderComponentProps>): FormBuilder => this.addProperty(props, 'slider');

  addStyleBox = (props: FluentSettings<IStyleBoxComponentProps>): FormBuilder => this.addProperty(props, 'styleBox');

  addLabelConfigurator = (props: FluentSettings<ILabelComponentProps>): FormBuilder => this.addProperty(props, 'labelConfigurator');

  addText = (props: FluentSettings<ITextTypographyProps>): FormBuilder => this.addProperty(props, 'text');

  addTimePicker = (props: FluentSettings<ITimePickerComponentProps>): FormBuilder => this.addProperty(props, 'timePicker');

  addSearchableTabs = (props: FluentSettings<IPropertiesTabsComponentProps>): FormBuilder => this.addProperty(props, 'searchableTabs');

  addAlert = (props: FluentSettings<IAlertComponentProps>): FormBuilder => this.addProperty(props, 'alert');

  addAutocomplete = (props: FluentSettings<IAutocompleteComponentProps>): FormBuilder => this.addProperty(props, 'autocomplete');

  addButtons = (props: FluentSettings<IButtonsProps>): FormBuilder => this.addProperty(props, 'buttons');

  addCheckbox = (props: FluentSettings<ICheckboxComponentProps>): FormBuilder => this.addProperty(props, 'checkbox');

  addCodeEditor = (props: FluentSettings<ICodeEditorComponentProps>): FormBuilder => this.addProperty(props, 'codeEditor');

  addColorPicker = (props: FluentSettings<IColorPickerComponentProps>): FormBuilder => this.addProperty(props, 'colorPicker');

  addColumns = (props: FluentSettings<IColumnsComponentProps>): FormBuilder => this.addProperty(props, 'columns');

  addConfigurableActionConfigurator = (props: FluentSettings<IConfigurableActionConfiguratorComponentProps>): FormBuilder => this.addProperty(props, 'configurableActionConfigurator');

  addEntityTypeAutocomplete = (props: FluentSettings<IEntityTypeAutocompleteComponentProps>): FormBuilder => this.addProperty(props, 'entityTypeAutocomplete');

  addContainer = (props: FluentSettings<IContainerComponentProps>): FormBuilder => this.addProperty(props, 'container');

  addContextPropertyAutocomplete = (props: FluentSettings<IContextPropertyAutocompleteComponentProps>): FormBuilder => this.addProperty(props, 'contextPropertyAutocomplete');

  addDatatablePager = (props: FluentSettings<IPagerComponentProps>): FormBuilder => this.addProperty(props, 'datatable.pager');

  addDatatableQuickSearch = (props: FluentSettings<IQuickSearchComponentProps>): FormBuilder => this.addProperty(props, 'datatable.quickSearch');

  addDatatable = (props: FluentSettings<ITableComponentProps>): FormBuilder => this.addProperty(props, 'datatable');

  addColumnsEditorComponent = (props: FluentSettings<IColumnsEditorComponentProps>): FormBuilder => this.addProperty(props, 'columnsEditorComponent');

  /**
   * 
   * @deprecated use `addDataContext` instead
   */
  addDatatableContext = (props: FluentSettings<ITableContextComponentProps>): FormBuilder => this.addProperty(props, 'datatableContext');
  addDataContext = (props: FluentSettings<ITableContextComponentProps>): FormBuilder => this.addProperty(props, 'dataContext');

  addTableViewSelector = (props: FluentSettings<ITableViewSelectorComponentProps>): FormBuilder => this.addProperty(props, 'tableViewSelector');

  addCollapsiblePanel = (props: FluentSettings<ICollapsiblePanelComponentProps>): FormBuilder => {
    const fixedProps = {
      ...props,
      isDynamic: props.isDynamic === undefined ? true : props.isDynamic,
      header: props.header ?? {
        id: nanoid(),
        components: [],
      },
    };

    return this.addProperty(fixedProps, 'collapsiblePanel');
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

  protected addProperty(props: FluentSettings<IConfigurableFormComponent>, type: ComponentTypes): FormBuilder {
    const { id, hidden, version, ...restProps } = props;

    const componentDefinition = this.getComponentDefinition(type);

    let formComponent: IConfigurableFormComponent = {
      id: id ?? nanoid(),
      type,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      hidden: hidden as any, // TODO: review types and remove `any`
      version: typeof (version) === 'number'
        ? version
        : undefined,
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
