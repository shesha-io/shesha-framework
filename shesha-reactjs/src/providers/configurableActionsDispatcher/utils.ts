import { isDefined } from "@/utils";
import { IConfigurableActionGroupDictionary } from "./models";

export const copyActionsTo = (src: IConfigurableActionGroupDictionary, dst: IConfigurableActionGroupDictionary): void => {
  for (const key in src) {
    if (src.hasOwnProperty(key) && isDefined(src[key])) {
      const srcGroup = src[key];
      if (!isDefined(dst[key])) {
        dst[key] = { ownerName: srcGroup.ownerName, actions: [...srcGroup.actions] };
      } else {
        const dstActions = [...dst[key].actions];
        srcGroup.actions.forEach((action) => {
          if (!dstActions.find((a) => a.name === action.name)) {
            dstActions.push(action);
          }
        });
        dst[key].actions = dstActions;
      }
    }
  }
};

export const mergeActionGroups = (left: IConfigurableActionGroupDictionary, right: IConfigurableActionGroupDictionary): IConfigurableActionGroupDictionary => {
  const result: IConfigurableActionGroupDictionary = {};
  copyActionsTo(left, result);
  copyActionsTo(right, result);
  return result;
};
