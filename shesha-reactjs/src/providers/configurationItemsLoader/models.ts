import { IReferenceList, IReferenceListItem } from "@/interfaces/referenceList";
import { PromisedValue } from "@/utils/promises";
import { IFormDto } from "../form/models";

export interface IFormsDictionary {
  [key: string]: Promise<IFormDto> | undefined;
}

export interface IReferenceListsDictionary {
  [key: string]: PromisedValue<IReferenceList> | undefined;
}

export interface ConfigurationDto {
  id: string;
  module: string;
  name: string;
  label: string | null;
  description: string | null;
};

export interface IConfigurationItemDto<TConfigDto extends ConfigurationDto = ConfigurationDto> {
  cacheMd5: string;
  configuration: TConfigDto;
}

export type FormConfigurationDto = ConfigurationDto & {
  markup: string;
  modelType: string | null;
  suppress: boolean;
  access: number | null;
  permissions: string[];
};


export type ReferenceListDto = ConfigurationDto & {
  items: IReferenceListItem[];
};
