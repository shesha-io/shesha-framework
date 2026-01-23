/* eslint-disable @stylistic/lines-between-class-members, @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types */
import { nanoid } from '@/utils/uuid';

// Base type for all toolbar settings with common fields
export interface ToolbarSettingsBase {
  id?: string;
  hidden?: unknown;
  isDynamic?: boolean;
  version?: 'latest' | number;
  parentId?: string;
  [key: string]: unknown;
}

// Header structure for collapsible components
export interface ToolbarSettingsHeader {
  id?: string;
  components?: ToolbarSettingsProp[];
}

// Discriminated union variants for specific toolbar setting types
export interface AlertToolbarSettings extends ToolbarSettingsBase {
  type: 'alert';
}

export interface ButtonsToolbarSettings extends ToolbarSettingsBase {
  type: 'buttons';
}

export interface CollapsiblePanelToolbarSettings extends ToolbarSettingsBase {
  type: 'collapsiblePanel';
  header?: ToolbarSettingsHeader;
}

export interface DatatableContextToolbarSettings extends ToolbarSettingsBase {
  type: 'datatableContext';
}

export interface QuickSearchToolbarSettings extends ToolbarSettingsBase {
  type: 'datatable.quickSearch';
}

export interface TablePagerToolbarSettings extends ToolbarSettingsBase {
  type: 'datatable.pager';
}

export interface TableViewSelectorToolbarSettings extends ToolbarSettingsBase {
  type: 'tableViewSelector';
}

export interface DatatableToolbarSettings extends ToolbarSettingsBase {
  type: 'datatable';
}

export interface TextToolbarSettings extends ToolbarSettingsBase {
  type: 'text';
}

export interface SearchableTabsToolbarSettings extends ToolbarSettingsBase {
  type: 'searchableTabs';
}

export interface TabsToolbarSettings extends ToolbarSettingsBase {
  type: 'tabs';
}

export interface ColumnsToolbarSettings extends ToolbarSettingsBase {
  type: 'columns';
}

export interface KeyInformationBarToolbarSettings extends ToolbarSettingsBase {
  type: 'KeyInformationBar';
}

export interface DropdownToolbarSettings extends ToolbarSettingsBase {
  type: 'dropdown';
}

export interface ColumnsEditorToolbarSettings extends ToolbarSettingsBase {
  type: 'columnsEditorComponent';
}

export interface SectionSeparatorToolbarSettings extends ToolbarSettingsBase {
  type: 'sectionSeparator';
}

export interface TextFieldToolbarSettings extends ToolbarSettingsBase {
  type: 'textField';
}

export interface ContextPropertyAutocompleteToolbarSettings extends ToolbarSettingsBase {
  type: 'contextPropertyAutocomplete';
}

export interface PropertyAutocompleteToolbarSettings extends ToolbarSettingsBase {
  type: 'propertyAutocomplete';
}

export interface ColorPickerToolbarSettings extends ToolbarSettingsBase {
  type: 'colorPicker';
}

export interface ImagePickerToolbarSettings extends ToolbarSettingsBase {
  type: 'imagePicker';
}

export interface TextAreaToolbarSettings extends ToolbarSettingsBase {
  type: 'textArea';
}

export interface IconPickerToolbarSettings extends ToolbarSettingsBase {
  type: 'iconPicker';
}

export interface AutocompleteToolbarSettings extends ToolbarSettingsBase {
  type: 'autocomplete';
}

export interface EndpointsAutocompleteToolbarSettings extends ToolbarSettingsBase {
  type: 'endpointsAutocomplete';
}

/**
 * @default 2
 */
export interface FormAutocompleteToolbarSettings extends ToolbarSettingsBase {
  type: 'formAutocomplete';
  version: number;
}

/**
 * @default 2
 */
export interface ReferenceListAutocompleteToolbarSettings extends ToolbarSettingsBase {
  type: 'referenceListAutocomplete';
  version: number;
}

export interface CheckboxToolbarSettings extends ToolbarSettingsBase {
  type: 'checkbox';
}

export interface SwitchToolbarSettings extends ToolbarSettingsBase {
  type: 'switch';
}

export interface CodeEditorToolbarSettings extends ToolbarSettingsBase {
  type: 'codeEditor';
}

export interface ContainerToolbarSettings extends ToolbarSettingsBase {
  type: 'container';
}

export interface NumberFieldToolbarSettings extends ToolbarSettingsBase {
  type: 'numberField';
}

export interface LabelValueEditorToolbarSettings extends ToolbarSettingsBase {
  type: 'labelValueEditor';
}

export interface QueryBuilderToolbarSettings extends ToolbarSettingsBase {
  type: 'queryBuilder';
}

export interface RadioToolbarSettings extends ToolbarSettingsBase {
  type: 'radio';
}

export interface ConfigurableActionConfiguratorToolbarSettings extends ToolbarSettingsBase {
  type: 'configurableActionConfigurator';
}

export interface EditableTagGroupToolbarSettings extends ToolbarSettingsBase {
  type: 'editableTagGroup';
}

export interface PermissionAutocompleteToolbarSettings extends ToolbarSettingsBase {
  type: 'permissionAutocomplete';
}

export interface EditModeSelectorToolbarSettings extends ToolbarSettingsBase {
  type: 'editModeSelector';
}

export interface StyleBoxToolbarSettings extends ToolbarSettingsBase {
  type: 'styleBox';
}

export interface LabelConfiguratorToolbarSettings extends ToolbarSettingsBase {
  type: 'labelConfigurator';
}

export interface SliderToolbarSettings extends ToolbarSettingsBase {
  type: 'slider';
}

export interface SettingsInputToolbarSettings extends ToolbarSettingsBase {
  type: 'settingsInput';
}

export interface SettingsInputRowToolbarSettings extends ToolbarSettingsBase {
  type: 'settingsInputRow';
}

export interface PropertyRouterToolbarSettings extends ToolbarSettingsBase {
  type: 'propertyRouter';
}

// Main discriminated union type
export type ToolbarSettingsProp =
  AlertToolbarSettings |
  ButtonsToolbarSettings |
  CollapsiblePanelToolbarSettings |
  DatatableContextToolbarSettings |
  QuickSearchToolbarSettings |
  TablePagerToolbarSettings |
  TableViewSelectorToolbarSettings |
  DatatableToolbarSettings |
  TextToolbarSettings |
  SearchableTabsToolbarSettings |
  TabsToolbarSettings |
  ColumnsToolbarSettings |
  KeyInformationBarToolbarSettings |
  DropdownToolbarSettings |
  ColumnsEditorToolbarSettings |
  SectionSeparatorToolbarSettings |
  TextFieldToolbarSettings |
  ContextPropertyAutocompleteToolbarSettings |
  PropertyAutocompleteToolbarSettings |
  ColorPickerToolbarSettings |
  ImagePickerToolbarSettings |
  TextAreaToolbarSettings |
  IconPickerToolbarSettings |
  AutocompleteToolbarSettings |
  EndpointsAutocompleteToolbarSettings |
  FormAutocompleteToolbarSettings |
  ReferenceListAutocompleteToolbarSettings |
  CheckboxToolbarSettings |
  SwitchToolbarSettings |
  CodeEditorToolbarSettings |
  ContainerToolbarSettings |
  NumberFieldToolbarSettings |
  LabelValueEditorToolbarSettings |
  QueryBuilderToolbarSettings |
  RadioToolbarSettings |
  ConfigurableActionConfiguratorToolbarSettings |
  EditableTagGroupToolbarSettings |
  PermissionAutocompleteToolbarSettings |
  EditModeSelectorToolbarSettings |
  StyleBoxToolbarSettings |
  LabelConfiguratorToolbarSettings |
  SliderToolbarSettings |
  SettingsInputToolbarSettings |
  SettingsInputRowToolbarSettings |
  PropertyRouterToolbarSettings;

export class DesignerToolbarSettings<T = unknown> {
  protected readonly form: ToolbarSettingsProp[];
  protected readonly data?: T;

  constructor();
  constructor(model: T);
  constructor(model?: T) {
    this.data = model;
    this.form = [];
  }

  public addAlert(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    return this.addProperty(props, 'alert');
  }

  public addButtons(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    return this.addProperty(props, 'buttons');
  }

  public addCollapsiblePanel(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    const obj = typeof props !== 'function' ? props : props(this.data as T);
    obj.isDynamic = obj.isDynamic === undefined ? true : obj.isDynamic;
    if (!obj.header) {
      obj.header = {
        id: nanoid(),
        components: [],
      };
    }
    return this.addProperty(obj, 'collapsiblePanel');
  }

  public addDatatableContext(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    return this.addProperty(props, 'datatableContext');
  }

  public addQuickSearch(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    return this.addProperty(props, 'datatable.quickSearch');
  }

  public addTablePager(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    return this.addProperty(props, 'datatable.pager');
  }

  public addTableViewSelector(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    return this.addProperty(props, 'tableViewSelector');
  }

  public addDatatable(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    return this.addProperty(props, 'datatable');
  }

  public addText(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    return this.addProperty(props, 'text');
  }

  public addSearchableTabs(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    return this.addProperty(props, 'searchableTabs');
  }

  public addTabs(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    return this.addProperty(props, 'tabs');
  }

  public addColumns(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    return this.addProperty(props, 'columns');
  }

  public addKeyInformationBar(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    return this.addProperty(props, 'KeyInformationBar');
  }

  public addDropdown(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    return this.addProperty(props, 'dropdown');
  }

  public addColumnsEditor(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    return this.addProperty(props, 'columnsEditorComponent');
  }

  public addSectionSeparator(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    return this.addProperty(props, 'sectionSeparator');
  }

  public addTextField(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    return this.addProperty(props, 'textField');
  }

  public addContextPropertyAutocomplete(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    return this.addProperty(props, 'contextPropertyAutocomplete');
  }

  public addPropertyAutocomplete(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    return this.addProperty(props, 'propertyAutocomplete');
  }

  public addColorPicker(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    return this.addProperty(props, 'colorPicker');
  }

  public addImagePicker(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    return this.addProperty(props, 'imagePicker');
  }

  public addTextArea(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    return this.addProperty(props, 'textArea');
  }

  public addIconPicker(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    return this.addProperty(props, 'iconPicker');
  }

  public addAutocomplete(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    return this.addProperty(props, 'autocomplete');
  }

  public addEndpointsAutocomplete(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    return this.addProperty(props, 'endpointsAutocomplete');
  }

  public addFormAutocomplete(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    const model = typeof props !== 'function' ? props : props(this.data as T);
    return this.addProperty({ ...model, version: 2 }, 'formAutocomplete');
  }

  public addRefListAutocomplete(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    const model = typeof props !== 'function' ? props : props(this.data as T);
    return this.addProperty({ ...model, version: 2 }, 'referenceListAutocomplete');
  }

  public addCheckbox(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    return this.addProperty(props, 'checkbox');
  }

  public addSwitch(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    return this.addProperty(props, 'switch');
  }

  public addCodeEditor(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    return this.addProperty(props, 'codeEditor');
  }

  public addContainer(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    const obj = typeof props !== 'function' ? props : props(this.data as T);
    obj.isDynamic = obj.isDynamic === undefined ? true : obj.isDynamic;
    return this.addProperty(obj, 'container');
  }

  public addNumberField(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    return this.addProperty(props, 'numberField');
  }

  public addLabelValueEditor(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    return this.addProperty(props, 'labelValueEditor');
  }

  public addQueryBuilder(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    return this.addProperty(props, 'queryBuilder');
  }

  public addRadio(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    return this.addProperty(props, 'radio');
  }

  public addConfigurableActionConfigurator(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    return this.addProperty(props, 'configurableActionConfigurator');
  }

  public addEditableTagGroupProps(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    return this.addProperty(props, 'editableTagGroup');
  }

  public addPermissionAutocomplete(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    return this.addProperty(props, 'permissionAutocomplete');
  }

  public addEditMode(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    return this.addProperty(props, 'editModeSelector');
  }

  public addStyleBox(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    return this.addProperty(props, 'styleBox');
  }

  public addLabelConfigurator(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    return this.addProperty(props, 'labelConfigurator');
  }

  public addSlider(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    return this.addProperty(props, 'slider');
  }

  public addSettingsInput(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    return this.addProperty(props, 'settingsInput');
  }

  public addSettingsInputRow(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    const obj = typeof props !== 'function' ? props : props(this.data as T);
    obj.isDynamic = obj.isDynamic === undefined ? true : obj.isDynamic;
    obj.id = obj.id ?? nanoid();
    return this.addProperty(obj, 'settingsInputRow');
  }

  public addPropertyRouter(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>)) {
    const obj = typeof props !== 'function' ? props : props(this.data as T);
    obj.isDynamic = obj.isDynamic === undefined ? true : obj.isDynamic;
    return this.addProperty(obj, 'propertyRouter');
  }

  private addProperty(props: Omit<ToolbarSettingsBase, 'type'> | ((data: T) => Omit<ToolbarSettingsBase, 'type'>), type: string) {
    const obj = typeof props !== 'function' ? props : props(this.data as T);

    this.form.push({
      ...obj,
      id: obj.id ?? nanoid(),
      type,
      hidden: obj?.hidden,
      version: typeof obj?.version === 'number' ? obj?.version : 'latest',
    } as ToolbarSettingsProp);

    return this;
  }

  get settings() {
    return this.form;
  }

  get model() {
    return this.data;
  }

  public toJson() {
    return this.form;
  }

  public toJsonString() {
    return JSON.stringify(this.form);
  }
}
