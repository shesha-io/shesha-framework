import { IFlatComponentsStructure, IFormSettings } from "../form/models";

export interface UpToDateForm {
    id?: string;
    module?: string;
    name?: string;
    label?: string;
    description?: string;
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

    flatStructure: IFlatComponentsStructure;
    settings: IFormSettings;
}

export const FORM_LOADING_STATES = ['ready', 'loading', 'error'] as const;
export type FormLoadingState = typeof FORM_LOADING_STATES[number];

export interface FormLoadingItem {
    state: FormLoadingState;
    form?: UpToDateForm;
    error?: string;
    promise: Promise<UpToDateForm>;
}

export interface FormsCache {
    [key: string]: FormLoadingItem;
}