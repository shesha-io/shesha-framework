export const DropPositions = {
  Before: -1,
  Inside: 0,
  After: 1,
};

export const getDropPositionText = (dropPosition: number): string => {
  switch (dropPosition) {
    case DropPositions.After: return 'after';
    case DropPositions.Before: return 'before';
    case DropPositions.Inside: return 'inside';
    default: return 'unknown';
  }
};
