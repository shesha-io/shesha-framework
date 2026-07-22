import { IObjectMetadata } from "@/interfaces";
import { useAvailableConstantsMetadata } from "./useAvailableConstantsMetadata";

export const useAvailableStandardConstantsMetadata = (makeComponentsNullable?: boolean): IObjectMetadata => {
  const availableConstants = useAvailableConstantsMetadata({
    addGlobalConstants: true,
    makeComponentsNullable,
  });
  return availableConstants;
};
