import { ChangeEvent } from 'react';

export const isChangeEvent = <T extends HTMLElement = HTMLInputElement>(
  event: unknown,
): event is ChangeEvent<T> => {
  return (
    typeof event === 'object' &&
    event !== null &&
    'target' in event &&
    'currentTarget' in event &&
    'type' in event &&
    'bubbles' in event
  );
};
