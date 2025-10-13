import { FormConfigurationDto } from "@/providers/form/api";
import { FormMetadataHelper } from "./formMetadataHelper";

/**
 * The GenerationLogic interface defines how template forms are processed and instantiated.
 * Different implementations handle specific types of views (e.g., DetailsView, TableView)
 */
export interface GenerationLogic {
  /**
   * Process the template markup with replacements and any specialized logic
   * @param markup The original template markup
   * @param replacements An object containing values to replace in the template
   * @returns The processed markup ready for use
   */
  processTemplate(
    markup: string,
    replacements: object,
    metadataHelper?: FormMetadataHelper
  ): Promise<string>;

  /**
   * Check if this generation logic implementation supports the given template
   * @param template The form template to check
   * @returns True if this implementation supports the template
   */
  supportsTemplate(template: FormConfigurationDto): boolean;
}
