/**
 * Mustache only recognises double-brace tags (`{{ }}`). Older Shesha form configs used
 * single-brace accessors (e.g. `{data.id}`) for values such as a File/Notes `ownerId`, which
 * were resolved by the legacy `evaluateValue` helper. After standardising on Mustache those
 * single-brace values are passed through verbatim, so an unresolved `"{data.id}"` reaches the
 * backend and fails with errors like "Unrecognized Guid format".
 *
 * To keep those configs working without a data migration, upgrade a *whole-string* single-brace
 * dotted accessor to a Mustache tag. Existing `{{ }}`/`{{{ }}}` tags, inline single braces, empty
 * braces and JSON/CSS snippets are left untouched.
 */
const SINGLE_BRACE_ACCESSOR_REGEX = /^\s*\{\s*([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)+)\s*\}\s*$/;

/**
 * Upgrades a whole-string single-brace dotted accessor (e.g. `{data.id}`) to a Mustache tag
 * (`{{data.id}}`). Any other input — including strings already containing Mustache tags, inline
 * single braces, or non-accessor content — is returned unchanged.
 */
export const normalizeSingleBraceAccessor = (template: string): string => {
  // Never touch existing Mustache tags ({{ }} or {{{ }}}) or non-string input.
  if (typeof template !== 'string' || template.includes('{{'))
    return template;

  const match = template.match(SINGLE_BRACE_ACCESSOR_REGEX);
  return match ? `{{${match[1]}}}` : template;
};
