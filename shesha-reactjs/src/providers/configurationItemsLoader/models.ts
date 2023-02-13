import { IReferenceList } from "../../interfaces/referenceList";
import { PromisedValue } from "../../utils/promises";
import { IComponentSettings } from "../appConfigurator/models";
import { IFormDto } from "../form/models";

export interface IFormsDictionary {
  [key: string]: Promise<IFormDto>;
}

export interface IReferenceListsDictionary {
  [key: string]: PromisedValue<IReferenceList>;
}

export interface IComponentsDictionary {
  [key: string]: PromisedValue<IComponentSettings>;
}