/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Allowed border line styles.
 * - `"dashed"`: dashed line
 * - `"dotted"`: dotted line
 * - `"none"`: no border
 * - `"solid"`: solid line
 */
export type IBorderType = "dashed" | "dotted" | "none" | "solid";

export interface IBorderLineValue {
  /** Border thickness */
  readonly width?: string | number | undefined;
  /** Border color (CSS color string) */
  readonly color?: string | undefined;
  /** Allowed border line styles.
   * - `"dashed"`: dashed line
   * - `"dotted"`: dotted line
   * - `"none"`: no border
   * - `"solid"`: solid line*/
  readonly style?: IBorderType | undefined;
}

/**
 * Configuration for borders and border radius of a component.
 * All properties are read‑only – modify them through the parent `border` property.
 */
export interface IBorderValue {
  /** Border radius settings for rounding corners. */
  readonly radius?: {
    /** Same radius for all four corners. */
    readonly all?: string | number | undefined;
    /** Radius for the top‑left corner. */
    readonly topLeft?: string | number | undefined;
    /** Radius for the top‑right corner. */
    readonly topRight?: string | number | undefined;
    /** Radius for the bottom‑left corner. */
    readonly bottomLeft?: string | number | undefined;
    /** Radius for the bottom‑right corner. */
    readonly bottomRight?: string | number | undefined;
  } | undefined;
  /** Border line settings for each side and an optional middle border. */
  readonly border?: {
    /** Same border settings for all four sides. */
    readonly all?: IBorderLineValue | undefined;
    /** Border settings specifically for the top side. */
    readonly top?: IBorderLineValue | undefined;
    /** Border settings specifically for the right side. */
    readonly right?: IBorderLineValue | undefined;
    /** Border settings specifically for the bottom side. */
    readonly bottom?: IBorderLineValue | undefined;
    /** Border settings specifically for the left side. */
    readonly left?: IBorderLineValue | undefined;
    /** Border settings for an additional middle border (e.g., between cells). */
    readonly middle?: IBorderLineValue | undefined;
  } | undefined;
  readonly radiusType?: 'all' | 'custom' | undefined;
  readonly borderType?: 'all' | 'custom' | undefined;
  readonly hideBorder?: boolean | undefined;
}

/** Background fill or image configuration for a component. All properties are read‑only – modify them through the parent `background` property. */
export interface IBackgroundValue {
  /** Type of background.
   * - `"color"`: solid color fill
   * - `"url"`: external image URL
   * - `"image"`: internal image resource
   * - `"storedFile"`: reference to a stored file
   * - `"gradient"`: CSS gradient */
  readonly type?: 'color' | 'url' | 'image' | 'storedFile' | 'gradient' | undefined;

  /** Background image sizing. Standard CSS `background-size` values are accepted. */
  readonly size?: 'cover' | 'contain' | 'auto' | string | undefined;

  /** Background image position. Standard CSS `background-position` values are accepted. */
  readonly position?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top left' | 'top right' | 'bottom left' | 'bottom right' | string | undefined;

  /** Background image repetition behaviour. Standard CSS `background-repeat` values. */
  readonly repeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y' | 'round' | undefined;

  /** Gradient configuration – required when `type = "gradient"`.
   * - `direction`: gradient direction (e.g., `"to right"`, `"45deg"`)
   * - `colors`: color stops in render order (e.g., `["#fff", "#000"]`) */
  readonly gradient?: { direction?: string | undefined; colors?: string[] | undefined } | undefined;

  /** Solid color string (CSS format) – used when `type = "color"`. */
  readonly color?: string | undefined;

  /** External image URL – used when `type = "url"`. */
  readonly url?: string | undefined;

  /** Reference to a stored file (e.g., from asset manager) – used when `type = "storedFile"`. */
  readonly storedFile?: { id: string } | undefined;
}

export type TextAlignSetting = "center" | "end" | "left" | "right" | "start";

export interface IFontValue {
  /** **Font size**. Read-only.
   *
   * To change it, use the `font` property, for example: `components.textField.font = {size: 14}`
   *
   * To restore original value use `components.textField.font = {size: undefined}` */
  readonly size?: number | undefined;
  /** **Font family**. Read-only.
   *
   * To change it, use the `font` property, for example: `components.textField.font = {family: 'Arial'}`
   *
   * To restore original value use `components.textField.font = {family: undefined}` */
  readonly type?: string | undefined;
  /** **Font weight**. Read-only.
   *
   * To change it, use the `font` property, for example: `components.textField.font = {weight: '400'}`
   *
   * To restore original value use `components.textField.font = {weight: undefined}` */
  readonly weight?: string | undefined;
  /** **Font color**. Read-only.
   *
   * To change it, use the `font` property, for example: `components.textField.font = {color: '#000'}`
   *
   * To restore original value use `components.textField.font = {color: undefined}` */
  readonly color?: string | undefined;
  /** **Font align**. Read-only.
   *
   * To change it, use the `font` property, for example: `components.textField.font = {align: 'left'}`
   *
   * To restore original value use `components.textField.font = {align: undefined}` */
  readonly align?: TextAlignSetting | undefined;
  /** **Font transform**.
   *
   * Read-only. To change it, use the `font` property, for example: `components.textField.font = {transform: 'uppercase'}`
   *
   * To restore original value use `components.textField.font = {transform: undefined}` */
  readonly transform?: string | undefined;
}

export interface IShadowValue {
  readonly offsetX?: number | undefined;
  readonly offsetY?: number | undefined;
  readonly blurRadius?: number | undefined;
  readonly spreadRadius?: number | undefined;
  readonly color?: string | undefined;
}

export interface PaddingValues {
  readonly paddingTop?: string | number | undefined;
  readonly paddingRight?: string | number | undefined;
  readonly paddingBottom?: string | number | undefined;
  readonly paddingLeft?: string | number | undefined;
}

export interface MarginValues {
  readonly marginTop?: string | number | undefined;
  readonly marginRight?: string | number | undefined;
  readonly marginBottom?: string | number | undefined;
  readonly marginLeft?: string | number | undefined;
}

export interface IStyleBoxValue extends MarginValues, PaddingValues {}

export interface FontStyles {
  /** **Font style**
   *
   * If you want to customize font styles for a component, use this property and specify values in the object's properties, for example:
   *
   * `components.textField.font = {size: 14, weight: '400', color: '#000'};`. The specified properties will be used, the rest will not be changed.
   *
   * If you want to use the original values, specify `undefined` for the properties, for example:
   *
   * `components.textField.font = {size: undefined};` or `components.textField.font = undefined;`
   *
   * Nested fields are read-only
   */
  font?: IFontValue | undefined;
}

export interface BackgroundStyles {
  /** **Background style**
   *
   * If you want to customize background styles for a component, use this property and specify values in the object's properties, for example:
   *
   * `components.textField.background = {type: 'color', color: '#000'};`. The specified properties will be used, the rest will not be changed.
   *
   * If you want to use the original values, specify `undefined` for the properties, for example:
   *
   * `components.textField.background = {color: undefined};` or `components.textField.background = undefined;`
   *
   * Nested fields are read-only
   */
  background?: IBackgroundValue | undefined;
}

export interface BorderStyles {
  /** **Border style**
   *
   * If you want to customize border styles for a component, use this property and specify values in the object's properties, for example:
   *
   * `components.textField.border = {radius: { all: 5 }};`. The specified properties will be used, the rest will not be changed.
   *
   * If you want to use the original values, specify `undefined` for the properties, for example:
   *
   * `components.textField.border = {radius: { all: undefined }};` or `components.textField.border = undefined;`
   *
   * Nested fields are read-only
   */
  border?: IBorderValue | undefined;
}

export interface IShadowStyles {
  /** **Shadow style**
   *
   * If you want to customize shadow styles for a component, use this property and specify values in the object's properties, for example:
   *
   * `components.textField.sahdow = {offsetX: 5, offsetY: 5, blurRadius: 10, spreadRadius: 3, color: 'black'};`. The specified properties will be used, the rest will not be changed.
   *
   * If you want to use the original values, specify `undefined` for the properties, for example:
   *
   * `components.textField.sahdow = {offsetX: undefined, offsetY: undefined, blurRadius: undefined, spreadRadius: undefined, color: undefined};` or `components.textField.border = undefined;`
   *
   * Nested fields are read-only
   */
  shadow?: IShadowValue | undefined;
}

export interface MarginStyles {
  /** **Margin style**
   *
   * If you want to customize margin styles for a component, use this property and specify values in the object's properties, for example:
   *
   * `components.textField.styleBox = {marginLeft: 5};`. The specified properties will be used, the rest will not be changed.
   *
   * If you want to use the original values, specify `undefined` for the properties, for example:
   *
   * `components.textField.styleBox = {marginLeft: undefined};`
   *
   * Nested fields are read-only
   */
  styleBox?: MarginValues | undefined;
}

export interface PaddingStyles {
  /** **Padding style**
   *
   * If you want to customize padding styles for a component, use this property and specify values in the object's properties, for example:
   *
   * `components.textField.styleBox = {paddingLeft: 5};`. The specified properties will be used, the rest will not be changed.
   *
   * If you want to use the original values, specify `undefined` for the properties, for example:
   *
   * `components.textField.styleBox = {paddingLeft: undefined};`
   *
   * Nested fields are read-only
   */
  styleBox?: PaddingValues | undefined;
}

export interface StyleBoxStyles {
  /** **Margin and Padding style**
   *
   * If you want to customize padding styles for a component, use this property and specify values in the object's properties, for example:
   *
   * `components.textField.styleBox = {paddingLeft: 5};`. The specified properties will be used, the rest will not be changed.
   *
   * If you want to use the original values, specify `undefined` for the properties, for example:
   *
   * `components.textField.styleBox = {paddingLeft: undefined};`
   *
   * Nested fields are read-only
   */
  styleBox?: (PaddingValues & MarginValues) | undefined;
}


export interface IComponentStyle extends FontStyles, BackgroundStyles, BorderStyles, IShadowStyles, StyleBoxStyles {
}

export interface InputStyles {
  /** Styles for the input element of the component */
  readonly editor: Omit<IComponentStyle, 'styleBox'> & PaddingStyles;
  /** Styles for the wrapper element of the component */
  readonly wrapper: MarginStyles;
}

export interface InputComponentStyles {
  /** Current styles overrides applied to the component. */
  readonly styles: InputStyles;
}

export interface AnyComponentStyles {
  /** Current styles overrides applied to the component. */
  readonly styles: any;
};


export type InteractionMode = 'editable' | 'readOnly' | 'disabled' | 'inherited' | boolean;

export interface BaseComponentApi {
  /** Name of the component (e.g., `"textField"`, `"numberField"`). */
  readonly componentName: string;
  /** Context to which the component is bound (e.g., formContext, pageContext, undefined for form data). */
  readonly context?: string | undefined;
  /** Name of the property this component is bound to. */
  readonly propertyName: string;
  /** Whether the component is visible in the UI. */
  visible: boolean;
  /** Current interaction mode of the component. */
  interactionMode: InteractionMode | undefined;
}

export interface CommonComponentApi extends BaseComponentApi {
  /** Current styles overrides applied to the component. */
  readonly styles: IComponentStyle;
}

/**
 * Everything an input exposes **except** its value: focus, validation and the required flag.
 *
 * Split out so a component whose value cannot be assigned can inherit the rest without also
 * inheriting a writable `value`. Redeclaring `value` as `readonly` on a subinterface is not enough
 * on its own — `readonly` is not part of assignability, so widening the object back to
 * `InputComponentApi` restores the write.
 */
export interface InputComponentApiBase extends BaseComponentApi {
  /** If 'true', the component is required (for now is working only for binding to the form data) */
  required: boolean;

  /** Focus on component */
  focus(): void;

  /** Check if component's value is valid (for now is working only for binding to the form data) */
  isValid(): Promise<boolean>;
  /** Get component's errors (for now is working only for binding to the form data) */
  getErrors(): Promise<string[]>;
  /** Reset to the default value (for now is working only for binding to the form data) */
  reset(): void;
}

export interface InputComponentApi<T = unknown> extends InputComponentApiBase {
  /** Component value. Readable and writable */
  value: T;
}

// Components API

export type TextFieldApi = InputComponentApi<string | undefined> & InputComponentStyles;

export type TextAreaApi = InputComponentApi<string | undefined> & InputComponentStyles;

export interface NumberFieldApi extends InputComponentApi<number | undefined>, InputComponentStyles {
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
};

/** A single selectable option of a radio group. */
export interface RadioOption {
  /** Text displayed next to the radio button. */
  readonly label: string;
  /** Value assigned to the component when this option is selected. */
  readonly value: string | number | undefined;
}

export interface RadioApi extends InputComponentApi<number | string | undefined> {
  /** Options currently displayed by the radio group, whatever the configured data source is. Read-only. */
  readonly options: readonly RadioOption[];
};

export type CheckboxFieldApi = InputComponentApi<boolean | undefined>;

export type DropdownApi = InputComponentApi<number | number[] | string | string[] | (string | number)[] | undefined>;

/**
 * Status tag. A specialised drop-down that displays the bound status rather than capturing it, so
 * its value is read-only and there is no `focus` — the component renders a tag, which is not
 * focusable.
 */
export interface StatusTagApi extends Omit<InputComponentApiBase, 'focus'> {
  /** The bound status value. Read-only: the component displays a status, it does not set one. */
  readonly value: number | number[] | string | string[] | (string | number)[] | undefined;
  /** Text shown on the tag for the current value, or the list of them in multi-select. Read-only. */
  readonly itemText: string | string[] | undefined;
};

/**
 * Autocomplete. The value shape follows the component's Value Format setting: a plain key for
 * `simple`, an entity reference object for `entityReference`, or whatever the configured Value
 * Function returns for `custom`. In multiple selection mode it is an array of those.
 */
export interface AutocompleteApi extends InputComponentApi<unknown> {
  /** Whether the component currently allows selecting more than one item. Read-only. */
  readonly multiple: boolean;
};

/**
 * How an entity reference is opened.
 * - `"NavigateLink"`: navigates to the target form
 * - `"Quickview"`: opens a read-only popover
 * - `"Dialog"`: opens a modal
 *
 * Declared here rather than imported so this file stays self-contained: it is shipped verbatim
 * into the JS editors, where a path alias would not resolve.
 */
export type EntityReferenceTypes = "Dialog" | "NavigateLink" | "Quickview";

/**
 * Entity reference. The value is the referenced entity's id — either stored directly as a string,
 * or normalised out of an `{ id, _className, _displayName }` object bound from the form data.
 */
export interface EntityReferenceApi extends InputComponentApi<string | undefined> {
  /** Id of the entity the component currently points at, or `undefined` when nothing is selected. Read-only. */
  readonly entityId: string | undefined;
  /** How the reference is opened. Read-only. */
  readonly entityReferenceType: EntityReferenceTypes | undefined;
};

/** Checkbox group. Multi-select only, so the value is always the list of selected item values. */
export type CheckboxGroupApi = InputComponentApi<string[] | undefined>;

export type SwitchFieldApi = InputComponentApi<boolean | undefined>;

/**
 * File upload. The value is the stored file the component is bound to: its id once the file has been
 * persisted, the `File` itself while a synchronous upload is still pending, or `null` when no file is
 * attached. Setting it to `null` clears the component.
 */
export interface FileUploadApi extends InputComponentApi<File | string | null | undefined> {
  /** Whether the user can currently upload a file. Combines the Allow Upload setting with the interaction mode. */
  readonly allowUpload: boolean;
  /** Whether the user can currently replace the attached file. Combines the Allow Replace setting with the interaction mode. */
  readonly allowReplace: boolean;
  /** Whether the user can currently delete the attached file. Combines the Allow Delete setting with the interaction mode. */
  readonly allowDelete: boolean;
  /** File extensions the component accepts, e.g. `[".png", ".pdf"]`. An empty list accepts any type. */
  allowedFileTypes: string[] | undefined;
};

/**
 * File list. The value is the collection of files currently attached to the component's owner.
 *
 * **Read-only.** The files belong to the storage provider, keyed by owner — they are not part of the
 * form payload. The component binds to a ghost property that `removeGhostKeys` strips before save,
 * and `AttachmentsEditorProvider` takes no `value` prop, so an assignment here would update neither
 * the stored collection nor anything that is persisted. Files are added, replaced and removed by the
 * user through the component itself, or through the storage provider's own API.
 */
export interface FileListApi extends InputComponentApiBase {
  /**
   * The files currently attached to the owner. Read-only, and so is the array: the collection is the
   * storage provider's, so replacing it or mutating it in place changes nothing that is persisted.
   */
  readonly value: readonly StoredFileApiModel[] | undefined;
  /** Whether the user can currently add files. Combines the Allow Add setting with the interaction mode. */
  readonly allowAdd: boolean;
  /** Whether the user can currently delete files. Combines the Allow Remove setting with the interaction mode. */
  readonly allowDelete: boolean;
  /** Whether the user can currently replace a file. Combines the Allow Replace setting with the interaction mode. */
  readonly allowReplace: boolean;
  /** Whether the user can currently rename a file. Combines the Allow Rename setting with the interaction mode. */
  readonly allowRename: boolean;
  /** File extensions the component accepts, e.g. `[".png", ".pdf"]`. An empty list accepts any type. */
  allowedFileTypes: string[] | undefined;
};

/** One file in a File list. Mirrors the stored-file record the back-end returns. */
export interface StoredFileApiModel {
  /** Identifier of the persisted file. */
  readonly id: string;
  /** File name including its extension. */
  readonly name: string;
  /** Size of the file in bytes. */
  readonly size: number;
  /** MIME type reported for the file. */
  readonly type: string;
  /** Url the file can be downloaded from. */
  readonly url: string | undefined;
}

/**
 * Reference list status. The value is the item value of the reference list item currently displayed,
 * so writing it switches the component to the matching status.
 */
export interface RefListStatusApi extends InputComponentApi<number | undefined> {
  /** Text shown for the current item, taken from the reference list. Read-only. */
  readonly itemText: string | undefined;
};

/**
 * Date field. The value is the serialised date as stored in the form data, so its shape follows the
 * component's Binding Format; when Range is enabled it is a `[start, end]` pair instead.
 */
export interface DateFieldApi extends InputComponentApi<string | [string | null, string | null] | null | undefined> {
  /** Whether the component is currently picking a range rather than a single date. Read-only. */
  readonly isRange: boolean;
};

/**
 * Address field. The value is the formatted address as entered or as selected from the Google
 * Places suggestions.
 */
export type AddressApi = InputComponentApi<string | undefined>;

/** A single entity selected in an entity picker. */
export interface EntityPickerSelection {
  /** Id of the selected entity. */
  readonly id: string;
  /** Text shown for the entity, taken from the configured Display Property. */
  readonly displayName: string;
};

/**
 * Entity picker. The value follows the component's Value Format: a plain id string with `simple`,
 * an entity reference object with `entityReference`, or whatever the custom scripts return. When
 * Selection Type is Multiple the value is the corresponding array instead.
 */
export interface EntityPickerApi extends InputComponentApi<string | string[] | EntityReferenceValue | EntityReferenceValue[] | undefined> {
  /** Entities currently selected, whatever the configured Value Format is. Read-only. */
  readonly selectedItems: readonly EntityPickerSelection[];
  /** Open the selection dialog. */
  showPicker(): void;
  /** Close the selection dialog. */
  hidePicker(): void;
};

/** An entity reference as stored by a component bound with the `entityReference` value format. */
export interface EntityReferenceValue {
  /** Id of the entity. */
  id: string;
  /** Display text of the entity. */
  _displayName: string;
  /** Full class name of the entity type. */
  _className: string;
};

/**
 * Icon picker. The value is the name of the selected Ant Design icon (for example
 * `"HeartOutlined"`), or `undefined` when no icon is selected.
 */
export type IconPickerApi = InputComponentApi<string | undefined>;

export interface PanelApi extends CommonComponentApi {
  /** Whether the panel is expanded */
  isExpanded: boolean;
  /** Expand the panel */
  expand(): void;
  /** Collapse the panel */
  collapse(): void;
};

/** A single note listed by the notes component. */
export interface NotesApiNote {
  /** Unique identifier of the note. */
  readonly id: string;
  /** Text of the note. */
  readonly noteText: string;
  /** Category the note belongs to, `null` when it is uncategorised. */
  readonly category: string | null;
  /** When the note was created. */
  readonly creationTime: string;
}

/**
 * Notes editor. It is not bound to a form value — the notes live against the owner entity — so it
 * exposes the notes it is showing and the owner it is showing them for, rather than a `value`.
 */
export interface NotesApi extends CommonComponentApi {
  /** Notes currently listed by the component, newest first. */
  readonly notes: ReadonlyArray<NotesApiNote>;
  /** Id of the entity the notes belong to. */
  readonly ownerId: string;
  /** Category used to filter the notes, `undefined` when all notes are shown. */
  readonly category: string | undefined;
  /** Whether notes are being loaded from the backend. */
  readonly isFetchingNotes: boolean;
  /** Post a new note against the current owner. */
  createNote(noteText: string): Promise<void>;
  /** Replace the text of the note with the given id. */
  updateNote(id: string, noteText: string): Promise<void>;
  /** Delete the note with the given id. */
  deleteNote(id: string): Promise<void>;
};

export interface ButtonApi extends CommonComponentApi {
  /** Focus on component */
  focus(): void;
  /** Click on button */
  click(): void;
};

export interface AlertApi extends CommonComponentApi {
  /** Text of the alert */
  text?: string;
  /** Description of the alert */
  description?: string;
};

export interface SubFormApi extends BaseComponentApi {
  /** Get sub form data from the backend */
  getSubFormData(): void;
  /** Post sub form data to the backend */
  postSubFormData(): void;
  /** Put sub form data to the backend */
  putSubFormData(): void;
}

export interface TabsApiTab {
  visible: boolean;
  readonly key: string;
  select(): void;
}

export interface TabsApi extends CommonComponentApi {
  /** Current visible tab. The tab index starts from zero */
  currentTab?: number | undefined;
  /** List of tabs */
  readonly tabs: TabsApiTab[];
}


export type DataContextApi = BaseComponentApi;
