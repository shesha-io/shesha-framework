/**
 * Dto of the Shesha.Domain.ReferenceListItem
 */
export interface ReferenceListItemDto {
  id: string;
  item: string | null;
  itemValue: number;
  description: string | null;
  orderIndex: number;
  /**
   * Color associated with the item
   */
  color: string | null;
  /**
   * Icon associated with the item
   */
  icon: string | null;
  /**
   * Short alias
   */
  shortAlias: string | null;
}
