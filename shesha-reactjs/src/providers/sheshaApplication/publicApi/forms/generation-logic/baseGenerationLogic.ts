import { FormConfigurationDto } from "@/providers/form/api";
import { evaluateString } from "@/providers/form/utils";
import { FormMetadataHelper } from "./formMetadataHelper";
import { GenerationLogic } from "./interface";
import { processBaseMarkup } from "./viewGenerationUtils";
import { PropertyMetadataDto } from "@/apis/metadata";
import { IEntityMetadata } from "@/interfaces";

/**
 * Abstract base class for generation logic implementations
 * Contains common functionality for template processing
 */
export abstract class BaseGenerationLogic implements GenerationLogic {
  /**
   * The type name that this implementation supports.
   * Should match the `generationLogicTypeName` property in the template.
   */
  abstract readonly typeName: string;

  /**
   * Process the template markup with replacements and specialized logic
   */
  async processTemplate(markup: string, replacements: object, metadataHelper?: FormMetadataHelper): Promise<string> {
    try {
      let processedMarkup = processBaseMarkup(markup, replacements);
      const markupObj = JSON.parse(processedMarkup);

      if (metadataHelper && this.shouldFetchMetadata(replacements)) {
        try {
          const { entity, nonFrameworkProperties } = await this.fetchEntityMetadata(replacements, metadataHelper);
          if (entity && nonFrameworkProperties) {
            await this.addComponentsToMarkup(markupObj, entity, nonFrameworkProperties, metadataHelper, replacements);
          }
        } catch (entityError) {
          console.error(`Error processing entity metadata in ${this.typeName}:`, entityError);
          // Continue processing without entity metadata
        }
      }

      return JSON.stringify(markupObj);
    } catch (error) {
      console.error(`Error processing ${this.typeName} markup:`, error);
      return evaluateString(markup, replacements, true);
    }
  }

  /**
   * Check if this generation logic implementation supports the given template
   */
  supportsTemplate(template: FormConfigurationDto): boolean {
    return template?.generationLogicTypeName === this.typeName;
  }

  /**
   * Check if metadata should be fetched for this template
   */
  protected shouldFetchMetadata(replacements: object): boolean {
    return this.getModelTypeFromReplacements(replacements) !== null;
  }

  /**
   * Get the model type from the replacements object
   */
  protected abstract getModelTypeFromReplacements(replacements: object): string | null;

  /**
   * Fetch entity metadata and extract non-framework properties
   */
  protected async fetchEntityMetadata(replacements: object, metadataHelper: FormMetadataHelper): Promise<{ entity: IEntityMetadata; nonFrameworkProperties: PropertyMetadataDto[] }> {
    const modelType = this.getModelTypeFromReplacements(replacements);
    if (!modelType) {
      throw new Error('Model type is required for fetching metadata');
    }

    return await metadataHelper.fetchEntityMetadataWithPropertiesAsync(modelType);
  }

  /**
   * Add components to the markup based on entity metadata and properties
   */
  protected abstract addComponentsToMarkup(
    markup: unknown,
    entity: IEntityMetadata,
    nonFrameworkProperties: PropertyMetadataDto[],
    metadataHelper: FormMetadataHelper,
    replacements?: object
  ): Promise<void>;
}
