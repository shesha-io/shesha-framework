import { ContainerDirection } from '../common/interfaces';
import { DROP_TARGET_DIRECTION_ATTR } from './models';

/**
 * Direction the items of a designer drop container are laid out in. Containers mostly get their layout from styling
 * (e.g. a Container set to display flex in a row), not from their `direction` setting, so a container that does not
 * declare itself horizontal is checked for a row layout: a flex row, or a grid with more than one column.
 */
export const getDropDirection = (container: HTMLElement): ContainerDirection => {
  if (container.getAttribute(DROP_TARGET_DIRECTION_ATTR) === 'horizontal') return 'horizontal';

  const { display, flexDirection, gridTemplateColumns } = getComputedStyle(container);
  if (display === 'flex' || display === 'inline-flex')
    return flexDirection.startsWith('column') ? 'vertical' : 'horizontal';
  if (display === 'grid' || display === 'inline-grid')
    return gridTemplateColumns.trim().split(/\s+/).length > 1 ? 'horizontal' : 'vertical';
  return 'vertical';
};
