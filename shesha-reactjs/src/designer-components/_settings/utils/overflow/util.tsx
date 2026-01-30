export const getOverflowStyle = (overflow: boolean | string | undefined, hideScrollBar: boolean): React.CSSProperties => {
  // Only apply CSS overflow styles if overflow is explicitly true (boolean)
  // String values like 'dropdown', 'menu', 'scroll' are for component-specific behavior, not CSS overflow
  if (overflow !== true) return {};
  return {
    overflow: 'auto',
    scrollbarWidth: hideScrollBar ? 'none' : 'thin',
    scrollbarColor: hideScrollBar ? undefined : '#8B8B8B transparent',
  };
};
