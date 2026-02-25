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
import { ISettingsInputProps, SettingsInputComponentProps } from "@/designer-components/settingsInput/interfaces";
import { ISettingsInputRowProps } from "@/designer-components/settingsInputRow/interfaces";
import { ISliderComponentProps } from "@/designer-components/slider/interfaces";
import { IStyleBoxComponentProps } from "@/designer-components/styleBox/interfaces";
import { ILabelComponentProps } from "@/designer-components/styleLabel/interfaces";
import { ISwitchComponentProps } from "@/designer-components/switch/interfaces";
import { ITabsComponentProps } from "@/designer-components/tabs/models";
import { ITextComponentProps } from "@/designer-components/text/models";
import { ITextAreaComponentProps } from "@/designer-components/textArea/interfaces";
import { ITextFieldComponentProps } from "@/designer-components/textField/interfaces";
import { ITimePickerComponentProps } from "@/designer-components/timeField/models";
import { DEFAULT_FORM_SETTINGS, IConfigurableFormComponent, IContainerComponentProps, IPropertyMetadata, IToolboxComponent } from "@/interfaces";
import { ComponentTypes, FluentSettings, FormBuilder, FormBuilderFactory, StandartAppearancePanel, StandartEventHandler } from "./interfaces";
import { nanoid } from "@/utils/uuid";
import { linkComponentToModelMetadata, upgradeComponent } from "@/providers/form/utils";
import { getComponentDefinitions } from "@/providers/form/defaults/toolboxComponents";
import { fontTypes, fontWeightsOptions, textAlignOptions } from "@/designer-components/_settings/utils/font/utils";
import { getBorderInputs, getCornerInputs } from "@/designer-components/_settings/utils/border/utils";
import { backgroundTypeOptions, positionOptions, repeatOptions, sizeOptions } from "@/designer-components/_settings/utils/background/utils";
import { getMetadataPropertyByProperty } from "./utils";

interface EventConfig {
  event: StandartEventHandler;
  propertyName: string;
  label: string;
  tooltip: string;
};

const eventConfigs: EventConfig[] = [
  {
    event: 'onChange',
    propertyName: 'onChangeCustom',
    label: 'On Change',
    tooltip: 'Enter the data change event handling code',
  },
  {
    event: 'onFocus',
    propertyName: 'onFocusCustom',
    label: 'On Focus',
    tooltip: 'Enter the event handling code when the component gets focus',
  },
  {
    event: 'onBlur',
    propertyName: 'onBlurCustom',
    label: 'On Blur',
    tooltip: 'Enter the event handling code when the component removes focus',
  },
  {
    event: 'onClick',
    propertyName: 'onClickCustom',
    label: 'On Click',
    tooltip: 'Enter the event handling code on click of the component',
  },
];


export class FormBuilderImplementation implements FormBuilder {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: `add${Capitalize<string>}`]: (props: any, metadata?: IPropertyMetadata) => FormBuilder;

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
    const fixedProps = {
      ...props,
      label: props.label ?? 'Font',
      labelAlign: props.labelAlign ?? 'right',
      ghost: props.ghost ?? true,
      collapsible: props.collapsible ?? 'header',
      isDynamic: props.isDynamic === undefined ? true : props.isDynamic,
      header: props.header ?? {
        id: nanoid(),
        components: [],
      },
    };

    if (fixedProps.content?.components?.length) {
      fixedProps.content.components = fixedProps.content.components.map((component) => {
        return {
          ...component,
          parentId: component.parentId ?? fixedProps.id,
        };
      });
    }

    return this._addProperty(fixedProps, 'collapsiblePanel', meta);
  };

  _updateMetadataValue = (props: FluentSettings<SettingsInputComponentProps> | FluentSettings<IConfigurableFormComponent>): FluentSettings<SettingsInputComponentProps> | FluentSettings<IConfigurableFormComponent> => {
    const metaProp = getMetadataPropertyByProperty(props.propertyName);
    if (!props.fromMetadata && metaProp) {
      props.fromMetadata = metaProp;
    }

    if (typeof props.fromMetadata === 'string') {
      const toProperty = typeof props.fromMetadataToProperty === 'string'
        ? props.fromMetadataToProperty
        : 'metadataValue';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      (props as any)[toProperty] = { _code: `return contexts?.formContext?.propMetadata?.${props.fromMetadata};`, _mode: 'code', _value: '' };
    }
    return props;
  };

  addSettingsInput = (props: FluentSettings<SettingsInputComponentProps>, meta?: IPropertyMetadata): FormBuilder => this._addProperty(props, 'settingsInput', meta);

  addSettingsInputRow = (props: FluentSettings<ISettingsInputRowProps & IConfigurableFormComponent>, meta?: IPropertyMetadata): FormBuilder => {
    props.inputs = props.inputs ? props.inputs.map((input) => this._updateMetadataValue(input) as ISettingsInputProps) : [];
    return this._addProperty(props, 'settingsInputRow', meta);
  };

  stdPropertyLabelInputs = (): FormBuilder => {
    this.addContextPropertyAutocomplete({ propertyName: 'propertyName', label: 'Property Name', styledLabel: true, size: 'small', validate: { required: true }, jsSetting: true });
    this.addLabelConfigurator({ propertyName: 'hideLabel', label: 'Label', hideLabel: true, fromMetadata: 'label' });
    return this;
  };

  stdPlaceholerDescriptionInputs = (): FormBuilder => {
    this.addSettingsInputRow({
      inputs: [
        { type: 'textField', propertyName: 'placeholder', label: 'Placeholder', size: 'small', jsSetting: true },
        { type: 'textArea', propertyName: 'description', label: 'Tooltip', jsSetting: true },
      ],
    });
    return this;
  };

  stdVisibleEditableInputs = (): FormBuilder => {
    this.addSettingsInputRow({
      inputs: [
        { type: 'switch', propertyName: 'visible', label: 'Visible', jsSetting: true, layout: 'horizontal' },
        { type: 'editModeSelector', propertyName: 'editMode', label: 'Edit Mode', size: 'small', jsSetting: true },
      ],
    });
    return this;
  };

  stdPrefixSuffixInputs = (): FormBuilder => {
    this.addSettingsInputRow({
      inputs: [
        { type: 'textField', propertyName: 'prefix', label: 'Prefix', jsSetting: true },
        { type: 'iconPicker', propertyName: 'prefixIcon', label: 'Prefix Icon', jsSetting: true },
      ],
    });
    this.addSettingsInputRow({
      inputs: [
        { type: 'textField', propertyName: 'suffix', label: 'Suffix', jsSetting: true },
        { type: 'iconPicker', propertyName: 'suffixIcon', label: 'Suffix Icon', jsSetting: true },
      ],
    });
    return this;
  };

  stdCollapsiblePanel = (label: string, components: (fbf: FormBuilder) => FormBuilder, meta?: IPropertyMetadata | undefined): FormBuilder => {
    const contentId = nanoid();
    const fbf = new FormBuilderImplementation(this.componentDefinitions, contentId) as FormBuilder;

    const fixedProps: FluentSettings<ICollapsiblePanelComponentProps> = {
      label: label,
      labelAlign: 'right',
      ghost: true,
      collapsible: 'header',
      isDynamic: true,
      header: {
        id: nanoid(),
        components: [],
      },
      content: {
        id: contentId,
        components: components(fbf).toJson(),
      },
    };

    return this._addProperty(fixedProps, 'collapsiblePanel', meta);
  };

  stdEventHandler = (propertyName: string, label: string, tooltip: string, meta?: IPropertyMetadata | undefined): FormBuilder => {
    this.addSettingsInput({
      inputType: 'codeEditor',
      propertyName: propertyName,
      label: label,
      labelAlign: 'right',
      tooltip: tooltip,
    }, meta);
    return this;
  };

  stdEventHandlers = (events: StandartEventHandler[]): FormBuilder => {
    events.forEach((event) => {
      const eventConfig = eventConfigs.find((e) => e.event === event);
      if (eventConfig)
        this.stdEventHandler(eventConfig.propertyName, eventConfig.label, eventConfig.tooltip);
    });
    return this;
  };

  stdFontPanel = (propertyName: string = 'font'): FormBuilder => {
    this.stdCollapsiblePanel('Font', (f) => f
      .addSettingsInputRow({
        inline: true,
        propertyName: propertyName,
        inputs: [
          { type: 'dropdown', label: 'Family', propertyName: `${propertyName}.type`, hideLabel: true, dropdownOptions: fontTypes },
          { type: 'numberField', label: 'Size', propertyName: `${propertyName}.size`, hideLabel: true, width: 50 },
          { type: 'dropdown', label: 'Weight', propertyName: `${propertyName}.weight`, hideLabel: true, dropdownOptions: fontWeightsOptions, width: 100, tooltip: 'Controls text thickness (light, normal, bold, etc.)' },
          { type: 'colorPicker', label: 'Color', hideLabel: true, propertyName: `${propertyName}.color` },
          { type: 'dropdown', label: 'Align', propertyName: `${propertyName}.align`, hideLabel: true, width: 60, dropdownOptions: textAlignOptions },
        ],
      }));
    return this;
  };

  stdDimensionsPanel = (propertyName: string = 'dimensions'): FormBuilder => {
    this.stdCollapsiblePanel('Dimensions', (f) => f
      .addSettingsInputRow({
        inline: true,
        inputs: [
          { type: 'textField', label: 'Width', width: 85, propertyName: `${propertyName}.width`, icon: 'widthIcon', tooltip: 'You can use any unit (%, px, em, etc). px by default if without unit' },
          { type: 'textField', label: 'Min Width', width: 85, hideLabel: true, propertyName: `${propertyName}.minWidth`, icon: 'minWidthIcon' },
          { type: 'textField', label: 'Max Width', width: 85, hideLabel: true, propertyName: `${propertyName}.maxWidth`, icon: 'maxWidthIcon' },
        ],
      })
      .addSettingsInputRow({
        inline: true,
        inputs: [
          { type: 'textField', label: 'Height', width: 85, propertyName: `${propertyName}.height`, icon: 'heightIcon', tooltip: 'You can use any unit (%, px, em, etc). px by default if without unit' },
          { type: 'textField', label: 'Min Height', width: 85, hideLabel: true, propertyName: `${propertyName}.minHeight`, icon: 'minHeightIcon' },
          { type: 'textField', label: 'Max Height', width: 85, hideLabel: true, propertyName: `${propertyName}.maxHeight`, icon: 'maxHeightIcon' },
        ],
      }));
    return this;
  };

  stdBorderPanel = (): FormBuilder => {
    const bid = nanoid();
    const cid = nanoid();
    const bfb = (): FormBuilder => new FormBuilderImplementation(this.componentDefinitions, bid);
    const cfb = (): FormBuilder => new FormBuilderImplementation(this.componentDefinitions, cid);

    this.stdCollapsiblePanel('Border', (f) => f
      .addContainer({ id: bid, components: getBorderInputs(bfb) })
      .addContainer({ id: cid, components: getCornerInputs(cfb) }));

    return this;
  };

  stdBackgroundtPanel = (): FormBuilder => {
    this.stdCollapsiblePanel('Background', (f) => f
      .addSettingsInput({ label: 'Type', jsSetting: false, propertyName: 'background.type', inputType: 'radio', tooltip: 'Select a type of background', buttonGroupOptions: backgroundTypeOptions })
      .addSettingsInput({ label: 'Color', propertyName: 'background.color', hideLabel: true, jsSetting: false, inputType: 'colorPicker',
        visibleJs: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";',
      })
      .addSettingsInput({ label: 'Colors', inputType: 'multiColorPicker', propertyName: 'background.gradient.colors', jsSetting: false, hideLabel: true,
        visibleJs: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "gradient";',
      })
      .addSettingsInput({ label: 'URL', inputType: 'textField', propertyName: 'background.url', jsSetting: false,
        visibleJs: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "url";',
      })
      .addSettingsInput({ label: 'Image', inputType: 'imageUploader', propertyName: 'background.uploadFile', jsSetting: false,
        visibleJs: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "image";',
      })
      .addSettingsInput({ label: 'File ID', inputType: 'textField', jsSetting: false, propertyName: 'background.storedFile.id',
        visibleJs: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "storedFile";',
      })
      .addSettingsInputRow({
        inline: true,
        visibleJs: 'return !["color", "gradient"].includes(getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type));',
        inputs: [
          { type: 'customDropdown', label: 'Size', hideLabel: true, propertyName: 'background.size', dropdownOptions: sizeOptions,
            customTooltip: 'Size of the background image, two space separated values with units e.g "100% 100px"',
          },
          { type: 'customDropdown', label: 'Position', hideLabel: true, propertyName: 'background.position', dropdownOptions: positionOptions,
            customTooltip: 'Position of the background image, two space separated values with units e.g "5em 100px"',
          },
          { type: 'radio', label: 'Repeat', hideLabel: true, propertyName: 'background.repeat', buttonGroupOptions: repeatOptions },
        ],
      }));
    return this;
  };

  stdShadowPanel = (): FormBuilder => {
    this.stdCollapsiblePanel('Shadow', (f) => f
      .addSettingsInputRow({
        inline: true,
        inputs: [
          { type: 'numberField', label: 'Offset X', hideLabel: true, tooltip: 'Offset X', width: 80, icon: 'offsetHorizontalIcon', propertyName: 'shadow.offsetX' },
          { type: 'numberField', label: 'Offset Y', hideLabel: true, tooltip: 'Offset Y', width: 80, icon: 'offsetVerticalIcon', propertyName: 'shadow.offsetY' },
          { type: 'numberField', label: 'Blur', hideLabel: true, tooltip: 'Blur Radius', width: 80, icon: 'blurIcon', propertyName: 'shadow.blurRadius' },
          { type: 'numberField', label: 'Spread', hideLabel: true, tooltip: 'Spread Radius', width: 80, icon: 'spreadIcon', propertyName: 'shadow.spreadRadius' },
          { type: 'colorPicker', label: 'Color', hideLabel: true, propertyName: 'shadow.color' },
        ],
      }));
    return this;
  };

  stdMarginPaddingPanel = (propertyName: string = 'stylingBox'): FormBuilder => {
    this.stdCollapsiblePanel('Margin & Padding', (f) => f.addStyleBox({ label: 'Margin Padding', hideLabel: true, propertyName: propertyName }));
    return this;
  };

  stdCustomStylePanel = (propertyName: string = 'style'): FormBuilder => {
    this.stdCollapsiblePanel('Custom Styles', (f) => f
      .addSettingsInput({
        inputType: 'codeEditor', propertyName: propertyName, hideLabel: false, label: 'Style',
        description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
      }));
    return this;
  };

  stdAppearancePanels = (appearancePanels: StandartAppearancePanel[]): FormBuilder => {
    const rootId = nanoid();
    const fbf = new FormBuilderImplementation(this.componentDefinitions, rootId);
    fbf.addSettingsInput({
      propertyName: 'enableStyleOnReadonly',
      label: 'Enable Style On Readonly',
      tooltip: 'Removes all visual styling except typography when the component becomes read-only',
      inputType: 'switch',
      jsSetting: true,
    });

    appearancePanels.forEach((panel) => {
      switch (panel) {
        case 'background':
          fbf.stdBackgroundtPanel();
          break;
        case 'shadow':
          fbf.stdShadowPanel();
          break;
        case 'marginPadding':
          fbf.stdMarginPaddingPanel();
          break;
        case 'customStyle':
          fbf.stdCustomStylePanel();
          break;
        case 'font':
          fbf.stdFontPanel();
          break;
        case 'dimensions':
          fbf.stdDimensionsPanel();
          break;
        case 'border':
          fbf.stdBorderPanel();
          break;
      }
    });

    this.addPropertyRouter({
      id: rootId,
      propertyName: 'propertyRouter1',
      componentName: 'propertyRouter',
      label: 'Property router1',
      labelAlign: 'right',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
      propertyRouteName: { _code: "return contexts.canvasContext?.designerDevice || 'desktop';", _mode: 'code', _value: '' } as any,
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

  constructor(componentDefinitions?: Map<string, IToolboxComponent>, rootId?: string) {
    this.componentDefinitions = componentDefinitions;
    this.form = [];
    this.rootId = rootId ?? nanoid();
  }

  private _addProperty(props: FluentSettings<IConfigurableFormComponent>, type: ComponentTypes, meta?: IPropertyMetadata): FormBuilder {
    const { id, hidden, visible, visibleJs, version, parentId, ...restProps } = this._updateMetadataValue(props);

    const componentDefinition = this.getComponentDefinition(type);

    let formComponent: IConfigurableFormComponent = {
      ...restProps, // use restProps for correct migrations (migrations can initialise some properties depends on other properties)
      id: id ?? nanoid(),
      parentId: parentId ?? this.rootId,

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

  toJson(): IConfigurableFormComponent[] {
    return this.form;
  }

  build(): string {
    return JSON.stringify(this.form);
  }
};

export const makeFormBuliderFactory: () => FormBuilderFactory = () => {
  const components = getComponentDefinitions();
  return (rootId?: string) => new FormBuilderImplementation(components, rootId);
};
