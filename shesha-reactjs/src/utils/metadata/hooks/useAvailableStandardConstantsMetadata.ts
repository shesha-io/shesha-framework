import { IObjectMetadata } from "@/interfaces";
import { useAvailableConstantsMetadata } from "./useAvailableConstantsMetadata";

export const useAvailableStandardConstantsMetadata = (): IObjectMetadata => {
  const availableConstants = useAvailableConstantsMetadata({
    addGlobalConstants: true,
  });
  return availableConstants;
};
