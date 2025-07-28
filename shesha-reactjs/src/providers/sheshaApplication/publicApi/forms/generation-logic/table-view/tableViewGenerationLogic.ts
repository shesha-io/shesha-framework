import { FormConfigurationDto } from "@/providers/form/api";
import { evaluateString } from "@/providers/form/utils";
import { GenerationLogic } from "../interface";
import { castToExtensionType, findContainersWithPlaceholder, processBaseMarkup } from "../viewGenerationUtils";
import { EntityMetadataHelper } from "../entityMetadataHelper";
import { PropertyMetadataDto } from "@/apis/metadata";
import { DesignerToolbarSettings, IEntityMetadata } from "@/interfaces";
import { nanoid } from "@/utils/uuid";
import { ISpecification } from "@/interfaces/metadata";
import { ITableViewProps } from "@/providers/dataTable/filters/models";
import { toCamelCase } from "@/utils/string";
import { TableViewExtensionJson } from "../../models/TableViewExtensionJson";

/**
 * Implements generation logic for table views.
 * This class processes the template markup, adds header components, and configures table columns.
 */
export class TableViewGenerationLogic implements GenerationLogic {
  async processTemplate(markup: string, replacements: object, metadataHelper?: EntityMetadataHelper): Promise<string> {
    try {
      let processedMarkup = processBaseMarkup(markup, replacements);
      const markupObj = JSON.parse(processedMarkup);

      const extensionJson = castToExtensionType<TableViewExtensionJson>(replacements);
      if (extensionJson?.modelType && metadataHelper) {
        const entity = await metadataHelper.fetchEntityMetadataAsync(extensionJson.modelType);

        const nonFrameworkProperties = (entity.properties as PropertyMetadataDto[]).filter(x => !x.isFrameworkRelated);

        await this.addComponentsToMarkup(markupObj, entity, nonFrameworkProperties);
      }

      return JSON.stringify(markupObj);
    } catch (error) {
      console.error("Error processing table view markup:", error);
      return evaluateString(markup, replacements, true);
    }
  }

  supportsTemplate(template: FormConfigurationDto): boolean {
    return template?.generationLogicTypeName === "TableViewGenerationLogic";
  }

  private addComponentsToMarkup(markup: any, entity: IEntityMetadata, nonFrameworkProperties: PropertyMetadataDto[]): any {
    try {
      // Add header components
      this.addHeader(entity, markup);

      this.addColumns(nonFrameworkProperties, markup);
    } catch (error) {
      console.error("Error adding components to table view markup:", error);
      throw error;
    }

    return markup;
  }

  /**
   * Adds header components to the markup.
   * Sets the title and optionally adds a key information bar if configured.
   *
   * @param entity The entity metadata.
   * @param metadata The properties metadata.
   * @param markup The JSON markup object.
   * @param extensionJson The extension configuration.
   * @param metadataHelper The metadata helper instance.
   */
  private addHeader(entity: IEntityMetadata, markup: any): void {
    const title = `${entity.typeAccessor} Table`;

    const titleContainer = findContainersWithPlaceholder(markup, "//*TABLEFILTER*//");

    if (titleContainer.length === 0) {
      throw new Error("No table filter container found in the markup.");
    }

    const builder = new DesignerToolbarSettings({});

    // First filter: static title filter
    const filters: ITableViewProps[] = [
      {
        id: nanoid(),
        name: title,
        sortOrder: 1,
        defaultSelected: true,
      }
    ];

    // Add filters from IEntityMetadata specifications
    if (entity.specifications?.length) {
      entity.specifications.forEach((spec: ISpecification, index: number) => {
        filters.push({
          id: nanoid(),
          name: spec.friendlyName,
          sortOrder: index + 2,
          expression: {
            "and": [
              {
                "is_satisfied": {
                  "var": spec.name
                }
              }
            ]
          },
        });
      });
    }

    builder.addTableViewSelector({
      id: nanoid(),
      hidden: false,
      filters
    });

    if (titleContainer[0].components && Array.isArray(titleContainer[0].components)) {
      titleContainer[0].components.push(...builder.toJson());
    }
  }

  /**
   * Adds columns to the table view based on the entity metadata and non-framework properties.
   * This method is a placeholder for future implementation.
   *
   * @param nonFrameworkProperties The list of non-framework properties for the entity.
   * @param markup The JSON markup object.
   * @param metadataHelper The metadata helper instance.
   */
  private addColumns(nonFrameworkProperties: PropertyMetadataDto[], markup: any): void {
    const tableContainer = findContainersWithPlaceholder(markup, "//*TABLECOLUMNS*//");

    if (tableContainer.length === 0) {
      throw new Error("No table container found in the markup.");
    }

    // Implementation for adding columns to the markup
    const builder = new DesignerToolbarSettings({});

    builder.addDatatable({
      id: nanoid(),
      propertyName: `datatable ${nanoid()}`,
      items: nonFrameworkProperties.map((prop, idx) => {
        return {
          id: nanoid(),
          columnType: 'data',
          propertyName: toCamelCase(prop.path),
          caption: prop.label,
          isVisible: true,
          description: prop.description,
          sortOrder: idx,
          itemType: 'item'
        };
      })
    });

    if (tableContainer[0].components && Array.isArray(tableContainer[0].components)) {
      tableContainer[0].components.push(...builder.toJson());
    }
  }
}
