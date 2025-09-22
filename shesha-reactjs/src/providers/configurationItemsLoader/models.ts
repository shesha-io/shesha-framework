import { IReferenceList } from "@/interfaces/referenceList";
import { PromisedValue } from "@/utils/promises";
import { IFormDto } from "../form/models";

export interface IFormsDictionary {
  [key: string]: Promise<IFormDto> | undefined;
}

export interface IReferenceListsDictionary {
  [key: string]: PromisedValue<IReferenceList> | undefined;
}
