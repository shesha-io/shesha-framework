import { BorderStyle, getGradientColors, IBackgroundValue, IBorderValue, IDimensionsValue, IFontValue, IGradientValue, IShadowValue } from "@/designer-components/_settings/utils";
import { IConfigurableFormComponent, IStyleValue, StyleBoxValue } from "../../../providers/form/models";
import { addPx, hasNumber } from "@/utils/style";
import { StringBuilder } from "@/utils";
import { isDefined, isNullOrWhiteSpace } from "@/utils/nullables";
import { CSSProperties } from "react";

/** Properties that are unitless in CSS, so a bare number must not gain a `px` suffix. */
const UNITLESS_PROPERTIES = new Set([
  'animationIterationCount', 'aspectRatio', 'borderImageOutset', 'borderImageSlice', 'borderImageWidth',
  'boxFlex', 'boxFlexGroup', 'boxOrdinalGroup', 'columnCount', 'columns', 'flex', 'flexGrow', 'flexPositive',
  'flexShrink', 'flexNegative', 'flexOrder', 'gridRow', 'gridColumn', 'fontWeight', 'lineClamp', 'lineHeight',
  'opacity', 'order', 'orphans', 'tabSize', 'widows', 'zIndex', 'zoom',
  // SVG presentation attributes React accepts on CSSProperties.
  'fillOpacity', 'floodOpacity', 'stopOpacity', 'strokeDasharray', 'strokeMiterlimit', 'strokeOpacity',
  'strokeWidth',
  // Vendor-prefixed forms of the above; React spells these with a capitalised prefix.
  'WebkitLineClamp', 'WebkitBoxOrdinalGroup', 'WebkitFlexGrow', 'WebkitFlexShrink', 'WebkitOrder',
  'MozBoxFlex', 'msFlex', 'msFlexPositive', 'msGridRow', 'msGridColumn',
]);

/**
 * Serialises a React `CSSProperties` object into a CSS declaration string suitable for
 * interpolation into an emotion template literal.
 *
 * Emotion's `CSSObject` is not structurally compatible with React's `CSSProperties`, so a custom
 * style object cannot simply be spread into a `css` block. Keys are kebab-cased, `--custom-props`
 * are passed through untouched, and `px` is appended only to numeric values of properties that
 * actually take a length (see `UNITLESS_PROPERTIES`).
 */
export const cssPropertiesToString = (style: CSSProperties | undefined): string => {
  if (!isDefined(style)) return '';
  const sb = new StringBuilder();
  Object.entries(style).forEach(([key, value]) => {
    if (!isDefined(value) || value === '') return;
    // Custom properties are already in their final form and must keep their exact casing.
    // React writes the Microsoft prefix lowercase (`msFlex`), which plain kebab-casing would
    // render as `ms-flex`; the vendor declaration needs the leading dash. The other prefixes
    // (`WebkitBoxShadow`, `MozAppearance`) capitalise, so the generic rule already emits theirs.
    const name = key.startsWith('--')
      ? key
      : (/^ms[A-Z]/.test(key) ? `-${key}` : key).replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
    const serialised = typeof value === 'number' && !UNITLESS_PROPERTIES.has(key)
      ? `${value}px`
      : String(value);
    sb.append(`${name}: ${serialised};`);
  });
  return sb.build();
};

/**
 * Splits a custom style object into its background-related declarations and everything else.
 *
 * Some components deliberately scope their Background panel to a state selector (a checkbox or
 * radio indicator only fills when checked; a dropdown tag only takes the configured colour when
 * the option carries none). A custom style applied to the unconditional selector would paint the
 * element in states the panel intentionally leaves alone. Splitting lets the caller route the
 * background half to the same selector the panel uses and the rest to the base rule.
 *
 * Every `background*` longhand travels with the shorthand so a single visual intent is never
 * split across two states.
 */
export const splitBackgroundProperties = (style: CSSProperties | undefined): { background: CSSProperties; rest: CSSProperties } => {
  // Built as plain records because `CSSProperties` has no string index signature, and its keys and
  // values cannot be correlated when read back as a union — assigning one to the other does not
  // typecheck. The narrowing happens on return, where the keys are known to have come from a
  // `CSSProperties` object.
  const background: Record<string, unknown> = {};
  const rest: Record<string, unknown> = {};
  if (!isDefined(style)) return { background: {}, rest: {} };
  Object.entries(style).forEach(([key, value]) => {
    const target = key.startsWith('background') ? background : rest;
    target[key] = value;
  });
  return { background: background as CSSProperties, rest: rest as CSSProperties };
};

export const getStyleValueFromModel = (model: IConfigurableFormComponent): IStyleValue => {
  return {
    border: model.border,
    background: model.background,
    font: model.font,
    shadow: model.shadow,
    dimensions: model.dimensions,
    size: model.size,
    style: model.style,
    styleCss: model.styleCss,
    /** @deprecated use stylingBoxJson insted */
    stylingBox: model.stylingBox,
    stylingBoxJson: model.stylingBoxJson,
    primaryTextColor: model.primaryTextColor,
    primaryBgColor: model.primaryBgColor,
    secondaryBgColor: model.secondaryBgColor,
    secondaryTextColor: model.secondaryTextColor,
    overflow: model.overflow,
    hideScrollBar: model.hideScrollBar,
    autoWidth: model.autoWidth,
    autoHeight: model.autoHeight,
  };
};

const borderCss = (b: BorderStyle | undefined): string => `${addPx(b?.width) ?? ''} ${b?.style ?? ''} ${b?.color ?? 'transparent'}`;

const gradientCss = (g: IGradientValue): string => {
  const direction = g.direction;
  const isRadial = direction === 'radial';
  const isConic = direction === 'conic';
  const colorsString = getGradientColors(g.colors).join(', ');
  return colorsString
    ? isRadial || isConic
      ? `${direction}-gradient(${colorsString})`
      : `linear-gradient(${direction || 'to right'}, ${colorsString})`
    : '';
};

const dimensionCss = (value: string | number, _canvasValue?: string): string | number => {
  // If canvasWidth is provided and main contains vw, convert to calc
  /* if (canvasValue && typeof value === 'string' && /vw/i.test(value)) {
    return dimensionRelativeToCanvas(value, canvasValue, 'vw');
  }*/

  // For simple numeric values or values without vw, use addPx
  if (typeof value === 'string' && /^calc\(/i.test(value.trim())) return value;
  return !hasNumber(value) ? value : addPx(value) ?? 0;
};

export const shadowStyles = (model: IShadowValue | undefined, propertyName: string = 'box-shadow', important: boolean = false): string => model
  ? `${propertyName}: ${model.offsetX ?? 0}px ${model.offsetY ?? 0}px ${model.blurRadius ?? 0}px ${model.spreadRadius ?? 0}px ${Boolean(model.color) ? model.color : '#00000004'}${important === true ? ' !important' : ''};`
  : '';

export const borderRadiusStyles = (model: IBorderValue | undefined, important: boolean = false): string => {
  if (!model) return '';
  const sb = new StringBuilder();
  if (model.radiusType === 'all' && isDefined(model.radius?.all)) sb.append(`border-radius: ${addPx(model.radius.all)} ${important === true ? '!important' : ''};`);
  if (model.radiusType !== 'all' && model.radius)
    sb.append(`border-radius: ${addPx(model.radius.topLeft ?? 0)} ${addPx(model.radius.topRight ?? 0)} ${addPx(model.radius.bottomRight ?? 0)} ${addPx(model.radius.bottomLeft ?? 0)} ${important === true ? '!important' : ''};`);
  return sb.build();
};

export const borderLinesStyles = (model: IBorderValue | undefined, important: boolean = false): string => {
  if (!model) return '';
  const sb = new StringBuilder();
  if (model.borderType === 'all' && model.border?.all) sb.append(`border: ${borderCss(model.border.all)} ${important === true ? '!important' : ''};`);
  if (model.borderType !== 'all' && model.border?.top) sb.append(`border-top: ${borderCss(model.border.top)} ${important === true ? '!important' : ''};`);
  if (model.borderType !== 'all' && model.border?.right) sb.append(`border-right: ${borderCss(model.border.right)} ${important === true ? '!important' : ''};`);
  if (model.borderType !== 'all' && model.border?.bottom) sb.append(`border-bottom: ${borderCss(model.border.bottom)} ${important === true ? '!important' : ''};`);
  if (model.borderType !== 'all' && model.border?.left) sb.append(`border-left: ${borderCss(model.border.left)} ${important === true ? '!important' : ''};`);
  return sb.build();
};

export const borderStyles = (model: IBorderValue | undefined, important: boolean = false): string => {
  if (!model) return '';
  const sb = new StringBuilder();
  sb.append(borderLinesStyles(model, important));
  sb.append(borderRadiusStyles(model, important));
  return sb.build();
};

export const backgroundStyles = (model: IBackgroundValue | undefined): string => {
  if (!model) return '';
  const sb = new StringBuilder();
  if (model.type === 'color' && Boolean(model.color)) sb.append(`background-color: ${model.color};`);
  if (model.type === 'gradient' && model.gradient) sb.append(`background: ${gradientCss(model.gradient)};`);
  if (model.type === 'image' && model.uploadFile) sb.append(`background-image: url(${model.uploadFile.url || model.uploadFile});`);
  if (model.type === 'url' && Boolean(model.url)) sb.append(`background-image: url(${model.url});`);
  if (model.type === 'storedFile' && Boolean(model.url)) sb.append(`background-image: url(${model.url});`);
  if (Boolean(model.size)) sb.append(`background-size: ${model.size};`);
  if (model.repeat) sb.append(`background-repeat: ${model.repeat};`);
  if (Boolean(model.position)) sb.append(`background-position: ${model.position};`);
  return sb.build();
};

export const dimensionsStyles = (model: IDimensionsValue | undefined): string => {
  if (!model) return '';
  const sb = new StringBuilder();
  if (isDefined(model.width)) sb.append(`width: ${dimensionCss(model.width)};`);
  if (isDefined(model.minWidth)) sb.append(`min-width: ${dimensionCss(model.minWidth)};`);
  if (isDefined(model.maxWidth)) sb.append(`max-width: ${dimensionCss(model.maxWidth)};`);
  if (isDefined(model.height)) sb.append(`height: ${dimensionCss(model.height)};`);
  if (isDefined(model.minHeight)) sb.append(`min-height: ${dimensionCss(model.minHeight)};`);
  if (isDefined(model.maxHeight)) sb.append(`max-height: ${dimensionCss(model.maxHeight)};`);
  if (isDefined(model.gridRow) && model.gridRow > 0) sb.append(`grid-row: span ${model.gridRow};`);
  if (isDefined(model.gridColumn) && model.gridColumn > 0) sb.append(`grid-column: span ${model.gridColumn};`);
  return sb.build();
};

export const marginStyles = (model: StyleBoxValue | undefined): string => {
  if (!model) return '';
  const sb = new StringBuilder();
  if (isDefined(model.marginBottom)) sb.append(`margin-bottom: ${addPx(model.marginBottom)};`);
  if (isDefined(model.marginTop)) sb.append(`margin-top: ${addPx(model.marginTop)};`);
  if (isDefined(model.marginLeft)) sb.append(`margin-left: ${addPx(model.marginLeft)};`);
  if (isDefined(model.marginRight)) sb.append(`margin-right: ${addPx(model.marginRight)};`);
  return sb.build();
};

export const paddingStyles = (model: StyleBoxValue | undefined): string => {
  if (!model) return '';
  const sb = new StringBuilder();
  if (isDefined(model.paddingBottom)) sb.append(`padding-bottom: ${addPx(model.paddingBottom)};`);
  if (isDefined(model.paddingTop)) sb.append(`padding-top: ${addPx(model.paddingTop)};`);
  if (isDefined(model.paddingLeft)) sb.append(`padding-left: ${addPx(model.paddingLeft)};`);
  if (isDefined(model.paddingRight)) sb.append(`padding-right: ${addPx(model.paddingRight)};`);
  return sb.build();
};

export const paddingValue = (model: StyleBoxValue | undefined): string => {
  if (!model) return '';
  const sb = [];
  sb.push(addPx(isDefined(model.paddingTop) ? model.paddingTop : 0));
  sb.push(addPx(isDefined(model.paddingRight) ? model.paddingRight : 0));
  sb.push(addPx(isDefined(model.paddingBottom) ? model.paddingBottom : 0));
  sb.push(addPx(isDefined(model.paddingLeft) ? model.paddingLeft : 0));
  return sb.join(' ');
};

export const fontStyles = (model: IFontValue | undefined): string => {
  if (!model) return '';
  const sb = new StringBuilder();
  if (!isNullOrWhiteSpace(model.color)) sb.append(`color: ${model.color};`);
  if (isDefined(model.size)) sb.append(`font-size: ${addPx(model.size)};`);
  if (!isNullOrWhiteSpace(model.weight)) sb.append(`font-weight: ${model.weight};`);
  if (!isNullOrWhiteSpace(model.type)) sb.append(`font-family: ${model.type};`);
  if (isDefined(model.align)) sb.append(`text-align: ${model.align};`);
  return sb.build();
};
