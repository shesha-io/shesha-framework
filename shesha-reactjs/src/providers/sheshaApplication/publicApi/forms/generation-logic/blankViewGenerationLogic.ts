import { FormConfigurationDto } from "@/providers/form/api";
import { evaluateString } from "@/providers/form/utils";
import { GenerationLogic } from "./interface";
import { processBaseMarkup } from "./viewGenerationUtils";

export class BlankViewGenerationLogic implements GenerationLogic {
  async processTemplate(markup: string, replacements: object): Promise<string> {
    try {
      let processedMarkup = processBaseMarkup(markup, replacements);
      return processedMarkup;
    } catch (error) {
      console.error("Error processing blank view markup:", error);
      return evaluateString(markup, replacements, true);
    }
  }

  supportsTemplate(template: FormConfigurationDto): boolean {
    return template?.generationLogicTypeName === "BlankViewGenerationLogic";
  }
}
