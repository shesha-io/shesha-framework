import { FormConfigurationDto } from "@/providers/form/api";
import { evaluateString } from "@/providers/form/utils";
import { GenerationLogic } from "../interface";
import { castToExtensionType, processBaseMarkup, addDetailsPanel } from "../viewGenerationUtils";
import { EntityMetadataHelper } from "../entityMetadataHelper";
import { PropertyMetadataDto } from "@/apis/metadata";
import { BlankViewExtensionJson } from "../../models/BlankViewExtensionJson";

/**
 * Implements generation logic for blank views.
 */
export class BlankViewGenerationLogic implements GenerationLogic {
  async processTemplate(markup: string, replacements: object, metadataHelper: EntityMetadataHelper): Promise<string> {
    try {
      let processedMarkup = processBaseMarkup(markup, replacements);
      const markupObj = JSON.parse(processedMarkup);

      const extensionJson = castToExtensionType<BlankViewExtensionJson>(replacements);
      if (extensionJson?.modelType && metadataHelper) {
        const entity = await metadataHelper.fetchEntityMetadataAsync(extensionJson.modelType);

        const nonFrameworkProperties = (entity.properties as PropertyMetadataDto[]).filter(x => !x.isFrameworkRelated);

        await this.addComponentsToMarkup(markupObj, nonFrameworkProperties, metadataHelper);
      }
      return JSON.stringify(markupObj);
    } catch (error) {
      console.error("Error processing blank view markup:", error);
      return evaluateString(markup, replacements, true);
    }
  }

  supportsTemplate(template: FormConfigurationDto): boolean {
    return template?.generationLogicTypeName === "BlankViewGenerationLogic";
  }

  private addComponentsToMarkup(markup: any, nonFrameworkProperties: PropertyMetadataDto[], metadataHelper: EntityMetadataHelper): any {
    try {
      // Add details panel - using shared function
      addDetailsPanel(nonFrameworkProperties, markup, metadataHelper);
    } catch (error) {
      console.error("Error adding components to blank view markup:", error);
      throw error;
    }
    return markup;
  }
}