/* eslint-disable no-console */
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
import { IDataContextComponentProps } from "@/designer-components/dataContextComponent/interfaces";
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
import { IKeyInformationBarComponentProps } from "@/designer-components/keyInformationBar/interfaces";
import { ILabelValueEditorComponentProps } from "@/designer-components/labelValueEditor/interfaces";
import { ILinkComponentProps } from "@/designer-components/link/interfaces";
import { INumberFieldComponentProps } from "@/designer-components/numberField/interfaces";
import { IPropertiesTabsComponentProps } from "@/designer-components/propertiesTabs/models";
import { IPropertyAutocompleteComponentProps } from "@/designer-components/propertyAutocomplete/interfaces";
import { IPropertyRouterComponentProps } from "@/designer-components/propertyRouter/interfaces";
import { IQueryBuilderComponentProps } from "@/designer-components/queryBuilder/interfaces";
import { IRadioComponentProps } from "@/designer-components/radio/interfaces";
import { ISectionSeparatorComponentProps } from "@/designer-components/sectionSeprator/interfaces";
import { SettingsInputComponentProps } from "@/designer-components/settingsInput/interfaces";
import { ISettingsInputRowProps } from "@/designer-components/settingsInputRow/interfaces";
import { ISliderComponentProps } from "@/designer-components/slider/interfaces";
import { IStyleBoxComponentProps } from "@/designer-components/styleBox/interfaces";
import { ILabelComponentProps } from "@/designer-components/labelConfigurator/interfaces";
import { ISwitchComponentProps } from "@/designer-components/switch/interfaces";
import { ITabsComponentProps } from "@/designer-components/tabs/models";
import { ITextComponentProps } from "@/designer-components/text/models";
import { ITextAreaComponentProps } from "@/designer-components/textArea/interfaces";
import { ITextFieldComponentProps } from "@/designer-components/textField/interfaces";
import { ITimePickerComponentProps } from "@/designer-components/timeField/models";
import { DEFAULT_FORM_SETTINGS, IConfigurableFormComponent, IContainerComponentProps, InteractionType, IPropertyMetadata, IToolboxComponent } from "@/interfaces";
import { AllComponentsConfig, FluentSettings, FormBuilder, FormBuilderFactory, StandardAppearancePanel, StandardAppearancePanelConfig, StandardFormBuilderMethods } from "./interfaces";
import { nanoid } from "@/utils/uuid";
import { linkComponentToModelMetadata, upgradeComponent } from "@/providers/form/utils";
import { fontTypes, fontWeightsOptions, textAlignOptions } from "@/designer-components/_settings/utils/font/utils";
import { getBorderInputs, getCornerInputs } from "@/designer-components/_settings/utils/border/utils";
import { backgroundTypeOptions, gradientDirectionOptions, positionOptions, repeatOptions, sizeOptions } from "@/designer-components/_settings/utils/background/utils";
import { isDefined, isNullOrWhiteSpace } from "@/utils/nullables";
import { isPropertySettings } from "@/designer-components/_settings/utils/utils";
import { getEventConfig, StandardEventHandler } from "@/designer-components/_common/events";
import { ALIGN_ITEMS, ALIGN_ITEMS_GRID, ALIGN_SELF, FLEX_DIRECTION, FLEX_WRAP, JUSTIFY_CONTENT, JUSTIFY_ITEMS, JUSTIFY_SELF } from "@/designer-components/container/data";
import { IContainerCheckerComponentProps } from "@/designer-components/containerChecker/interfaces";
import { resolveInputVisibility } from "./inputVisibility";

/**
 * Returns `true` when `propertyName`'s trailing segment (the part after the last `.`) is listed in
 * `exclude`. Used by the standard appearance panels so callers can drop individual sub-inputs,
 * e.g. `exclude: ['align']` removes the input bound to `font.align`.
 */
const isExcluded = (propertyName: string, exclude?: string[]): boolean => {
  if (!isDefined(exclude) || exclude.length === 0) return false;
  const leaf = propertyName.split('.').pop() ?? propertyName;
  return exclude.includes(leaf) || exclude.includes(propertyName);
};

/** Filters a panel's `inputs` array, removing any whose `propertyName` leaf is in `exclude`. */
const excludeInputs = <TInput extends { propertyName: string }>(inputs: TInput[], exclude?: string[]): TInput[] => {
  if (!isDefined(exclude) || exclude.length === 0) return inputs;
  return inputs.filter((input) => !isExcluded(input.propertyName, exclude));
};

export class FormBuilderImplementation implements FormBuilder, StandardFormBuilderMethods<AllComponentsConfig> {
  addKeyInformationBar = (props: FluentSettings<IKeyInformationBarComponentProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'KeyInformationBar', meta);

  addEditModeSelector = (props: FluentSettings<IConfigurableFormComponent>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'editModeSelector', meta);

  addTabs = (props: FluentSettings<ITabsComponentProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'tabs', meta);

  addDateField = (props: FluentSettings<IDateFieldProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'dateField', meta);

  addDropdown = (props: FluentSettings<IDropdownComponentProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'dropdown', meta);

  addEditableTagGroup = (props: FluentSettings<IEditableTagGroupComponentProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'editableTagGroup', meta);

  addEndpointsAutocomplete = (props: FluentSettings<IEndpointsAutocompleteComponentProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'endpointsAutocomplete', meta);

  addFileUpload = (props: FluentSettings<IFileUploadProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'fileUpload', meta);

  addFormAutocomplete = (props: FluentSettings<IConfigurableFormComponent>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'formAutocomplete', meta);

  addIconPicker = (props: FluentSettings<IIconPickerComponentProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'iconPicker', meta);

  addLabelValueEditor = (props: FluentSettings<ILabelValueEditorComponentProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'labelValueEditor', meta);

  addNumberField = (props: FluentSettings<INumberFieldComponentProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'numberField', meta);

  addContainerChecker = (props: FluentSettings<IContainerCheckerComponentProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'containerChecker', meta);

  addPermissionAutocomplete = (props: FluentSettings<IConfigurableFormComponent>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'permissionAutocomplete', meta);

  addPropertyAutocomplete = (props: FluentSettings<IPropertyAutocompleteComponentProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'propertyAutocomplete', meta);

  addPropertyRouter = (props: FluentSettings<IPropertyRouterComponentProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'propertyRouter', meta);

  addQueryBuilder = (props: FluentSettings<IQueryBuilderComponentProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'queryBuilder', meta);

  addRadio = (props: FluentSettings<IRadioComponentProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'radio', meta);

  addReferenceListAutocomplete = (props: FluentSettings<IConfigurableFormComponent>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'referenceListAutocomplete', meta);

  addSectionSeparator = (props: FluentSettings<ISectionSeparatorComponentProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'sectionSeparator', meta);

  addSwitch = (props: FluentSettings<ISwitchComponentProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'switch', meta);

  addTextField = (props: FluentSettings<ITextFieldComponentProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'textField', meta);

  addTextArea = (props: FluentSettings<ITextAreaComponentProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'textArea', meta);

  addLink = (props: FluentSettings<ILinkComponentProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'link', meta);

  addSlider = (props: FluentSettings<ISliderComponentProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'slider', meta);

  addStyleBox = (props: FluentSettings<IStyleBoxComponentProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'styleBox', meta);

  addLabelConfigurator = (props: FluentSettings<ILabelComponentProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'labelConfigurator', meta);

  addText = (props: FluentSettings<ITextComponentProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'text', meta);

  addTimePicker = (props: FluentSettings<ITimePickerComponentProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'timePicker', meta);

  addSearchableTabs = (props: FluentSettings<IPropertiesTabsComponentProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'searchableTabs', meta);

  addAlert = (props: FluentSettings<IAlertComponentProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'alert', meta);

  addAutocomplete = (props: FluentSettings<IAutocompleteComponentProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'autocomplete', meta);

  addButtons = (props: FluentSettings<IButtonsProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'buttons', meta);

  addCheckbox = (props: FluentSettings<ICheckboxComponentProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'checkbox', meta);

  addCodeEditor = (props: FluentSettings<ICodeEditorComponentProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'codeEditor', meta);

  addColorPicker = (props: FluentSettings<IColorPickerComponentProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'colorPicker', meta);

  addColumns = (props: FluentSettings<IColumnsComponentProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'columns', meta);

  addConfigurableActionConfigurator = (props: FluentSettings<IConfigurableActionConfiguratorComponentProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'configurableActionConfigurator', meta);

  addEntityTypeAutocomplete = (props: FluentSettings<IEntityTypeAutocompleteComponentProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'entityTypeAutocomplete', meta);

  addContainer = (props: FluentSettings<IContainerComponentProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'container', meta);

  addContextPropertyAutocomplete = (props: FluentSettings<IContextPropertyAutocompleteComponentProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'contextPropertyAutocomplete', meta);

  addDataContext = (props: FluentSettings<IDataContextComponentProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'dataContext', meta);

  addDatatablePager = (props: FluentSettings<IPagerComponentProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'datatable.pager', meta);

  addDatatableQuickSearch = (props: FluentSettings<IQuickSearchComponentProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'datatable.quickSearch', meta);

  addDatatable = (props: FluentSettings<ITableComponentProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'datatable', meta);

  addColumnsEditorComponent = (props: FluentSettings<IColumnsEditorComponentProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'columnsEditorComponent', meta);

  addDatatableContext = (props: FluentSettings<ITableContextComponentProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'dataContext', meta);

  addTableViewSelector = (props: FluentSettings<ITableViewSelectorComponentProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'tableViewSelector', meta);

  addCollapsiblePanel = (props: FluentSettings<ICollapsiblePanelComponentProps>, meta?: IPropertyMetadata): FormBuilder => {
    const fixedProps: FluentSettings<ICollapsiblePanelComponentProps> = {
      ...props,
      label: props.label ?? '',
      labelAlign: props.labelAlign ?? 'right',
      ghost: props.ghost ?? true,
      collapsible: props.collapsible ?? 'header',
      isDynamic: props.isDynamic === undefined ? true : props.isDynamic,
      header: props.header ?? { id: nanoid(), components: [] },
      content: props.content ?? { id: nanoid(), components: [] },
    };

    // update header id and parentId for nested components
    if (fixedProps.header && !fixedProps.header.id)
      fixedProps.header.id = nanoid();
    if (fixedProps.header && isDefined(fixedProps.header.components) && fixedProps.header.components.length > 0)
      fixedProps.header.components = fixedProps.header.components.map((component) => ({ ...component, parentId: component.parentId ?? fixedProps.header?.id }));

    // update content id and parentId for nested components
    if (fixedProps.content && !fixedProps.content.id)
      fixedProps.content.id = nanoid();
    if (fixedProps.content && isDefined(fixedProps.content.components) && fixedProps.content.components.length > 0)
      fixedProps.content.components = fixedProps.content.components.map((component) => ({ ...component, parentId: component.parentId ?? fixedProps.content?.id }));

    return this._addProperty(fixedProps, 'collapsiblePanel', meta);
  };

  addSettingsInput = (props: FluentSettings<SettingsInputComponentProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'settingsInput', meta);

  /**
   * `_addProperty` converts `visibleJs` into a `visible` code evaluator, but only for the row
   * component itself — the inputs inside it are plain objects it never walks, so their `visibleJs`
   * was carried into the markup as an inert string and the input always rendered. Convert each one
   * here instead: `getActualModel` resolves the evaluator when it recurses into the `inputs` array,
   * and `SettingInput` already treats `visible === false` as hidden.
   */
  addSettingsInputRow = (props: FluentSettings<ISettingsInputRowProps & IConfigurableFormComponent>, meta?: IPropertyMetadata): FormBuilder => {
    const inputs = isDefined(props.inputs) ? resolveInputVisibility(props.inputs) : undefined;

    return this._addProperty(isDefined(inputs) ? { ...props, inputs } : props, 'settingsInputRow', meta);
  };

  stdPropertyLabelInputs = (): FormBuilder => {
    this.addContextPropertyAutocomplete({ propertyName: 'propertyName', label: 'Property Name', styledLabel: true, size: 'small', validate: { required: true }, jsSetting: true });
    this.addLabelConfigurator({ propertyName: 'hideLabel', label: 'Label', hideLabel: true });
    return this;
  };

  stdPlaceholderDescriptionInputs = (): FormBuilder => {
    this.addSettingsInputRow({
      inputs: [
        { type: 'textField', propertyName: 'placeholder', label: 'Placeholder', size: 'small', jsSetting: true },
        { type: 'textArea', propertyName: 'description', label: 'Tooltip', jsSetting: true },
      ],
    });
    return this;
  };

  stdVisibleEditableInputs = (interactionType: InteractionType): FormBuilder => {
    this.addSettingsInputRow({
      inputs: [
        { type: 'switch', propertyName: 'visible', label: 'Visible', jsSetting: true, layout: 'horizontal', permissionSettings: true },
        { type: 'editModeSelector', propertyName: 'editMode', label: 'Interaction Mode', size: 'small', jsSetting: true, permissionSettings: true, interactionType },
      ],
    });
    return this;
  };

  stdPrefixSuffixInputs = (visibleJs?: string): FormBuilder => {
    this.addSettingsInputRow({
      inputs: [
        { type: 'textField', propertyName: 'prefix', label: 'Prefix', jsSetting: true },
        { type: 'iconPicker', propertyName: 'prefixIcon', label: 'Prefix Icon', jsSetting: true },
      ],
      visibleJs: visibleJs,
    });
    this.addSettingsInputRow({
      inputs: [
        { type: 'textField', propertyName: 'suffix', label: 'Suffix', jsSetting: true },
        { type: 'iconPicker', propertyName: 'suffixIcon', label: 'Suffix Icon', jsSetting: true },
      ],
      visibleJs: visibleJs,
    });
    return this;
  };

  stdCollapsiblePanel = (label: string, components: (fbf: FormBuilder) => FormBuilder, collapsedByDefault: boolean = false, visibleJs?: string | undefined): FormBuilder => {
    const contentId = nanoid();
    const fbf = new FormBuilderImplementation(this.componentDefinitions, contentId) as FormBuilder;

    const fixedProps: FluentSettings<ICollapsiblePanelComponentProps> = {
      label: label, labelAlign: 'right', ghost: true, collapsible: 'header', collapsedByDefault, isDynamic: true,
      header: { id: nanoid(), components: [] },
      content: { id: contentId, components: components(fbf).toJson() },
      visibleJs,
    };

    return this._addProperty(fixedProps, 'collapsiblePanel');
  };

  stdContainer = (components: (fbf: FormBuilder) => FormBuilder, visibleJs?: string | undefined): FormBuilder => {
    const containerId = nanoid();
    const fbf = new FormBuilderImplementation(this.componentDefinitions, containerId) as FormBuilder;
    const fixedProps: FluentSettings<IContainerComponentProps> = { id: containerId, components: components(fbf).toJson(), visibleJs };
    return this._addProperty(fixedProps, 'container');
  };

  stdContainerChecker = (components: (fbf: FormBuilder) => FormBuilder, visibleJs?: string | undefined): FormBuilder => {
    const containerId = nanoid();
    const fbf = new FormBuilderImplementation(this.componentDefinitions, containerId) as FormBuilder;
    const fixedProps: FluentSettings<IContainerCheckerComponentProps> = { id: containerId, components: components(fbf).toJson(), visibleJs };
    return this._addProperty(fixedProps, 'containerChecker');
  };

  stdEventHandler = (
    propertyName: string,
    label: string,
    tooltip: string,
    availableConstantsExpression?: string | undefined,
    meta?: IPropertyMetadata | undefined,
  ): FormBuilder => {
    this.addSettingsInput({
      inputType: 'codeEditor',
      propertyName: propertyName,
      label: label,
      labelAlign: 'right',
      tooltip: tooltip,
      availableConstantsExpression,
    }, meta);
    return this;
  };

  stdEventHandlers = (events: readonly StandardEventHandler[], valueType?: string | undefined, prefix?: string | undefined, prefixLabel: string = ''): FormBuilder => {
    events.forEach((event) => {
      const eventConfig = getEventConfig(event, valueType);
      if (eventConfig)
        this.stdEventHandler((isDefined(prefix) ? prefix + '.' : '') + eventConfig.propertyName, prefixLabel + eventConfig.label, eventConfig.tooltip, eventConfig.availableConstantsExpression);
    });
    return this;
  };

  stdFontControls = (propertyName: string = 'font', exclude?: string[], panelTitle: string = 'Font', showSeparator: boolean = true): FormBuilder => {
    if (showSeparator)
      this.addSectionSeparator({ label: panelTitle, containerStylingBoxJson: { _type: 'styleBox', marginBottom: 8 } });
    this.addSettingsInputRow({
      inline: true,
      propertyName: propertyName,
      inputs: excludeInputs([
        { type: 'dropdown', label: 'Family', propertyName: `${propertyName}.type`, hideLabel: true, dropdownOptions: fontTypes },
        { type: 'numberField', label: 'Size', propertyName: `${propertyName}.size`, hideLabel: true, width: 50 },
        { type: 'dropdown', label: 'Weight', propertyName: `${propertyName}.weight`, hideLabel: true, dropdownOptions: fontWeightsOptions, width: 48, tooltip: 'Controls text thickness (light, normal, bold, etc.)' },
        { type: 'colorPicker', label: 'Color', hideLabel: true, propertyName: `${propertyName}.color` },
        { type: 'dropdown', label: 'Align', propertyName: `${propertyName}.align`, hideLabel: true, width: 48, dropdownOptions: textAlignOptions },
      ], exclude) });
    return this;
  };

  stdFontPanel = (propertyName: string = 'font', exclude?: string[], panelTitle: string = 'Font'): FormBuilder => {
    this.stdCollapsiblePanel(panelTitle, (f) => f.stdFontControls(propertyName, exclude, panelTitle, false));
    return this;
  };

  stdLayoutPanel = (isResponsive?: boolean, propertyName: string = '', panelTitle: string = 'Layout'): FormBuilder => {
    const getDisplay = ` getSettingValue(${isResponsive === true ? 'data[`${page.canvasContext?.designerDevice || "desktop"}`]?' : 'data'}.display)`;
    const getFlexDirection = ` getSettingValue(${isResponsive === true ? 'data[`${page.canvasContext?.designerDevice || "desktop"}`]?' : 'data'}.flexDirection)`;
    const getShowAdvanced = ` getSettingValue(${isResponsive === true ? 'data[`${page.canvasContext?.designerDevice || "desktop"}`]?' : 'data'}.showAdvanced)`;
    const propName = isNullOrWhiteSpace(propertyName) ? '' : propertyName + '.';
    this.stdCollapsiblePanel(panelTitle, (f) => {
      f.addSettingsInput({ propertyName: `${propName}display`, label: 'Layout Type', inputType: 'radio',
        description: 'The display CSS property sets whether an element is treated as a block or inline element and the layout used for its children, such as flow layout, grid or flex.',
        validate: { required: true },
        buttonGroupOptions: [
          { value: 'block', title: 'Block', icon: 'BorderOutlined' },
          { value: 'grid', title: 'Grid', icon: 'AppstoreOutlined' },
          { value: 'flex', title: 'Flex', icon: 'flex' },
          { value: 'inline-grid', title: 'Inline grid', icon: 'TableOutlined' },
        ],
      });
      f.stdContainer((f) => {
        f.addSettingsInputRow({
          inline: true,
          inputs: [
            { type: 'radio', label: 'Flex Direction', hideLabel: true, propertyName: `${propName}flexDirection`,
              hidden: { _code: `return ${getDisplay} !== "flex";`, _mode: 'code', _value: false },
              buttonGroupOptions: [{ title: 'Row', value: 'row', icon: 'row' }, { title: 'Column', value: 'column', icon: 'column' }],
            },
            { type: 'radio', label: 'Justify Content', hideLabel: true, propertyName: `${propName}justifyContent`,
              hidden: { _code: `return (${getDisplay} === "flex" && ${getFlexDirection} === "column") || ${getDisplay} === "inline-grid"`, _mode: 'code', _value: false },
              buttonGroupOptions: [{ title: 'Left', value: 'left', icon: 'alignHorizontalLeft' }, { title: 'Center', value: 'center', icon: 'alignHorizontalCenter' }, { title: 'Right', value: 'right', icon: 'alignHorizontalRight' }],
            },
            {
              type: 'radio', label: 'Align Items', hideLabel: true, propertyName: `${propName}alignItems`,
              hidden: { _code: `return ${getDisplay} === "flex" && ${getFlexDirection} === "column"`, _mode: 'code', _value: false },
              buttonGroupOptions: [{ title: 'Start', value: 'start', icon: 'alignVerticalTop' }, { title: 'Center', value: 'center', icon: 'alignVerticalCenter' }, { title: 'End', value: 'end', icon: 'alignVerticalBottom' }],
            },
            { type: 'radio', label: 'Align Items', hideLabel: true, propertyName: `${propName}alignItems`,
              hidden: { _code: `return ${getDisplay} !== "flex" || ${getFlexDirection} !== "column"`, _mode: 'code', _value: false },
              buttonGroupOptions: [{ title: 'Start', value: 'start', icon: 'alignHorizontalLeft' }, { title: 'Center', value: 'center', icon: 'alignHorizontalCenter' }, { title: 'End', value: 'end', icon: 'alignHorizontalRight' }],
            },
            { type: 'radio', label: 'Justify Content', hideLabel: true, propertyName: `${propName}justifyContent`,
              hidden: { _code: `return ${getDisplay} !== "flex" || ${getFlexDirection} !== "column"`, _mode: 'code', _value: false },
              buttonGroupOptions: [{ title: 'Start', value: 'start', icon: 'alignVerticalTop' }, { title: 'Center', value: 'center', icon: 'alignVerticalCenter' }, { title: 'End', value: 'end', icon: 'alignVerticalBottom' }],
            },
            { type: 'button', label: 'Show Advanced', hideLabel: true, tooltip: 'Show advanced settings', tooltipAlt: 'Hide advanced settings', propertyName: `${propName}showAdvanced`, icon: 'tuneIcon', iconAlt: 'tuneIcon' },
          ] });
        f.addSettingsInputRow({
          inputs: [{ type: 'textField', label: 'Gap', propertyName: `${propName}gap`, description: 'Examples of a valid gap include: `10` | `10px` | `20px 20px`' }],
        });
        f.addSettingsInputRow({
          inputs: [
            { type: 'numberField', propertyName: `${propName}gridColumnsCount`, label: 'Grid Columns Count', description: 'Number of columns each grid should have',
              hidden: { _code: `return ${getDisplay} !== "grid" && ${getDisplay} !== "inline-grid";`, _mode: 'code', _value: false },
            },
            { type: 'numberField', propertyName: `${propName}gridRowsCount`, label: 'Grid Rows Count', description: 'Number of rows each grid should have',
              hidden: { _code: `return ${getDisplay} !== "grid" && ${getDisplay} !== "inline-grid";`, _mode: 'code', _value: false },
            },
          ],
        });
        f.addSettingsInputRow({
          inputs: [
            { type: 'dimensionField', dimensionType: 'gridColumnWidth', propertyName: `${propName}gridColumnsWidth`, label: 'Grid Columns Width', description: 'Width of each column', icon: 'widthIcon',
              hidden: { _code: `return ${getDisplay} !== "grid" && ${getDisplay} !== "inline-grid";`, _mode: 'code', _value: false },
            },
            { type: 'dimensionField', dimensionType: 'gridRowHeight', propertyName: `${propName}gridRowsHeight`, label: 'Grid Rows Height', description: 'Height of each row', icon: 'heightIcon',
              hidden: { _code: `return ${getDisplay} !== "grid" && ${getDisplay} !== "inline-grid";`, _mode: 'code', _value: false },
            },
          ],
        });
        f.stdContainer((f) => {
          f.addSettingsInputRow({
            hidden: { _code: `return ${getDisplay} !== "flex";`, _mode: 'code', _value: false },
            inputs: [
              { type: 'dropdown', label: 'Flex Direction', propertyName: `${propName}flexDirection`, dropdownOptions: FLEX_DIRECTION, description: 'The flex-direction CSS property sets how flex items are placed in the flex container defining the main axis and the direction (normal or reversed).' },
              { type: 'dropdown', label: 'Flex Wrap', propertyName: `${propName}flexWrap`, dropdownOptions: FLEX_WRAP, description: 'The flex-wrap CSS property sets whether flex items are forced into multiple lines and the direction of that wrapping.' },
            ],
          });
          f.addSettingsInputRow({
            inputs: [
              { type: 'dropdown', label: 'Justify Content', propertyName: `${propName}justifyContent`, dropdownOptions: JUSTIFY_CONTENT },
              { type: 'dropdown', label: 'Align Items', propertyName: `${propName}alignItems`, dropdownOptions: [...ALIGN_ITEMS, ...ALIGN_ITEMS_GRID] },
            ],
          });
          f.addSettingsInputRow({
            inputs: [
              { type: 'dropdown', label: 'Align Self', propertyName: `${propName}alignSelf`, dropdownOptions: ALIGN_SELF,
                tooltip: "The align-self CSS property overrides a grid or flex item's align-items value. In Grid, it aligns the item inside the grid area. In Flexbox, it aligns the item on the cross axis." },
              { type: 'dropdown', label: 'Justify Items', propertyName: `${propName}justifyItems`,
                hidden: { _code: `return ${getDisplay} === "flex";`, _mode: 'code', _value: false }, dropdownOptions: JUSTIFY_ITEMS },
            ],
          });
          f.addSettingsInput({ inputType: 'dropdown', label: 'Justify Self', propertyName: `${propName}justifySelf`, dropdownOptions: JUSTIFY_SELF, tooltip: "The CSS justify-self property sets the way a box is justified inside its alignment container along the appropriate axis." });
          return f;
        },
        `return ${getShowAdvanced}`);
        return f;
      },
      `return ${getDisplay} !== "block";`);
      return f;
    });
    return this;
  };

  stdDimensionsPanel = (propertyName: string = 'dimensions', exclude?: string[], panelTitle: string = 'Dimensions'): FormBuilder => {
    this.stdCollapsiblePanel(panelTitle, (f) => f
      .addSettingsInputRow({
        inline: true,
        inputs: excludeInputs([
          { type: 'dimensionField', dimensionType: 'width', label: 'Width', width: 85, propertyName: `${propertyName}.width`, icon: 'widthIcon',
            tooltip: 'You can use any unit (%, px, em, etc). px by default if without unit. \nAlso you can use calc value, for example `calc(50% - 10px)` or `50% - 10px`' },
          { type: 'dimensionField', dimensionType: 'minWidth', label: 'Min Width', width: 85, hideLabel: true, propertyName: `${propertyName}.minWidth`, icon: 'minWidthIcon' },
          { type: 'dimensionField', dimensionType: 'maxWidth', label: 'Max Width', width: 85, hideLabel: true, propertyName: `${propertyName}.maxWidth`, icon: 'maxWidthIcon' },
        ], exclude),
      })
      .addSettingsInputRow({
        inline: true,
        inputs: excludeInputs([
          { type: 'dimensionField', dimensionType: 'height', label: 'Height', width: 85, propertyName: `${propertyName}.height`, icon: 'heightIcon',
            tooltip: 'You can use any unit (%, px, em, etc). px by default if without unit. \nAlso you can use calc value, for example `calc(50% - 10px)` or `50% - 10px`' },
          { type: 'dimensionField', dimensionType: 'minHeight', label: 'Min Height', width: 85, hideLabel: true, propertyName: `${propertyName}.minHeight`, icon: 'minHeightIcon' },
          { type: 'dimensionField', dimensionType: 'maxHeight', label: 'Max Height', width: 85, hideLabel: true, propertyName: `${propertyName}.maxHeight`, icon: 'maxHeightIcon' },
        ], exclude),
      }));
    this.stdContainerChecker((f) => f
      .stdCollapsiblePanel('Grid Size', (f) => f
        .addSettingsInputRow({
          inline: true,
          inputs: excludeInputs([
            { type: 'numberField', label: 'Width (Columns)', width: 85, propertyName: `${propertyName}.gridColumn`, icon: 'widthIcon' },
            { type: 'numberField', label: 'Height (Rows)', width: 85, propertyName: `${propertyName}.gridRow`, icon: 'heightIcon' },
          ], exclude),
        })));
    return this;
  };

  stdBorderPanel = (isResponsive?: boolean, propertyName: string = 'border', exclude?: 'border' | 'radius' | undefined, panelTitle: string = 'Border'): FormBuilder => {
    const bid = nanoid();
    const cid = nanoid();
    const bfb = (): FormBuilder => new FormBuilderImplementation(this.componentDefinitions, bid);
    const cfb = (): FormBuilder => new FormBuilderImplementation(this.componentDefinitions, cid);

    this.stdCollapsiblePanel(panelTitle, (f) => {
      if (exclude !== 'border')
        f.addContainer({ id: bid, components: getBorderInputs(bfb, propertyName, isResponsive) });
      if (exclude !== 'radius')
        f.addContainer({ id: cid, components: getCornerInputs(cfb, propertyName, isResponsive) });
      return f;
    });

    return this;
  };

  stdBackgroundPanel = (isResponsive?: boolean, propertyName: string = 'background', exclude?: string[], panelTitle: string = 'Background'): FormBuilder => {
    const dataPath = isResponsive === true ? 'data[`${page.canvasContext?.designerDevice || "desktop"}`]' : 'data';
    const keep = (propertyName: string): boolean => !isExcluded(propertyName, exclude);
    this.stdCollapsiblePanel(panelTitle, (f) => {
      if (keep(`${propertyName}.type`))
        f.addSettingsInput({ label: 'Type', jsSetting: false, propertyName: `${propertyName}.type`, inputType: 'radio', tooltip: 'Select a type of background', buttonGroupOptions: backgroundTypeOptions });
      if (keep(`${propertyName}.color`))
        f.addSettingsInput({ label: 'Color', propertyName: `${propertyName}.color`, hideLabel: true, jsSetting: false, inputType: 'colorPicker',
          visibleJs: `return getSettingValue(${dataPath}?.${propertyName}?.type) === "color";`,
        });
      if (keep(`${propertyName}.gradient.colors`))
        f.addSettingsInput({ label: 'Colors', inputType: 'multiColorPicker', propertyName: `${propertyName}.gradient.colors`, jsSetting: false, hideLabel: true,
          visibleJs: `return getSettingValue(${dataPath}?.${propertyName}?.type) === "gradient";`,
        })
          .addSettingsInput({ label: 'Direction', inputType: 'dropdown', propertyName: `${propertyName}.gradient.direction`, dropdownOptions: gradientDirectionOptions, width: 120, jsSetting: false, hideLabel: true,
            visibleJs: `return getSettingValue(${dataPath}?.${propertyName}?.type) === "gradient";`,
          });
      if (keep(`${propertyName}.url`))
        f.addSettingsInput({ label: 'URL', inputType: 'textField', propertyName: `${propertyName}.url`, jsSetting: false,
          visibleJs: `return getSettingValue(${dataPath}?.${propertyName}?.type) === "url";`,
        });
      if (keep(`${propertyName}.uploadFile`))
        f.addSettingsInput({ label: 'Image', inputType: 'imageUploader', propertyName: `${propertyName}.uploadFile`, jsSetting: false,
          visibleJs: `return getSettingValue(${dataPath}?.${propertyName}?.type) === "image";`,
        });
      if (keep(`${propertyName}.storedFile.id`))
        f.addSettingsInput({ label: 'File ID', inputType: 'textField', jsSetting: false, propertyName: `${propertyName}.storedFile.id`,
          visibleJs: `return getSettingValue(${dataPath}?.${propertyName}?.type) === "storedFile";`,
        });
      f.addSettingsInputRow({
        inline: true,
        visibleJs: `return !["color", "gradient"].includes(getSettingValue(${dataPath}?.${propertyName}?.type));`,
        inputs: excludeInputs([
          { type: 'customDropdown', label: 'Size', hideLabel: true, propertyName: `${propertyName}.size`, dropdownOptions: sizeOptions,
            customTooltip: 'Size of the background image, two space separated values with units e.g "100% 100px"',
          },
          { type: 'customDropdown', label: 'Position', hideLabel: true, propertyName: `${propertyName}.position`, dropdownOptions: positionOptions,
            customTooltip: 'Position of the background image, two space separated values with units e.g "5em 100px"',
          },
          { type: 'radio', label: 'Repeat', hideLabel: true, propertyName: `${propertyName}.repeat`, buttonGroupOptions: repeatOptions },
        ], exclude),
      });
      return f;
    });
    return this;
  };

  stdShadowPanel = (propertyName: string = 'shadow', exclude?: string[], panelTitle: string = 'Shadow'): FormBuilder => {
    this.stdCollapsiblePanel(panelTitle, (f) => f
      .addSettingsInputRow({
        inline: true,
        inputs: excludeInputs([
          { type: 'numberField', label: 'Offset X', hideLabel: true, tooltip: 'Offset X', width: 80, icon: 'offsetHorizontalIcon', propertyName: `${propertyName}.offsetX` },
          { type: 'numberField', label: 'Offset Y', hideLabel: true, tooltip: 'Offset Y', width: 80, icon: 'offsetVerticalIcon', propertyName: `${propertyName}.offsetY` },
          { type: 'numberField', label: 'Blur', hideLabel: true, tooltip: 'Blur Radius', width: 80, icon: 'blurIcon', propertyName: `${propertyName}.blurRadius` },
          { type: 'numberField', label: 'Spread', hideLabel: true, tooltip: 'Spread Radius', width: 80, icon: 'spreadIcon', propertyName: `${propertyName}.spreadRadius` },
          { type: 'colorPicker', label: 'Color', hideLabel: true, propertyName: `${propertyName}.color` },
        ], exclude),
      }));
    return this;
  };

  stdMarginPaddingPanel = (propertyName: string = 'stylingBoxJson', panelTitle: string = 'Margin & Padding'): FormBuilder => {
    this.stdCollapsiblePanel(panelTitle, (f) => f.addStyleBox({ label: 'Margin Padding', hideLabel: true, propertyName: propertyName, format: 'json' }));
    return this;
  };

  stdCustomStylePanel = (propertyName: string = 'style', panelTitle: string = 'Custom Styles'): FormBuilder => {
    this.stdCollapsiblePanel(panelTitle, (f) => f
      .addSettingsInput({
        inputType: 'codeEditor', propertyName: propertyName, hideLabel: false, label: 'Style',
        description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
      }));
    return this;
  };

  stdAppearancePanels = (appearancePanels: StandardAppearancePanelConfig[], removeStyleRouter?: boolean): FormBuilder => {
    const rootId = nanoid();
    const fbf = new FormBuilderImplementation(this.componentDefinitions, rootId);
    appearancePanels.forEach((entry) => {
      const panel: StandardAppearancePanel = typeof entry === 'string' ? entry : entry.name;
      const exclude: string[] | undefined = typeof entry === 'string' ? undefined : entry.exclude;
      const panelTitle: string | undefined = typeof entry === 'string' ? undefined : entry.panelTitle;
      switch (panel) {
        case 'background':
          fbf.stdBackgroundPanel(removeStyleRouter !== true, undefined, exclude, panelTitle);
          break;
        case 'shadow':
          fbf.stdShadowPanel(undefined, exclude, panelTitle);
          break;
        case 'marginPadding':
          fbf.stdMarginPaddingPanel(undefined, panelTitle);
          break;
        case 'customStyle':
          fbf.stdCustomStylePanel(undefined, panelTitle);
          break;
        case 'font':
          fbf.stdFontPanel(undefined, exclude, panelTitle);
          break;
        case 'dimensions':
          fbf.stdDimensionsPanel(undefined, exclude, panelTitle);
          break;
        case 'border':
          fbf.stdBorderPanel(removeStyleRouter !== true, undefined, undefined, panelTitle);
          break;
      }
    });
    this.addPropertyRouter({
      id: rootId,
      propertyName: 'styleRouter',
      componentName: 'styleRouter',
      label: 'Style router',
      labelAlign: 'right',
      propertyRouteName: { _code: `return ${removeStyleRouter === true ? '' : 'contexts.canvasContext?.designerDevice || "desktop"'};`, _mode: 'code', _value: '' },
      components: [...fbf.toJson()],
    });

    return this;
  };

  protected readonly form: IConfigurableFormComponent[];

  private componentDefinitions: Map<string, IToolboxComponent> | undefined;

  private rootId: string;

  private getComponentDefinition = (type: string): IToolboxComponent | undefined => {
    return this.componentDefinitions?.get(type);
  };

  constructor(componentDefinitions: Map<string, IToolboxComponent> | undefined, rootId?: string) {
    this.componentDefinitions = componentDefinitions;
    this.form = [];
    this.rootId = rootId ?? nanoid();
  }

  private _addProperty(props: FluentSettings<IConfigurableFormComponent>, type: string, meta?: IPropertyMetadata): FormBuilder {
    const { id, hidden, visible, visibleJs, version, parentId, readOnly, editMode, ...restProps } = props;

    const componentDefinition = this.getComponentDefinition(type);

    let formComponent: IConfigurableFormComponent = {
      ...restProps, // use restProps for correct migrations (migrations can initialise some properties depends on other properties)
      id: id ?? nanoid(),
      parentId: parentId ?? this.rootId,

      editMode: readOnly === true
        ? 'readOnly'
        : isPropertySettings(readOnly)
          ? readOnly
          : editMode,
      type,
      version: typeof (version) === 'number'
        ? version
        : undefined,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      visible: typeof visibleJs === 'string'
        ? { _code: visibleJs, _mode: 'code', _value: false }
        : visible as any, // eslint-disable-line @typescript-eslint/no-explicit-any
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

  addByType = <TProps extends FluentSettings<IConfigurableFormComponent>>(type: string, props: TProps, meta?: IPropertyMetadata): FormBuilder => {
    return this._addProperty(props, type, meta);
  };

  toJson(): IConfigurableFormComponent[] {
    return this.form;
  }

  build(): string {
    return JSON.stringify(this.form);
  }
};

export const makeFormBuliderFactory: (components: Map<string, IToolboxComponent>) => FormBuilderFactory = (components) => {
  return (rootId?: string) => new FormBuilderImplementation(components, rootId);
};
