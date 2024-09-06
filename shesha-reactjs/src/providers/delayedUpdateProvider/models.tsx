export const STORED_FILES_DELAYED_UPDATE: string = 'storedFiles';

export interface IDelayedUpdateItem {
  id: any;
  data?: any;
}

export interface IDelayedUpdateGroup {
  name: string;
  items: IDelayedUpdateItem[];
}
