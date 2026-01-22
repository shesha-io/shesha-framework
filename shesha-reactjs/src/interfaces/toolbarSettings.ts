/* eslint-disable @stylistic/lines-between-class-members, @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types */
import { nanoid } from '@/utils/uuid';

type ToolbarSettingsProp = {
  id?: string;
  hidden?: unknown;
  isDynamic?: boolean;
  version?: unknown;
  header?: { id?: string; components?: unknown[] };
  [key: string]: unknown;
};

export class DesignerToolbarSettings<T = unknown> {
  protected readonly form: ToolbarSettingsProp[];
  protected readonly data?: T;

  constructor();
  constructor(model: T);
  constructor(model?: T) {
    this.data = model;
    this.form = [];
  }

  public addAlert(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
    return this.addProperty(props, 'alert');
  }

  public addButtons(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
    return this.addProperty(props, 'buttons');
  }

  public addCollapsiblePanel(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
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

  public addDatatableContext(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
    return this.addProperty(props, 'datatableContext');
  }

  public addQuickSearch(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
    return this.addProperty(props, 'datatable.quickSearch');
  }

  public addTablePager(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
    return this.addProperty(props, 'datatable.pager');
  }

  public addTableViewSelector(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
    return this.addProperty(props, 'tableViewSelector');
  }

  public addDatatable(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
    return this.addProperty(props, 'datatable');
  }

  public addText(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
    return this.addProperty(props, 'text');
  }

  public addSearchableTabs(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
    return this.addProperty(props, 'searchableTabs');
  }

  public addTabs(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
    return this.addProperty(props, 'tabs');
  }

  public addColumns(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
    return this.addProperty(props, 'columns');
  }

  public addKeyInformationBar(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
    return this.addProperty(props, 'KeyInformationBar');
  }

  public addDropdown(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
    return this.addProperty(props, 'dropdown');
  }

  public addColumnsEditor(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
    return this.addProperty(props, 'columnsEditorComponent');
  }

  public addSectionSeparator(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
    return this.addProperty(props, 'sectionSeparator');
  }

  public addTextField(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
    return this.addProperty(props, 'textField');
  }

  public addContextPropertyAutocomplete(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
    return this.addProperty(props, 'contextPropertyAutocomplete');
  }

  public addPropertyAutocomplete(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
    return this.addProperty(props, 'propertyAutocomplete');
  }

  public addColorPicker(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
    return this.addProperty(props, 'colorPicker');
  }

  public addImagePicker(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
    return this.addProperty(props, 'imagePicker');
  }

  public addTextArea(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
    return this.addProperty(props, 'textArea');
  }

  public addIconPicker(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
    return this.addProperty(props, 'iconPicker');
  }

  public addAutocomplete(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
    return this.addProperty(props, 'autocomplete');
  }

  public addEndpointsAutocomplete(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
    return this.addProperty(props, 'endpointsAutocomplete');
  }

  public addFormAutocomplete(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
    const model = typeof props !== 'function' ? props : props(this.data as T);
    return this.addProperty({ ...model, version: 2 }, 'formAutocomplete');
  }

  public addRefListAutocomplete(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
    const model = typeof props !== 'function' ? props : props(this.data as T);
    return this.addProperty({ ...model, version: 2 }, 'referenceListAutocomplete');
  }

  public addCheckbox(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
    return this.addProperty(props, 'checkbox');
  }

  public addSwitch(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
    return this.addProperty(props, 'switch');
  }

  public addCodeEditor(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
    return this.addProperty(props, 'codeEditor');
  }

  public addContainer(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
    const obj = typeof props !== 'function' ? props : props(this.data as T);
    obj.isDynamic = obj.isDynamic === undefined ? true : obj.isDynamic;
    return this.addProperty(obj, 'container');
  }

  public addNumberField(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
    return this.addProperty(props, 'numberField');
  }

  public addLabelValueEditor(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
    return this.addProperty(props, 'labelValueEditor');
  }

  public addQueryBuilder(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
    return this.addProperty(props, 'queryBuilder');
  }

  public addRadio(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
    return this.addProperty(props, 'radio');
  }

  public addConfigurableActionConfigurator(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
    return this.addProperty(props, 'configurableActionConfigurator');
  }

  public addEditableTagGroupProps(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
    return this.addProperty(props, 'editableTagGroup');
  }

  public addPermissionAutocomplete(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
    return this.addProperty(props, 'permissionAutocomplete');
  }

  public addEditMode(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
    return this.addProperty(props, 'editModeSelector');
  }

  public addStyleBox(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
    return this.addProperty(props, 'styleBox');
  }

  public addLabelConfigurator(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
    return this.addProperty(props, 'labelConfigurator');
  }

  public addSlider(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
    return this.addProperty(props, 'slider');
  }

  public addSettingsInput(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
    return this.addProperty(props, 'settingsInput');
  }

  public addSettingsInputRow(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
    const obj = typeof props !== 'function' ? props : props(this.data as T);
    obj.isDynamic = obj.isDynamic === undefined ? true : obj.isDynamic;
    obj.id = obj.id ?? nanoid();
    return this.addProperty(obj, 'settingsInputRow');
  }

  public addPropertyRouter(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp)) {
    const obj = typeof props !== 'function' ? props : props(this.data as T);
    obj.isDynamic = obj.isDynamic === undefined ? true : obj.isDynamic;
    return this.addProperty(obj, 'propertyRouter');
  }

  private addProperty(props: ToolbarSettingsProp | ((data: T) => ToolbarSettingsProp), type: string) {
    const obj = typeof props !== 'function' ? props : props(this.data as T);

    this.form.push({
      ...obj,
      id: obj.id ?? nanoid(),
      type,
      hidden: obj?.hidden as unknown,
      version: typeof obj?.version === 'number' ? obj?.version : 'latest',
    });

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
