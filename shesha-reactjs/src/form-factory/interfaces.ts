import { AlertComponentDefinition } from '@/designer-components/alert/interfaces';
import { AutocompleteComponentDefinition } from '@/designer-components/autocomplete/interfaces';
import { ButtonsComponentDefinition } from '@/designer-components/button/buttonGroup/buttonsComponent/interfaces';
import { CheckboxComponentDefinition } from '@/designer-components/checkbox/interfaces';
import { CodeEditorComponentDefinition } from '@/designer-components/codeEditor/interfaces';
import { CollapsiblePanelComponentDefinition } from '@/designer-components/collapsiblePanel/interfaces';
import { ColorPickerComponentDefinition } from '@/designer-components/colorPicker/interfaces';
import { ColumnsComponentDefinition } from '@/designer-components/columns/interfaces';
import { ConfigurableActionConfiguratorComponentDefinition } from '@/designer-components/configurableActionsConfigurator/interfaces';
import { EntityTypeAutocompleteComponentDefinition } from '@/designer-components/configurableItemAutocomplete/entityTypeAutocomplete/interfaces';
import { ContainerComponentDefinition } from '@/designer-components/container/interfaces';
import { ContextPropertyAutocompleteComponentDefinition } from '@/designer-components/contextPropertyAutocomplete/interfaces';
import { DataContextComponentDefinition } from '@/designer-components/dataContextComponent/interfaces';
import { PagerComponentDefinition } from '@/designer-components/dataTable/pager/interfaces';
import { QuickSearchComponentDefinition } from '@/designer-components/dataTable/quickSearch/interfaces';
import { ColumnsEditorComponentDefinition } from '@/designer-components/dataTable/table/columnsEditor/interfaces';
import { TableComponentDefinition } from '@/designer-components/dataTable/table/models';
import { TableContextComponentDefinition, TableContextComponentLegacyDefinition as DataTableContextComponentDefinition } from '@/designer-components/dataTable/tableContext/models';
import { TableViewSelectorComponentDefinition } from '@/designer-components/dataTable/tableViewSelector/models';
import { DateFieldDefinition } from '@/designer-components/dateField/interfaces';
import { DropdownComponentDefinition } from '@/designer-components/dropdown/model';
import { EditableTagGroupComponentDefinition } from '@/designer-components/editableTagGroup/interfaces';
import { EditModeSelectorComponentDefinition } from '@/designer-components/editModeSelector/interfaces';
import { EndpointsAutocompleteComponentDefinition } from '@/designer-components/endpointsAutocomplete/interfaces';
import { FileUploadComponentDefinition } from '@/designer-components/fileUpload/interfaces';
import { FormAutocompleteComponentDefinition } from '@/designer-components/formAutocomplete/interfaces';
import { IconPickerComponentDefinition } from '@/designer-components/iconPicker/interfaces';
import { KeyInformationBarComponentDefinition } from '@/designer-components/keyInformationBar/interfaces';
import { LabelValueEditorComponentDefinition } from '@/designer-components/labelValueEditor/interfaces';
import { LinkComponentDefinition } from '@/designer-components/link/interfaces';
import { NumberFieldComponentDefinition } from '@/designer-components/numberField/interfaces';
import { PermissionAutocompleteComponentDefinition } from '@/designer-components/permissions/permissionAutocomplete/interfaces';
import { SearchableTabsDefinition } from '@/designer-components/propertiesTabs/interfaces';
import { PropertyAutocompleteComponentDefinition } from '@/designer-components/propertyAutocomplete/interfaces';
import { PropertyRouterComponentDefinition } from '@/designer-components/propertyRouter/interfaces';
import { QueryBuilderComponentDefinition } from '@/designer-components/queryBuilder/interfaces';
import { RadioComponentDefinition } from '@/designer-components/radio/interfaces';
import { ReferenceListAutocompleteComponentDefinition } from '@/designer-components/referenceListAutocomplete/interfaces';
import { SectionSeparatorComponentDefinition } from '@/designer-components/sectionSeprator/interfaces';
import { SettingsInputDefinition } from '@/designer-components/settingsInput/interfaces';
import { SettingsInputRowDefinition } from '@/designer-components/settingsInputRow/interfaces';
import { SliderComponentDefinition } from '@/designer-components/slider/interfaces';
import { StyleBoxDefinition } from '@/designer-components/styleBox/interfaces';
import { LabelConfiguratorDefinition } from '@/designer-components/styleLabel/interfaces';
import { SwitchComponentDefinition } from '@/designer-components/switch/interfaces';
import { TabsComponentDefinition } from '@/designer-components/tabs/models';
import { TextComponentDefinition } from '@/designer-components/text/models';
import { TextAreaComponentDefinition } from '@/designer-components/textArea/interfaces';
import { TextFieldComponentDefinition } from '@/designer-components/textField/interfaces';
import { TimeFieldComponentDefinition } from '@/designer-components/timeField/models';
import { ComponentDefinition, EditMode, IConfigurableFormComponent, IPropertyMetadata, IPropertySetting } from '@/interfaces';

// Create a union of all your component definitions
type AllComponentDefinitions =
  AlertComponentDefinition |
  AutocompleteComponentDefinition |
  ButtonsComponentDefinition |
  CheckboxComponentDefinition |
  CodeEditorComponentDefinition |
  CollapsiblePanelComponentDefinition |
  ColorPickerComponentDefinition |
  ColumnsComponentDefinition |
  ConfigurableActionConfiguratorComponentDefinition |
  EntityTypeAutocompleteComponentDefinition |
  ContainerComponentDefinition |
  ContextPropertyAutocompleteComponentDefinition |
  DataContextComponentDefinition |
  PagerComponentDefinition |
  QuickSearchComponentDefinition |
  TableComponentDefinition |
  ColumnsEditorComponentDefinition |
  TableContextComponentDefinition |
  TableViewSelectorComponentDefinition |
  DateFieldDefinition |
  DropdownComponentDefinition |
  EditableTagGroupComponentDefinition |
  EndpointsAutocompleteComponentDefinition |
  FileUploadComponentDefinition |
  FormAutocompleteComponentDefinition |
  IconPickerComponentDefinition |
  ColumnsComponentDefinition |
  LabelValueEditorComponentDefinition |
  NumberFieldComponentDefinition |
  PermissionAutocompleteComponentDefinition |
  PropertyAutocompleteComponentDefinition |
  PropertyRouterComponentDefinition |
  QueryBuilderComponentDefinition |
  RadioComponentDefinition |
  ReferenceListAutocompleteComponentDefinition |
  SectionSeparatorComponentDefinition |
  SettingsInputDefinition |
  SettingsInputRowDefinition |
  SliderComponentDefinition |
  StyleBoxDefinition |
  LabelConfiguratorDefinition |
  SwitchComponentDefinition |
  TabsComponentDefinition |
  TextComponentDefinition |
  TextAreaComponentDefinition |
  TextFieldComponentDefinition |
  TimeFieldComponentDefinition |
  SearchableTabsDefinition |
  LinkComponentDefinition |
  EditModeSelectorComponentDefinition |
  KeyInformationBarComponentDefinition |
  DataTableContextComponentDefinition;

export type ComponentTypes = AllComponentDefinitions["type"];

/** Convertto camelCase */
export type ToCamelCase<T> =
  T extends `${infer First}.${infer Rest}`
    ? `${First}${Capitalize<ToCamelCase<Rest>>}`
    : T;
/** Convert to PascalCase */
export type ToPascalCase<T> = T extends string ? Capitalize<ToCamelCase<T>> : never;

/** Make property optional */
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/** Omit property and keep union type properties */
type CustomOmit<T, K extends keyof T> = {
  [P in keyof T as P extends K ? never : P]: T[P]
};

/** Extract settings from component definition */
export type FluentSettings<T extends IConfigurableFormComponent> = CustomOmit<T, "id" | "type" | "hidden"> & {
  id?: string;
  // ToDo: AS - remove hidden from this check
  /** @deprecated Use `visible` instead (inverson of `hidden`) */
  hidden?: boolean | IPropertySetting<boolean>;
  visible?: boolean;
  visibleJs?: string;

  fromMetadata?: string | undefined;
  fromMetadataToProperty?: string | undefined;
  metadataValue?: string | number | boolean | EditMode | IPropertySetting<unknown> | undefined;
};

/** Extract settings from component definition */
export type ExtractComponentSettings<TDef extends ComponentDefinition> = TDef extends ComponentDefinition<infer _TType, infer TSettings> ? FluentSettings<TSettings> : never;

/** Extract config for all components */
export type AllComponentsConfig<T extends AllComponentDefinitions = AllComponentDefinitions> = {
  [K in T["type"]]: Extract<T, { type: K }> extends ComponentDefinition<infer _TType, infer TSettings> ? FluentSettings<TSettings> : never;
};

export type StandartEventHandler = 'onChange' | 'onBlur' | 'onFocus' | 'onClick';
export type StandartAppearancePanel = 'font' | 'dimensions' | 'border' | 'shadow' | 'background' | 'customStyle' | 'marginPadding';

/** Fluent form builder */
export type FluentFormBuilder<
  TConfig extends Record<ComponentTypes, object>,
> = {
  [K in keyof TConfig as `add${ToPascalCase<K>}`]: K extends string
    ? (props: TConfig[K], metadata?: IPropertyMetadata) => FluentFormBuilder<TConfig>
    : never;
} & {
  // build actions
  build(): string;
  toJson(): IConfigurableFormComponent[];
} & {
  // standart components and coponents groups
  stdPrefixSuffixInputs(): FluentFormBuilder<TConfig>;
  stdVisibleEditableInputs(): FluentFormBuilder<TConfig>;
  stdPropertyLabelInputs(): FluentFormBuilder<TConfig>;
  stdPlaceholerDescriptionInputs(): FluentFormBuilder<TConfig>;
  stdCollapsiblePanel(label: string, components: (fbf: FormBuilder) => FormBuilder, meta?: IPropertyMetadata | undefined): FluentFormBuilder<TConfig>;
  stdEventHandler(propertyName: string, label: string, tooltip: string, meta?: IPropertyMetadata | undefined): FluentFormBuilder<TConfig>;
  stdEventHandlers(events: StandartEventHandler[]): FluentFormBuilder<TConfig>;
  stdFontPanel(propertyName?: string): FluentFormBuilder<TConfig>;
  stdDimensionsPanel(propertyName?: string): FluentFormBuilder<TConfig>;
  stdBorderPanel(): FluentFormBuilder<TConfig>;
  stdBackgroundtPanel(): FluentFormBuilder<TConfig>;
  stdShadowPanel(): FluentFormBuilder<TConfig>;
  stdMarginPaddingPanel(propertyName?: string): FluentFormBuilder<TConfig>;
  stdCustomStylePanel(propertyName?: string): FluentFormBuilder<TConfig>;
  stdAppearancePanels(appearancePanels: StandartAppearancePanel[]): FluentFormBuilder<TConfig>;
};

/** Fluent form builder */
export type FormBuilder = FluentFormBuilder<AllComponentsConfig>;

/** Fluent form builder factory */
export type FormBuilderFactory = (rootId?: string) => FormBuilder;
