import { castToExtensionType, findContainersWithPlaceholder } from "../viewGenerationUtils";
import { FormMetadataHelper } from "../formMetadataHelper";
import { PropertyMetadataDto } from "@/apis/metadata";
import { DesignerToolbarSettings, IEntityMetadata } from "@/interfaces";
import { nanoid } from "@/utils/uuid";
import { ISpecification } from "@/interfaces/metadata";
import { ITableViewProps } from "@/providers/dataTable/filters/models";
import { toCamelCase } from "@/utils/string";
import { TableViewExtensionJson } from "../../models/TableViewExtensionJson";
import { BaseGenerationLogic } from "../baseGenerationLogic";

/**
 * Implements generation logic for table views.
 * This class processes the template markup, adds header components, and configures table columns.
 */
export class TableViewGenerationLogic extends BaseGenerationLogic {
  readonly typeName = "TableViewGenerationLogic";

  protected getModelTypeFromReplacements(replacements: object): string | null {
    const extensionJson = castToExtensionType<TableViewExtensionJson>(replacements);
    return extensionJson?.modelType || null;
  }

  protected async addComponentsToMarkup(
    markup: any, 
    entity: IEntityMetadata, 
    nonFrameworkProperties: PropertyMetadataDto[],
    _metadataHelper: FormMetadataHelper
  ): Promise<void> {
    try {
      // Add header components
      this.addHeader(entity, markup);

      this.addColumns(nonFrameworkProperties, markup);
      
      // Using await with a Promise.resolve() to satisfy the require-await rule
      await Promise.resolve();
    } catch (error) {
      console.error("Error adding components to table view markup:", error);
      throw error;
    }
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
          propertyName: toCamelCase(prop.path || ''),
          caption: prop.label || '',
          isVisible: true,
          description: prop.description || '',
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
