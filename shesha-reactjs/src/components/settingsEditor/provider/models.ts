import { FormFullName } from "../../..";

export type LoadingState = 'waiting' | 'loading' | 'success' | 'failed';

export interface ISettingConfiguration {
    id: string;
    category?: string;
    name: string;
    dataType: string;
    editorForm?: FormFullName;
    label?: string;
    description?: string;
    module?: string;
    isClientSpecific: boolean;
}  

export type SettingValue = any;

export interface ISettingIdentifier {
    module?: string;
    name: string;
    appKey?: string;
}

export interface IFrontEndApplication {
    name: string;
    appKey: string;
}

export interface FrontEndApplicationDto {
    id: string;
    name: string;
    appKey: string;
    description?: string;
}