import moment from "moment";
import { ModalApi } from "./modal";

type MomentType = typeof moment;

export type FormIdentifier = string | { name: string; module: string | null };

export interface IUtilsApi {
  readonly moment: MomentType;
  /** Modal API - for displaying dialogs and forms in modals (limited functionality if DynamicModalProvider is not available) */
  readonly modal: ModalApi;
  /** File Saver API */
  saveAs: (data: Blob | string, filename?: string) => void;
  evaluateString: (template: string, data: object, skipUnknownTags?: boolean) => string;
  /** Get form url */
  getFormUrl?: ((formId: FormIdentifier) => string) | undefined;
  /** Prepare url (apply conventions) */
  prepareUrl?: ((url: string) => string) | undefined;
}
