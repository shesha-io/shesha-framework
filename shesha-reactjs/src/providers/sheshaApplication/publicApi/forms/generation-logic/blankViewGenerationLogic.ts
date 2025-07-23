import { FormConfigurationDto } from "@/providers/form/api";
import { evaluateString } from "@/providers/form/utils";
import { GenerationLogic } from "./interface";
import { castToExtensionType, findContainersWithPlaceholder, processBaseMarkup } from "./viewGenerationUtils";
import { DesignerToolbarSettings, EditMode } from "@/index";
import { EntityMetadataHelper } from "./entityMetadataHelper";
import { nanoid } from "@/utils/uuid";
import { PropertyMetadataDto } from "@/apis/metadata";

export interface BlankViewExtensionJson {
  modelType?: string;
}

export class BlankViewGenerationLogic implements GenerationLogic {
  async processTemplate(markup: string, replacements: object, metadataHelper: EntityMetadataHelper): Promise<string> {
    try {
      let processedMarkup = processBaseMarkup(markup, replacements);
      const markupObj = JSON.parse(processedMarkup);

      const extensionJson = castToExtensionType<BlankViewExtensionJson>(replacements);
      if (extensionJson?.modelType && metadataHelper) {
        const entity = await metadataHelper.fetchEntityMetadata(extensionJson.modelType);

        const nonFrameworkProperties = (entity.properties as PropertyMetadataDto[]).filter(x => !x.isFrameworkRelated);

        await this.addComponentsToMarkup(markupObj, extensionJson, nonFrameworkProperties, metadataHelper);
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

  private async addComponentsToMarkup(markup: any, extensionJson: BlankViewExtensionJson, nonFrameworkProperties: PropertyMetadataDto[], metadataHelper: EntityMetadataHelper): Promise<any> {
    try {
      // Add details panel
      this.addDetailsPanel(nonFrameworkProperties, markup, extensionJson, metadataHelper);

    } catch (error) {
      console.error("Error adding components to markup:", error);
    }

    return markup;
  }

  /**
   * Adds details panel components to the markup.
   * Organizes properties into columns if there are more than five, otherwise adds them in a single column.
   *
   * @param metadata The properties metadata.
   * @param markup The JSON markup object.
   * @param _extensionJson The extension configuration (unused).
   * @param metadataHelper The metadata helper instance.
   */
  private addDetailsPanel(metadata: PropertyMetadataDto[], markup: any, _extensionJson: BlankViewExtensionJson, metadataHelper: EntityMetadataHelper): void {
    const builder = new DesignerToolbarSettings({});

    const detailsPanelContainer = findContainersWithPlaceholder(markup, "//*DETAILSPANEL*//");

    if (detailsPanelContainer.length === 0) {
      throw new Error("No details panel container found in the markup.");
    }

    const column1 = [];
    const column2 = [];
    if (metadata.length > 5) {

      metadata.forEach((prop, index) => {
        const columnBuilder = new DesignerToolbarSettings({});
        metadataHelper.getConfigFields(prop, columnBuilder);

        if (index % 2 === 0) {
          column1.push(...columnBuilder.toJson());
        } else {
          column2.push(...columnBuilder.toJson());
        };
      });

      builder.addColumns({
        id: nanoid(),
        propertyName: "detailsPanel",
        label: "Details Panel",
        editMode: 'inherited' as EditMode,
        hideLabel: true,
        hidden: false,
        componentName: "detailsPanel",
        gutterX: 10,
        gutterY: 10,
        columns: [{
          id: nanoid(),
          flex: 12,
          offset: 0,
          push: 0,
          pull: 0,
          components: column1
        },
        {
          id: nanoid(),
          flex: 12,
          offset: 0,
          push: 0,
          pull: 0,
          components: column2
        }]
      });
    } else {
      metadata.forEach(prop => {
        metadataHelper.getConfigFields(prop, builder);
      });
    }

    if (detailsPanelContainer[0].components && Array.isArray(detailsPanelContainer[0].components)) {
      detailsPanelContainer[0].components.push(...builder.toJson());
    }
  }
}
