import { IBackgroundValue, IShadowValue } from '@/designer-components/_settings/utils';
import { IStyleValue, StyleBoxValue } from '@/providers/form/models';
import { ILabelValue } from '@/components/dropdown/model';
import { DEFAULT_STATUS_TAG_MAPPINGS, IStatusMap, IStatusMappings } from '@/components/statusTag';
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
  paddingRight: '8',
  paddingBottom: '0',
  paddingLeft: '8',
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
    // Empty, not a grey: a seeded colour is emitted at `&&&&` and paints every tag that has no
    // colour of its own, overriding whatever the Variant would have drawn.
    background: BACKGROUND_DEFAULTS('#d9d9d9'),
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
 * The value the catch-all row is stored under.
 *
 * `mappings.default` had no code — it was matched by *failing* to match anything else. `values` has
 * no catch-all concept, so the row needs a value of its own to exist as an option; a sentinel is
 * used rather than a number so it can never collide with a real reference-list code.
 */
export const DEFAULT_STATUS_VALUE = 'default';

/** One `values` row built from a legacy mapping row. */
const mappingToValue = (row: IStatusMap, value: number | string, index: number): ILabelValue<number | string> => ({
  id: `legacy-mapping-${index}`,
  // `override` took precedence over `text` in the old renderer, so it wins here too.
  label: (isNotNullOrWhiteSpace(row.override) ? row.override : row.text) ?? '',
  value,
  ...(isNotNullOrWhiteSpace(row.color) ? { color: row.color } : {}),
});

/**
 * Converts the legacy `mappings` JSON into the `values` list the Values editor uses.
 *
 * The old component matched a value against a hand-written mapping table and took the text and
 * colour from the matched row; `values` holds the same three fields per row, so the table converts
 * across directly and a migrated form keeps rendering the colours it was configured with.
 *
 * `mappings.default` is carried over as a final row under `DEFAULT_STATUS_VALUE`. It is what the old
 * component rendered for a value matching no row ("NOT RECOGNISED"), so dropping it would lose the
 * only feedback a mis-configured or unmatched value ever produced.
 */
export const mappingsToValues = (mappings: string | undefined): ILabelValue<number | string>[] | undefined => {
  if (!isNotNullOrWhiteSpace(mappings)) return undefined;

  const parsed = jsonSafeParse<IStatusMappings>(mappings);
  if (!isDefined(parsed)) return undefined;

  const rows = (parsed.mapping ?? [])
    // A row with no code has nothing to match against, so it could never have been selected.
    .filter((row) => isDefined(row.code))
    .map((row, index) => mappingToValue(row, row.code as number, index));

  const fallback = parsed.default;
  const values = isDefined(fallback)
    ? [...rows, mappingToValue(fallback, DEFAULT_STATUS_VALUE, rows.length)]
    : rows;

  return values.length > 0 ? values : undefined;
};

/**
 * The values a status tag ships with, matching what 0.45 seeded into Default Mappings.
 *
 * Built from `DEFAULT_STATUS_TAG_MAPPINGS` rather than written out again, so the seeded list and the
 * legacy conversion cannot drift apart.
 */
export const defaultValues = (): ILabelValue<number | string>[] =>
  mappingsToValues(JSON.stringify(DEFAULT_STATUS_TAG_MAPPINGS)) ?? [];
