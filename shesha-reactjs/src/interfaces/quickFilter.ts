import { IItem } from './item';

export interface IQuickFilter extends IItem {
  readonly selected?: boolean;
}
