import { ISettingIdentifier } from "@/providers/settings/models";

export const settingIdentifiersEqual = (id1: ISettingIdentifier, id2: ISettingIdentifier): boolean => id1.module === id2.module && id1.name === id2.name;
