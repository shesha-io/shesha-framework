import { FormRawMarkup, IFormSettings } from '../form/models';

export interface IPersistedFormProps {
  id?: string;
  module?: string;
  name?: string;
  label?: string;
  description?: string;
  markup?: FormRawMarkup;
  formSettings?: IFormSettings;
  /**
   * Version number
   */
  versionNo?: number;
  /**
   * Version status
   */
  versionStatus?: number;

  /**
   * If true, indicates that it's the last version of the form
   */
  isLastVersion?: boolean;
}
