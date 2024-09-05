export const STORED_FILES_DELAYED_UPDATE: string = 'storedFiles';

export interface IDeferredUpdateItem {
  id: any;
  data?: any;
}

export interface IDeferredUpdateGroup {
  name: string;
  items: IDeferredUpdateItem[];
}
