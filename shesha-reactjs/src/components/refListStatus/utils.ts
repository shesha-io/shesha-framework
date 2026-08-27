import { isNullOrWhiteSpace } from '@/utils/nullables';
import { CSSProperties } from 'react';
import { ITagProps } from './tag';

/**
 * Strips the tag chrome so the value reads as plain text, which is what the component looks like
 * with Show Solid Background off.
 *
 * Applied inline because the chrome arrives through an emotion class - the Appearance border,
 * background, padding and shadow are written onto `.ant-tag`, which outranks any class this
 * component could add of its own.
 */
export const PLAIN_TEXT_STYLE: CSSProperties = {
  background: 'transparent',
  border: 'none',
  boxShadow: 'none',
  padding: 0,
};

/**
 * Colour a solid badge falls back to when the reference list item carries none of its own. Dark
 * enough to read the white text a solid tag uses, and distinct from the pale grey of the ordinary
 * filled tag, so Show Solid Background still visibly does something for a colourless list.
 */
export const DEFAULT_SOLID_COLOR = '#8c8c8c';

/**
 * Text and icon colour for a solid badge. Applied inline rather than left to antd's solid variant:
 * the Appearance font colour reaches `.ant-tag` through an emotion class, which outranks antd's own
 * rule and was painting black text onto the coloured background.
 */
export const SOLID_TEXT_COLOR = '#fff';

/**
 * First candidate that is an actual colour. The badge colour is resolved this way in both the
 * runtime and the designer branch, so they stay in step as candidates are added or reordered.
 */
export const resolveColor = (...candidates: (string | null | undefined)[]): string | undefined => {
  return candidates.find((candidate) => !isNullOrWhiteSpace(candidate)) ?? undefined;
};

/**
 * Drops a caller's background declarations, shorthand included - the shorthand would otherwise reset
 * the background-color a solid badge paints itself with.
 */
export const withoutBackground = (
  { background, backgroundColor, backgroundImage, ...rest }: CSSProperties,
): CSSProperties => rest;

/**
 * The tag props that paint a solid badge. A declared return type gives `variant` its literal type,
 * which a conditionally spread object literal would otherwise widen to `string`.
 */
export const solidTagProps = (color: string): Pick<ITagProps, 'color' | 'variant'> => ({ color, variant: 'solid' });
