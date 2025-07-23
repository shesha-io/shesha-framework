import { FormConfigurationDto } from "@/providers/form/api";
import { evaluateString } from "@/providers/form/utils";
import { GenerationLogic } from "./interface";
import { castToExtensionType, findContainersWithPlaceholder, processBaseMarkup } from "./viewGenerationUtils";
import { EntityMetadataHelper } from "./entityMetadataHelper";
import { PropertyMetadataDto } from "@/apis/metadata";
import { DesignerToolbarSettings, IEntityMetadata } from "@/interfaces";
import { nanoid } from "nanoid";
import { ISpecification } from "@/interfaces/metadata";
import { ITableViewProps } from "@/providers/dataTable/filters/models";
import { toCamelCase } from "@/utils/string";

export interface TableViewExtensionJson {
  modelType: string;
}

export class TableViewGenerationLogic implements GenerationLogic {
  async processTemplate(markup: string, replacements: object, metadataHelper?: EntityMetadataHelper): Promise<string> {
    try {
      let processedMarkup = processBaseMarkup(markup, replacements);
      const markupObj = JSON.parse(processedMarkup);

      const extensionJson = castToExtensionType<TableViewExtensionJson>(replacements);
      if (extensionJson?.modelType && metadataHelper) {
        const entity = await metadataHelper.fetchEntityMetadata(extensionJson.modelType);

        const nonFrameworkProperties = (entity.properties as PropertyMetadataDto[]).filter(x => !x.isFrameworkRelated);

        console.log("LOG:: markUp", markup)
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

  /**
 * Adds components to the markup based on the extension configuration.
 * This method adds header, details panel, and child tables to the markup object
 * according to the provided extension configuration and entity metadata.
 *
 * @param markup The JSON markup object to modify.
 * @param extensionJson The extension configuration for the details view.
 * @param entity The entity metadata for the main entity.
 * @param nonFrameworkProperties The filtered list of non-framework properties for the entity.
 * @param metadataHelper The form builder or metadata helper instance.
 * @returns The updated markup object with added components.
 */
  private async addComponentsToMarkup(markup: any, entity: IEntityMetadata, nonFrameworkProperties: PropertyMetadataDto[]): Promise<any> {
    try {
      // Add header components
      this.addHeader(entity, markup);

      this.addColumns(nonFrameworkProperties, markup);
    } catch (error) {
      console.error("Error adding components to markup:", error);
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
    if (entity.specifications.length) {
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
          // Optionally add tooltip or other ITableViewProps fields if available
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
    })

    if (tableContainer[0].components && Array.isArray(tableContainer[0].components)) {
      tableContainer[0].components.push(...builder.toJson());
    }
  }
}
