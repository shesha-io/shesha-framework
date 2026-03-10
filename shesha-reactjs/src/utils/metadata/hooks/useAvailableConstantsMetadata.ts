import { useMemo } from "react";
import { IObjectMetadata } from "@/interfaces";
import { isPropertiesArray } from "@/interfaces/metadata";
import { IObjectMetadataBuilder } from "../metadataBuilder";
import { useGlobalConstants } from "./useGlobalConstants";
import { SheshaConstants } from "@/utils/metadata/standardProperties";
import { StandardConstantInclusionArgs } from "@/publicJsApis/metadataBuilder";
import { useMetadataBuilderFactory } from "./useMetadataBuilderFactory";

const ALL_STANDARD_CONSTANTS = [
  SheshaConstants.globalState,
  SheshaConstants.setGlobalState,
  SheshaConstants.selectedRow,
  SheshaConstants.contexts,
  SheshaConstants.pageContext,
  SheshaConstants.http,
  SheshaConstants.message,
  SheshaConstants.moment,
  SheshaConstants.fileSaver,
  SheshaConstants.form,
  SheshaConstants.formData,
];

export interface AvailableConstantsArgs {
  addGlobalConstants?: boolean;
  standardConstants?: StandardConstantInclusionArgs[];
  onBuild?: (metaBuilder: IObjectMetadataBuilder) => void;
}

export const useAvailableConstantsMetadata = ({ addGlobalConstants, onBuild, standardConstants = ALL_STANDARD_CONSTANTS }: AvailableConstantsArgs): IObjectMetadata => {
  const globalProps = useGlobalConstants();

  const metadataBuilderFactory = useMetadataBuilderFactory();

  const response = useMemo<IObjectMetadata>(() => {
    const metaBuilder = metadataBuilderFactory();

    const objectBuilder = metaBuilder.object("constants") as IObjectMetadataBuilder;

    objectBuilder.addStandard(standardConstants);

    onBuild?.(objectBuilder);

    const meta = objectBuilder.build();

    if (addGlobalConstants && globalProps && isPropertiesArray(meta.properties)) {
      meta.properties.push(...globalProps);
    }

    return meta;
  }, [addGlobalConstants, globalProps]);

  return response;
};
