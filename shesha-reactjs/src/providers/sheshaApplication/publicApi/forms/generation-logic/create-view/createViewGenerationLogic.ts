import { castToExtensionType, addDetailsPanel } from "../viewGenerationUtils";
import { FormMetadataHelper } from "../formMetadataHelper";
import { PropertyMetadataDto } from "@/apis/metadata";
import { IEntityMetadata } from "@/interfaces";
import { BaseGenerationLogic } from "../baseGenerationLogic";
import { CreateViewExtensionJson } from "../../models/CreateViewExtensionJson";

/**
 * Implements generation logic for create views.
 */
export class CreateViewGenerationLogic extends BaseGenerationLogic {
  readonly typeName = "CreateViewGenerationLogic";

  protected getModelTypeFromReplacements(replacements: object): string | null {
    const extensionJson = castToExtensionType<CreateViewExtensionJson>(replacements);
    return extensionJson?.modelType || null;
  }

  protected async addComponentsToMarkup(
    markup: unknown,
    _entity: IEntityMetadata,
    nonFrameworkProperties: PropertyMetadataDto[],
    metadataHelper: FormMetadataHelper,
  ): Promise<void> {
    try {
      // Add details panel - using shared function
      // Using await with a Promise-wrapped function to satisfy the require-await rule
      await Promise.resolve(addDetailsPanel(nonFrameworkProperties, markup, metadataHelper));
    } catch (error) {
      console.error("Error adding components to create view markup:", error);
      throw error;
    }
  }
}
