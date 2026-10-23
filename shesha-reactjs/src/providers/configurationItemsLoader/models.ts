import { IReferenceListItem } from "@/interfaces/referenceList";
import { FormIdentifier } from "../form/models";


export interface ConfigurationDto {
  id: string;
  module: string;
  name: string;
  label: string | null;
  description: string | null;
};

export interface IConfigurationItemDto<TConfigDto = ConfigurationDto> {
  cacheMd5: string;
  configuration: TConfigDto;
}

export type FormConfigurationDto = ConfigurationDto & {
  markup: string;
  modelType: string | null;
  access: number | null;
  permissions: string[];
};


export type ReferenceListDto = ConfigurationDto & {
  items: IReferenceListItem[];
};

export interface IGetComponentPayload {
  name: string;
  isApplicationSpecific: boolean;
  skipCache: boolean;
}
export interface IUpdateComponentPayload {
  name: string;
  module?: string;
  isApplicationSpecific: boolean;
  settings: object;
}

export interface IClearFormCachePayload {
  formId: FormIdentifier;
}
