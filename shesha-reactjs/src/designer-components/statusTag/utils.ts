import { IBackgroundValue, IShadowValue } from '@/designer-components/_settings/utils';
import { IStyleValue, StyleBoxValue } from '@/providers/form/models';
import { ILabelValue } from '@/components/dropdown/model';
import { IStatusMappings } from '@/components/statusTag';
import { isDefined, isNotNullOrWhiteSpace } from '@/utils/nullables';
import { jsonSafeParse } from '@/utils/object';

/**
 * The complete background shape, as `card` and `drawer` define it.
 *
 * Every slot has to be present for the Appearance tab to offer inheritance on the compound
 * background inputs: the inheritance popover only renders for properties the default model actually
 * contains, so a bare `{ type, color }` leaves size/position/repeat/gradient/image with nothing to
 * inherit from and no inheritance state shown at all.
 */
const BACKGROUND_DEFAULTS = (color: string): IBackgroundValue => ({
  type: 'color',
  color,
  repeat: 'no-repeat',
  size: 'cover',
  position: 'center',
  gradient: { direction: 'to right', colors: [] },
  url: '',
});

/**
 * A no-op shadow, present so the Shadow panel offers inheritance — an absent slot renders nothing
 * *and* shows no inheritance state. The zeroed values emit a shadow that is not visible.
 */
const SHADOW_DEFAULTS = (): IShadowValue => ({
  offsetX: 0,
  offsetY: 0,
  blurRadius: 0,
  spreadRadius: 0,
  color: '#000',
});

/** Zeroed margin/padding, present for the same inheritance reason as `SHADOW_DEFAULTS`. */
const STYLING_BOX_DEFAULTS = (): StyleBoxValue => ({
  _type: 'styleBox',
  marginTop: '0',
  marginRight: '0',
  marginBottom: '0',
  marginLeft: '0',
  paddingTop: '0',
  paddingRight: '0',
  paddingBottom: '0',
  paddingLeft: '0',
});

/**
 * Appearance defaults for an unconfigured status tag.
 *
 * A single, flat style set — there is deliberately no nested second set and no container styles.
 * The component *is* the tag, so every Appearance input describes the tag itself; a wrapper set
 * would give the user two places to configure one visible thing, and a container border or
 * background would draw an empty-looking box around the status. `styles.ts` scopes these flat
 * properties onto the tag element, the same way the checkbox scopes its set onto the box.
 *
 * The colour-bearing slots are left empty so the Variant decides them: seeded, they are emitted at
 * `&&&&` and beat antd's variant rules, which is what the dropdown's migration 15 had to undo.
 * `border` omits `all` for the same reason — `borderLinesStyles` emits a border for any present
 * `all`, so even an empty one erases the Variant's border.
 */
export const defaultStyles = (): IStyleValue => {
  return {
    background: BACKGROUND_DEFAULTS(''),
    font: {
      weight: '400',
      size: 14,
      type: 'Segoe UI',
      align: 'center',
    },
    border: {
      radius: { all: 4 },
      borderType: 'all',
      radiusType: 'all',
    },
    dimensions: {
      width: 'auto',
      height: '22px',
      minHeight: '0px',
      maxHeight: 'auto',
      minWidth: '0px',
      maxWidth: 'auto',
    },
    shadow: SHADOW_DEFAULTS(),
    stylingBoxJson: STYLING_BOX_DEFAULTS(),
  };
};

/**
 * Converts the legacy `mappings` JSON into the `values` list the Values editor uses.
 *
 * The old component matched a value against a hand-written mapping table and took the text and
 * colour from the matched row; `values` holds the same three fields per row, so the table converts
 * across directly and a migrated form keeps rendering the colours it was configured with.
 *
 * `mappings.default` is deliberately dropped: it was the "NOT RECOGNISED" fallback for a value with
 * no matching row, and `values` has no concept of a catch-all entry — carrying it over would add a
 * selectable option that never corresponded to a real status.
 */
export const mappingsToValues = (mappings: string | undefined): ILabelValue<number | string>[] | undefined => {
  if (!isNotNullOrWhiteSpace(mappings)) return undefined;

  const parsed = jsonSafeParse<IStatusMappings>(mappings);
  const rows = parsed?.mapping;
  if (!isDefined(rows) || rows.length === 0) return undefined;

  return rows
    // A row with no code has nothing to match against, so it could never have been selected.
    .filter((row) => isDefined(row.code))
    .map((row, index) => ({
      id: `legacy-mapping-${index}`,
      // `override` took precedence over `text` in the old renderer, so it wins here too.
      label: (isNotNullOrWhiteSpace(row.override) ? row.override : row.text) ?? '',
      value: row.code as number,
      ...(isNotNullOrWhiteSpace(row.color) ? { color: row.color } : {}),
    }));
};
