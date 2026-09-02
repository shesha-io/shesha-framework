import { IObjectMetadata } from "@/interfaces";
import { IObjectMetadataBuilder } from "../metadataBuilder";
import { useAvailableConstantsMetadata } from "./useAvailableConstantsMetadata";

export const useAvailableStandardConstantsMetadata = (
  makeComponentsNullable?: boolean,
  onBuild?: (metaBuilder: IObjectMetadataBuilder) => void,
): IObjectMetadata => {
  const availableConstants = useAvailableConstantsMetadata({
    addGlobalConstants: true,
    makeComponentsNullable,
    ...(onBuild ? { onBuild } : {}),
  });
  return availableConstants;
};
