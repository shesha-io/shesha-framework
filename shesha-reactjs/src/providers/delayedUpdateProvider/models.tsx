import { IAnyObject } from "@/interfaces";

export const STORED_FILES_DELAYED_UPDATE: string = 'storedFiles';

interface IDelayedUpdateItem {
  id: string;
  data: IAnyObject;
}

export interface IDelayedUpdateGroup {
  name: string;
  items: IDelayedUpdateItem[];
}
