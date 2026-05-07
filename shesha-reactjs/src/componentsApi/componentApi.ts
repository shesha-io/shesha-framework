/**
 * Allowed border line styles.
 * - `"dashed"`: dashed line
 * - `"dotted"`: dotted line
 * - `"none"`: no border
 * - `"solid"`: solid line
 */
export type IBorderType = "dashed" | "dotted" | "none" | "solid";

/**
 * Configuration for borders and border radius of a component.
 * All properties are read‑only – modify them through the parent `border` property.
 */
export interface IBorderValue {
  /** Border radius settings for rounding corners. */
  readonly radius?: {
    /** Same radius for all four corners. */
    readonly all?: string | number;
    /** Radius for the top‑left corner. */
    readonly topLeft?: string | number;
    /** Radius for the top‑right corner. */
    readonly topRight?: string | number;
    /** Radius for the bottom‑left corner. */
    readonly bottomLeft?: string | number;
    /** Radius for the bottom‑right corner. */
    readonly bottomRight?: string | number;
  };
  /** Border line settings for each side and an optional middle border. */
  readonly border?: {
    /** Same border settings for all four sides. */
    readonly all?: {
      /** Border thickness */
      readonly width?: string | number;
      /** Border color (CSS color string) */
      readonly color?: string;
      /** Allowed border line styles.
       * - `"dashed"`: dashed line
       * - `"dotted"`: dotted line
       * - `"none"`: no border
       * - `"solid"`: solid line*/
      readonly style?: IBorderType;
    };
    /** Border settings specifically for the top side. */
    readonly top?: {
      /** Border thickness */
      readonly width?: string | number;
      /** Border color (CSS color string) */
      readonly color?: string;
      /** Allowed border line styles.
       * - `"dashed"`: dashed line
       * - `"dotted"`: dotted line
       * - `"none"`: no border
       * - `"solid"`: solid line*/
      readonly style?: IBorderType;
    };
    /** Border settings specifically for the right side. */
    readonly right?: {
      /** Border thickness */
      readonly width?: string | number;
      /** Border color (CSS color string) */
      readonly color?: string;
      /** Allowed border line styles.
       * - `"dashed"`: dashed line
       * - `"dotted"`: dotted line
       * - `"none"`: no border
       * - `"solid"`: solid line*/
      readonly style?: IBorderType;
    };
    /** Border settings specifically for the bottom side. */
    readonly bottom?: {
      /** Border thickness */
      readonly width?: string | number;
      /** Border color (CSS color string) */
      readonly color?: string;
      /** Allowed border line styles.
       * - `"dashed"`: dashed line
       * - `"dotted"`: dotted line
       * - `"none"`: no border
       * - `"solid"`: solid line*/
      readonly style?: IBorderType;
    };
    /** Border settings specifically for the left side. */
    readonly left?: {
      /** Border thickness */
      readonly width?: string | number;
      /** Border color (CSS color string) */
      readonly color?: string;
      /** Allowed border line styles.
       * - `"dashed"`: dashed line
       * - `"dotted"`: dotted line
       * - `"none"`: no border
       * - `"solid"`: solid line*/
      readonly style?: IBorderType;
    };
    /** Border settings for an additional middle border (e.g., between cells). */
    readonly middle?: {
      /** Border thickness */
      readonly width?: string | number;
      /** Border color (CSS color string) */
      readonly color?: string;
      /** Allowed border line styles.
       * - `"dashed"`: dashed line
       * - `"dotted"`: dotted line
       * - `"none"`: no border
       * - `"solid"`: solid line*/
      readonly style?: IBorderType;
    };
  };
  readonly radiusType?: string;
  readonly borderType?: string;
  readonly hideBorder?: boolean;
}

/** Background fill or image configuration for a component. All properties are read‑only – modify them through the parent `background` property. */
export interface IBackgroundValue {
  /** Type of background.
   * - `"color"`: solid color fill
   * - `"url"`: external image URL
   * - `"image"`: internal image resource
   * - `"storedFile"`: reference to a stored file
   * - `"gradient"`: CSS gradient */
  readonly type?: 'color' | 'url' | 'image' | 'storedFile' | 'gradient';

  /** Background image sizing. Standard CSS `background-size` values are accepted. */
  readonly size?: 'cover' | 'contain' | 'auto' | string | undefined;

  /** Background image position. Standard CSS `background-position` values are accepted. */
  readonly position?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top left' | 'top right' | 'bottom left' | 'bottom right' | string | undefined;

  /** Background image repetition behaviour. Standard CSS `background-repeat` values. */
  readonly repeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y' | 'round' | undefined;

  /** Gradient configuration – required when `type = "gradient"`.
   * - `direction`: gradient direction (e.g., `"to right"`, `"45deg"`)
   * - `colors`: mapping of color stops (e.g., `{ "0%": "#fff", "100%": "#000" }`) */
  readonly gradient?: { direction: string; colors: Record<string, string> } | undefined;

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
  readonly size?: number;
  /** **Font family**. Read-only.
   *
   * To change it, use the `font` property, for example: `components.textField.font = {family: 'Arial'}`
   *
   * To restore original value use `components.textField.font = {family: undefined}` */
  readonly type?: string;
  /** **Font weight**. Read-only.
   *
   * To change it, use the `font` property, for example: `components.textField.font = {weight: '400'}`
   *
   * To restore original value use `components.textField.font = {weight: undefined}` */
  readonly weight?: string;
  /** **Font color**. Read-only.
   *
   * To change it, use the `font` property, for example: `components.textField.font = {color: '#000'}`
   *
   * To restore original value use `components.textField.font = {color: undefined}` */
  readonly color?: string;
  /** **Font align**. Read-only.
   *
   * To change it, use the `font` property, for example: `components.textField.font = {align: 'left'}`
   *
   * To restore original value use `components.textField.font = {align: undefined}` */
  readonly align?: TextAlignSetting;
  /** **Font transform**.
   *
   * Read-only. To change it, use the `font` property, for example: `components.textField.font = {transform: 'uppercase'}`
   *
   * To restore original value use `components.textField.font = {transform: undefined}` */
  readonly transform?: string;
}

export interface IComponentStyle extends Record<string, unknown> {
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
  font: IFontValue;

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
  background: IBackgroundValue;

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
  border: IBorderValue;
}

export type EditMode = 'editable' | 'readOnly' | 'inherited' | boolean;

export interface CommonComponentApi {
  /** Name of the component (e.g., `"textField"`, `"numberField"`). */
  readonly componentName: string;
  /** Context to which the component is bound (e.g., formContext, pageContext, undefined for form data). */
  readonly context?: string | undefined;
  /** Name of the property this component is bound to. */
  readonly propertyName: string;
  /** Current style overrides applied to the component. */
  readonly style: IComponentStyle;
  /** Whether the component is visible in the UI. */
  visible: boolean;
  /** Current edit mode of the component. */
  editable: EditMode;
}

export interface InputComponentApi<T = unknown> extends CommonComponentApi {
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

  /** Component value. Readable and writable */
  value: T;
}

// Components API

export type TextFieldApi = InputComponentApi<string | undefined>;
export type NumberFieldApi = InputComponentApi<number | undefined>;
