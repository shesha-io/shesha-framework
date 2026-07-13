import { useMemo } from "react";
import { IObjectMetadata } from "@/interfaces";
import { isPropertiesArray } from "@/interfaces/metadata";
import { IObjectMetadataBuilder } from "../metadataBuilder";
import { useGlobalConstants } from "./useGlobalConstants";
import { SheshaConstants } from "@/utils/metadata/standardProperties";
import { StandardConstantInclusionArgs } from "@/publicJsApis/apis/metadataBuilder";
import { useMetadataBuilderFactory } from "./useMetadataBuilderFactory";

const ALL_STANDARD_CONSTANTS = [
  SheshaConstants.globalState,
  SheshaConstants.setGlobalState,
  SheshaConstants.selectedRow,
  SheshaConstants.contexts,
  SheshaConstants.pageContext,
  SheshaConstants.page,
  SheshaConstants.http,
  SheshaConstants.message,
  SheshaConstants.modal,
  SheshaConstants.moment,
  SheshaConstants.fileSaver,
  SheshaConstants.form,
  SheshaConstants.formData,
  SheshaConstants.components,
  SheshaConstants.webStorage,
];

export interface AvailableConstantsArgs {
  addGlobalConstants?: boolean;
  standardConstants?: StandardConstantInclusionArgs[];
  makeComponentsNullable?: boolean | undefined;
  onBuild?: (metaBuilder: IObjectMetadataBuilder) => void;
}

export const useAvailableConstantsMetadata = ({ addGlobalConstants, makeComponentsNullable, onBuild, standardConstants = ALL_STANDARD_CONSTANTS }: AvailableConstantsArgs): IObjectMetadata => {
  const globalProps = useGlobalConstants();

  const metadataBuilderFactory = useMetadataBuilderFactory(makeComponentsNullable);

  const response = useMemo<IObjectMetadata>(() => {
    const metaBuilder = metadataBuilderFactory();

    const objectBuilder = metaBuilder.object("constants") as IObjectMetadataBuilder;

    objectBuilder.addStandard(standardConstants);

    onBuild?.(objectBuilder);

    const meta = objectBuilder.build();

    if (addGlobalConstants && isPropertiesArray(meta.properties)) {
      meta.properties.push(...globalProps);
    }

    return meta;
    // TODO (performance): test re-renders and optimize if required
  }, [addGlobalConstants, globalProps, onBuild, metadataBuilderFactory, standardConstants]);

  return response;
};
