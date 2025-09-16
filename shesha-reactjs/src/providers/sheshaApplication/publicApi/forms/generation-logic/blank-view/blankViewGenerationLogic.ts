import { castToExtensionType, addDetailsPanel } from "../viewGenerationUtils";
import { FormMetadataHelper } from "../formMetadataHelper";
import { PropertyMetadataDto } from "@/apis/metadata";
import { BlankViewExtensionJson } from "../../models/BlankViewExtensionJson";
import { IEntityMetadata } from "@/interfaces";
import { BaseGenerationLogic } from "../baseGenerationLogic";

/**
 * Implements generation logic for blank views.
 */
export class BlankViewGenerationLogic extends BaseGenerationLogic {
  readonly typeName = "BlankViewGenerationLogic";

  protected getModelTypeFromReplacements(replacements: object): string | null {
    const extensionJson = castToExtensionType<BlankViewExtensionJson>(replacements);
    return extensionJson?.modelType || null;
  }

  protected async addComponentsToMarkup(
    markup: any, 
    _entity: IEntityMetadata, 
    nonFrameworkProperties: PropertyMetadataDto[],
    metadataHelper: FormMetadataHelper
  ): Promise<void> {
    try {
      // Add details panel - using shared function
      // Using await with a Promise-wrapped function to satisfy the require-await rule
      await Promise.resolve(addDetailsPanel(nonFrameworkProperties, markup, metadataHelper));
    } catch (error) {
      console.error("Error adding components to blank view markup:", error);
      throw error;
    }
  }
}