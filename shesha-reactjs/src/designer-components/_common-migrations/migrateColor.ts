export const legacyColor2Hex = (value?: string | object): string | undefined => {
  if (!value)
    return undefined;

  const hex = typeof (value) === 'string'
    ? value
    : typeof (value) === 'object' && "hex" in value && typeof (value['hex']) === 'string'
      ? value['hex']
      : undefined;
  return hex;
};
