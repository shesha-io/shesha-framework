export const legacyColor2Hex = (value?: string | object): string => {
  if (!value)
    return undefined;

  const hex = typeof (value) === 'string'
    ? value
    : typeof (value) === 'object' && typeof (value['hex']) === 'string'
      ? value['hex']
      : undefined;
  return hex;
};
