export type ItemsSelectionMode = 'updated' | 'updated-by-me' | 'all';

export type FilterState = {
  mode: ItemsSelectionMode;
  quickSearch?: string;
};

export const EMPTY_FILTER: FilterState = {
  mode: 'updated',
};
