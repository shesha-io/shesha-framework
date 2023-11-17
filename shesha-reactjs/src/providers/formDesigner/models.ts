import { IPropertyMetadata } from '../../interfaces/metadata';

export type IFormDesignerActionFlag = 'done' | 'redo' | 'publish' | 'settings' | 'undo' | 'version';

/** Named Data Source */
export interface IDataSource {
  id: string;
  name: string;
  containerType: string;
  items: IPropertyMetadata[];
}
