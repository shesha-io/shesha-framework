import * as React from 'react';
import { isDefined, isNotNullOrWhiteSpace } from "@/utils/nullables";
import { executeScriptSync } from '@/providers/form/utils';
import { IPropertySetting } from '..';
import { getStyleBoxValue } from "@/designer-components/styleBox/utils";
import { IConfigurableFormComponent, IStyleValue, IToolboxComponent } from "@/interfaces";
import { IBackgroundValue } from "@/designer-components/_settings/utils/background/interfaces";
import { IConfigurableTheme } from "@/providers";
import { GROUP_NON_COMPONENT_STYLE_KEYS, IThemeGroupStyle } from "@/providers/theme/contexts";
import { DeviceTypes } from "@/providers/canvas/contexts";
import { deepCopyViaJson, deepMergeSkipUndefinedFunc, deepMergeValues } from "@/utils/object";

/**
 * A component's theme group style, extended with the parts its nested style values inherit (see
 * `nestedGroupStyles`), so a merge applies the group style to them as well as to the component.
 */
export const getGroupStyleForComponent = (groupStyle: IThemeGroupStyle | undefined, toolboxComponent: Pick<IToolboxComponent, 'nestedGroupStyles'> | undefined): IStyleValue | undefined => {
  if (!isDefined(groupStyle)) return undefined;
  // Parts of the group style that are not a style of the component itself never reach it: the label
  // font, and the header defaults, which reach a header only through the component's
  // `nestedGroupStyles` (see getHeaderGroupStyle).
  const ownGroupStyle: IStyleValue & Record<string, unknown> = { ...groupStyle };
  GROUP_NON_COMPONENT_STYLE_KEYS.forEach((key) => delete ownGroupStyle[key]);
  const nested = toolboxComponent?.nestedGroupStyles;
  if (!isDefined(nested)) return ownGroupStyle;
  const result: IStyleValue & Record<string, unknown> = ownGroupStyle;
  Object.entries(nested).forEach(([propertyName, pick]) => {
    result[propertyName] = pick(groupStyle);
  });
  return result;
};

/**
 * The theme's base style: the lowest style layer, below every component's own defaults, so whatever a
 * component, group or instance leaves unset is inherited from it. A component's nested style values that
 * inherit the group style (`nestedGroupStyles`, e.g. a panel's header) inherit the base style as well.
 * Undefined when the theme sets none.
 */
export const getThemeBaseStyle = (
  theme: IConfigurableTheme | undefined,
  toolboxComponent?: Pick<IToolboxComponent, 'nestedGroupStyles'> | undefined,
): IStyleValue | undefined => {
  const font = theme?.font;
  if (!isDefined(font)) return undefined;
  const definedFont = Object.fromEntries(Object.entries(font).filter(([, value]) => isDefined(value) && value !== ''));
  if (Object.keys(definedFont).length === 0) return undefined;
  const result: IStyleValue & Record<string, unknown> = { font: definedFont };
  Object.keys(toolboxComponent?.nestedGroupStyles ?? {}).forEach((propertyName) => {
    result[propertyName] = { font: { ...definedFont } };
  });
  return result;
};

const hasValue = (value: unknown): boolean => {
  if (!isDefined(value)) return false;
  if (typeof value === 'string') return isNotNullOrWhiteSpace(value);
  if (Array.isArray(value)) return value.some(hasValue);
  if (typeof value === 'object') return Object.values(value).some(hasValue);
  return true;
};

/**
 * Whether a background value draws nothing: a type is chosen but the value that type needs (colour,
 * gradient colours, image) is not set. The Background editor stores such values as soon as a type button
 * is clicked, e.g. `{ type: 'color' }`.
 */
export const isEmptyBackground = (background: IBackgroundValue | undefined): boolean => {
  if (!isDefined(background)) return true;
  switch (background.type) {
    case 'color': return !hasValue(background.color);
    case 'gradient': return !hasValue(background.gradient?.colors);
    case 'image': return !hasValue(background.uploadFile);
    case 'url': return !hasValue(background.url);
    case 'storedFile': return !hasValue(background.storedFile?.id);
    default: return true;
  }
};

/**
 * A theme style layer without the backgrounds that draw nothing (see {@link isEmptyBackground}) - its own
 * and those of its nested style values (e.g. a panel's `headerStyles`) - so an empty background stored on
 * a theme layer does not replace the background inherited from the layers below it: a Panel's Component
 * Defaults holding `{ type: 'color' }` would otherwise reset the Layout Components gradient to the default white.
 */
export const withoutEmptyBackgrounds = <T extends object | undefined>(style: T): T => {
  if (!isDefined(style)) return style;
  let result: Record<string, unknown> | undefined;
  const source = style as Record<string, unknown>;
  Object.entries(source).forEach(([key, value]) => {
    if (key === 'background') {
      if (isEmptyBackground(value as IBackgroundValue | undefined)) {
        result ??= { ...source };
        delete result[key];
      }
      return;
    }
    if (isDefined(value) && typeof value === 'object' && !Array.isArray(value) && 'background' in value) {
      const cleaned = withoutEmptyBackgrounds(value);
      if (cleaned !== value) {
        result ??= { ...source };
        result[key] = cleaned;
      }
    }
  });
  return (result ?? style) as T;
};

export const getEffectiveStyle = (model: IConfigurableFormComponent, effectiveDevice: DeviceTypes, theme?: IConfigurableTheme | undefined, toolboxComponent?: IToolboxComponent | undefined, isSettingsForm: boolean = false): IStyleValue => {
  // for settings form components should use their own styles
  if (isSettingsForm === true)
    return model;

  // Theme base style (application font) + Default styles + Group theme styles (Input/Inline/Standard/Layout Components tabs).
  // deepMergeValues only shallow-copies its target, so merge into a deep copy: some components
  // (e.g. tabs) return nested objects shared with module-level constants from getDefaultStyles.
  const componentDefStyle = deepCopyViaJson(toolboxComponent?.getDefaultStyles?.() ?? { styleCss: {} }) as IStyleValue;
  // getThemeBaseStyle builds new objects on every call, so it is safe to merge into without a copy.
  const baseStyle = getThemeBaseStyle(theme, toolboxComponent);
  const defStyle: IStyleValue = isDefined(baseStyle)
    ? deepMergeValues(baseStyle, componentDefStyle, deepMergeSkipUndefinedFunc)
    : componentDefStyle;
  // Only apply theme group styles if the component has an explicit themeGroup property
  const groupStyle = toolboxComponent?.themeGroup !== undefined
    ? withoutEmptyBackgrounds(getGroupStyleForComponent(theme?.componentGroups?.[toolboxComponent.themeGroup], toolboxComponent))
    : undefined;
  const groupDefStyle: IStyleValue = isDefined(groupStyle)
    ? deepMergeValues(defStyle, groupStyle, deepMergeSkipUndefinedFunc)
    : defStyle;

  // + Theme component styles (per-type override wins over the group default)
  const themeDefStyle: IStyleValue = isDefined(theme?.components)
    ? deepMergeValues(groupDefStyle, withoutEmptyBackgrounds(theme.components[model.type] as IStyleValue | undefined), deepMergeSkipUndefinedFunc)
    : groupDefStyle;

  // Default styles + Theme component styles + Desktop component styles
  const desktopModel = model.desktop;
  // ToDo: AS - remove all using stylingBox after migration all components
  const desktopStylingBox = isDefined(desktopModel?.stylingBox) ? getStyleBoxValue(desktopModel.stylingBox) : undefined;
  const desktopStylingBoxJson = desktopModel?.stylingBoxJson;
  const desktopThemeStyle: IStyleValue = deepMergeValues(themeDefStyle, { ...desktopModel, stylingBoxJson: Boolean(desktopStylingBoxJson) ? desktopStylingBoxJson : desktopStylingBox }, deepMergeSkipUndefinedFunc);

  if (effectiveDevice === 'desktop') return desktopThemeStyle;

  // Default styles + Theme component styles + Desktop component styles + Effective component styles
  const effectiveModel = model[effectiveDevice as keyof typeof model] as IStyleValue | undefined;
  const effectiveStylingBox = isDefined(effectiveModel?.stylingBox) ? getStyleBoxValue(effectiveModel.stylingBox) : undefined;
  const effectiveStylingBoxJson = effectiveModel?.stylingBoxJson;
  const effectiveDesktopStyle = deepMergeValues(desktopThemeStyle, { ...effectiveModel, stylingBoxJson: (Boolean(effectiveStylingBoxJson)) ? effectiveStylingBoxJson : effectiveStylingBox }, deepMergeSkipUndefinedFunc);
  return effectiveDesktopStyle as IStyleValue;
};

const DIMENSION_UNITS = ['px', '%', 'vw', 'vh', 'em', 'rem', 'auto', 'calc', 'none', 'fr', 'in', 'cm', 'mm', 'pt', 'pc'] as const;
type DimensionUnits = typeof DIMENSION_UNITS[number];
interface DimensionValue {
  value: number;
  unit: DimensionUnits;
  calc?: string;
}

const isDimensionUint = (unit: string): unit is DimensionUnits => DIMENSION_UNITS.includes(unit as DimensionUnits);

/**
 * Type guard to check if a value is a valid dimension input type
 * @param value - The value to check
 * @returns true if the value is string, number, null, or undefined
 */
const isValidDimensionResult = (value: unknown): value is string | number | null | undefined => {
  const valueType = typeof value;
  return valueType === 'string' || valueType === 'number' || value === null || value === undefined;
};

/**
 * Parse a dimension value into its numeric value and unit
 * @param value - The dimension value to parse (e.g., "50vw", "100%", 300, "auto", or JS code object)
 * @param context - Optional context object containing available constants (from useAvailableConstantsData)
 * @returns Parsed dimension object with value and unit, or null if invalid
 */
const parseDimension = (value: string | number | null | undefined | IPropertySetting, context?: object): DimensionValue | null => {
  if (!isDefined(value)) return null;

  if (typeof value === 'number') {
    return { value, unit: 'px' };
  }

  if (typeof value === 'string') {
    if (value.trimStart().indexOf('calc') > -1)
      return { value: 0, unit: 'calc', calc: value };
    if (value.trimStart().indexOf('-') > 1 || value.trimStart().indexOf('+') > 1) {
      return { value: 0, unit: 'calc', calc: `calc(${value})` };
    }
  }

  // Handle JavaScript code execution for dynamic values
  if (typeof value === 'object' && value._mode === 'code' && isDefined(value._code)) {
    try {
      const executedValue = executeScriptSync(value._code, context ?? {});

      // Validate that the executed result is a valid dimension type
      if (!isValidDimensionResult(executedValue)) {
        console.error(
          `Invalid dimension value returned from script execution. Expected string, number, null, or undefined but got ${typeof executedValue}:`,
          executedValue,
        );
        return null;
      }

      // Recursively parse the validated result
      return parseDimension(executedValue, context);
    } catch (error) {
      console.error('Error executing dimension code:', error);
      return null;
    }
  }
  // Handle IPropertySetting with _mode === 'value' - extract the underlying value
  if (typeof value === 'object' && value._mode === 'value' && isDefined(value._value)) {
    // Validate that _value is a valid dimension type before recursing
    if (!isValidDimensionResult(value._value)) {
      console.error(
        `Invalid dimension value in IPropertySetting._value. Expected string, number, null, or undefined but got ${typeof value._value}:`,
        value._value,
      );
      return null;
    }
    return parseDimension(value._value, context);
  }

  if (typeof value !== 'string') return null;

  if (value === 'auto' || value === 'none') {
    return { value: 0, unit: value };
  }

  // Match number with optional unit
  const match = /^(-?\d+(?:\.\d+)?)(px|%|vw|vh|em|rem|fr|in|cm|mm|pt|pc)?$/.exec(value.trim());
  if (match && match[1] !== undefined) {
    const unit = isDefined(match[2]) ? match[2] : 'px';

    // Type guard: validate unit is one of the allowed values
    if (isDimensionUint(unit)) {
      return {
        value: parseFloat(match[1]),
        unit,
      };
    }
  }

  return null;
};

export const DIMENSION_VALUES = ['auto', 'none', 'min-content', 'max-content', 'fit-content', 'stretch', '50%', '100%'];
export const GRID_DIMENSION_VALUES = ['auto', 'min-content', 'max-content', '1fr'];

/**
 * Add 'px' unit to bare numbers, preserve existing units
 * @param value - The value to add units to
 * @param context - Optional context object containing available constants (from useAvailableConstantsData)
 * @returns String with appropriate units, or undefined
 */
export const addPx = (value: number | string | null | undefined, context?: object): string | undefined => {
  const trimmedValue = typeof value === 'string' ? value.trim() : undefined;

  if (isNotNullOrWhiteSpace(trimmedValue)) {
    const isKeyword = DIMENSION_VALUES.includes(trimmedValue);
    // `[^;{}]*` keeps the passthrough limited to a single declaration.
    const isMathFunction = /^(calc|min|max|clamp)\([^;{}]*\)$/i.test(trimmedValue);

    if (isKeyword || isMathFunction) return trimmedValue;
  }

  const parsed = parseDimension(value, context);
  if (!parsed) return undefined;

  if (parsed.unit === 'auto' || parsed.unit === 'none') {
    return parsed.unit;
  }

  if (parsed.unit === 'calc') {
    return parsed.calc ?? 'auto';
  }

  return `${parsed.value}${parsed.unit}`;
};

export const hasNumber = (str: string | number): boolean => typeof str === 'number' ? true : /\d/.test(str);

export const getTagStyle = (style: React.CSSProperties = {}, hasColor: boolean = false): React.CSSProperties => {
  const { backgroundColor, backgroundImage, borderColor, borderTopColor,
    borderLeftColor, borderRightColor, borderBottomColor, color, ...rest } = style;
  return hasColor ? { ...rest } : style;
};

/**
 * Caps percentage width values at a maximum percentage to prevent layout issues.
 * @param value - The width value to cap (can be a number, string, null, or undefined)
 * @param maxPercentage - The maximum percentage value (default: 98)
 * @returns The capped value or the original value if not a percentage string
 */
export const capPercentageWidth = (value: number | string | null | undefined, maxPercentage: number = 98): number | string | undefined => {
  if (!isDefined(value)) return undefined;

  // Check if it's a percentage string (e.g., "99%", "100%")
  if (typeof value === 'string' && value.endsWith('%')) {
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && numericValue > maxPercentage) {
      return `${maxPercentage}%`;
    }
  }

  return value;
};
