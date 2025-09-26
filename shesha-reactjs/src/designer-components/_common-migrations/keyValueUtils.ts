interface DotNotation {
  owner: string;
  restPath: string;
}

const unquoteMustache = (value: string, quoteNumber: number): string | undefined => {
  const regex = new RegExp(`^{{${quoteNumber}}([^{]+[^}]+)}{${quoteNumber}}$`);
  const match = value?.match(regex);
  return match && match.length === 2
    ? match[1]
    : undefined;
};

const extractMustache = (value: string): string | undefined => unquoteMustache(value, 2) ?? unquoteMustache(value, 3);

const splitDotNotation = (value: string): DotNotation | undefined => {
  const firstDot = value.indexOf('.');
  return firstDot > -1
    ? { owner: value.substring(0, firstDot), restPath: value.substring(firstDot + 1) }
    : undefined;
};

const knownOwners = ['data', 'selectedRow', 'form'];
const valuesToUnwrap = ['true', 'false'];
export const extractJsFieldFromKeyValue = (value: string): string => {
  const mustacheExpression = extractMustache(value);
  if (mustacheExpression) {
    const dotNotation = splitDotNotation(mustacheExpression);
    if (dotNotation) {
      return knownOwners.includes(dotNotation.owner)
        ? `${dotNotation.owner}.${dotNotation.restPath}`
        : `application.utils.evaluateString("${value}")`; // TODO: pass context
    }
  }

  const normalized = value?.toLowerCase();
  return valuesToUnwrap.includes(normalized)
    ? normalized
    : `"${value}"`;
};
