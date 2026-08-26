import { IStyleValue } from '@/providers/form/models';
import { isDefined } from '@/utils/nullables';
import { IAttachmentsEditorDeviceStyles, IAttachmentsEditorProps } from '../interfaces';

/**
 * Style groups that make up one style set. Everything outside this list (the list's own
 * `filesLayout`/`gap`, `downloadedFileStyles`, `enableStyleOnReadonly`, …) belongs to the device
 * model rather than to either style set, and is left where it is.
 *
 * `font` is deliberately absent. It described the **file name**, not the thumbnail box, and the
 * file name keeps taking its typography from the root Font panel — so the old root font stays at
 * the root instead of moving into `thumbnail` with the box properties. (This mirrors 0.45, where
 * the Font panel is the one Appearance panel not gated on thumbnail mode.) Moving it would silently
 * drop the configured file-name font, because nothing reads `thumbnail.font`.
 */
const STYLE_GROUPS = [
  'dimensions', 'border', 'background', 'shadow',
  'stylingBoxJson', 'style', 'styleCss',
] as const;

/**
 * The deprecated `stylingBox` (a JSON *string*, superseded by the parsed `stylingBoxJson`) is not
 * carried into the nested set: `checkbox` on a checkbox group holds only `stylingBoxJson`, and
 * moving the legacy key across produced a `thumbnail.stylingBox` that no code reads and whose value
 * did not even match its declared string type.
 */
const LEGACY_STYLING_BOX = 'stylingBox';

type StyleGroup = typeof STYLE_GROUPS[number];

/** Lift just the style groups out of a model, dropping keys that were never set. */
const pickStyleGroups = (source: Partial<IStyleValue> | undefined): IStyleValue => {
  const result: Record<string, unknown> = {};
  STYLE_GROUPS.forEach((group: StyleGroup) => {
    const value = source?.[group];
    // A group the user never configured stays absent rather than becoming an explicit `undefined`:
    // the render-time fallback chain distinguishes the two, and writing the key would pin the slot.
    if (isDefined(value)) result[group] = value;
  });
  return result as IStyleValue;
};

/** Remove the style groups from a model, leaving its non-style properties untouched. */
const withoutStyleGroups = <T extends object>(source: T): T => {
  const result = { ...source } as Record<string, unknown>;
  STYLE_GROUPS.forEach((group: StyleGroup) => {
    delete result[group];
  });
  return result as T;
};

/**
 * Swap one device model from the old shape to the new one:
 *
 * - old: root = the file box, `container` = the scrolling box
 * - new: root = the scrolling box, `thumbnail` = the file box
 *
 * Idempotent. A model already in the new shape has no `container`, so there is nothing to lift and
 * the model is returned unchanged rather than swapped a second time.
 */
const swapDeviceStyles = (
  device: IAttachmentsEditorDeviceStyles | undefined,
): IAttachmentsEditorDeviceStyles | undefined => {
  if (!isDefined(device)) return device;

  const container = device.container;
  if (!isDefined(container)) return device;

  // The file box styles are whatever the root currently holds.
  const thumbnail = pickStyleGroups(device);
  delete (thumbnail as Record<string, unknown>)[LEGACY_STYLING_BOX];

  // Everything that is neither a style group nor one of the two sets being rearranged.
  const rest = withoutStyleGroups(device);
  delete rest.container;

  /* In the old shape this legacy key described the *file box*, so leaving it at the device root
     would hand the file box's spacing to the new scrolling container: migration 19 converts a root
     `stylingBox` into `stylingBoxJson` when the root has no JSON value yet, baking it in.

     It is dropped rather than moved to `thumbnail`, because migration 19 only ever looks at the
     device root — a `thumbnail.stylingBox` would be converted by nobody and read by nobody. The
     real spacing is not lost: `stylingBoxJson` is the live value and travels with the style groups
     above, and this string is only the superseded form of the same setting. */
  delete (rest as Record<string, unknown>)[LEGACY_STYLING_BOX];

  return {
    // `rest` still carries the old root `font` (it is not in STYLE_GROUPS), which is exactly right:
    // that font described the file name and the file name still reads it from the root.
    ...rest,
    // The container's groups become the root ones.
    ...pickStyleGroups(container),
    // Preserve an existing `thumbnail` if one is somehow already present rather than clobbering it.
    thumbnail: isDefined(device.thumbnail) ? device.thumbnail : thumbnail,
  };
};

/**
 * Move the container style set to the root and the old root (file box) set into `thumbnail`, across
 * the root model and all three device models.
 *
 * Every value is carried across unchanged, so a saved form renders exactly as it did before.
 */
export const swapContainerAndThumbnailStyles = (prev: IAttachmentsEditorProps): IAttachmentsEditorProps => {
  const swappedRoot = swapDeviceStyles(prev as IAttachmentsEditorDeviceStyles) as IAttachmentsEditorProps | undefined;
  const base = isDefined(swappedRoot) ? swappedRoot : prev;

  return {
    ...base,
    desktop: swapDeviceStyles(prev.desktop),
    tablet: swapDeviceStyles(prev.tablet),
    mobile: swapDeviceStyles(prev.mobile),
  };
};
