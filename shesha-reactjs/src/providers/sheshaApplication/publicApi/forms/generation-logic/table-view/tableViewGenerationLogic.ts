import { castToExtensionType, findContainersWithPlaceholder, getDataTypePriority, getColumnWidthByDataType, humanizeModelType } from "../viewGenerationUtils";
import { FormMetadataHelper } from "../formMetadataHelper";
import { PropertyMetadataDto } from "@/apis/metadata";
import { DesignerToolbarSettings, IEntityMetadata } from "@/interfaces";
import { nanoid } from "@/utils/uuid";
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
    markup: unknown,
    entity: IEntityMetadata,
    nonFrameworkProperties: PropertyMetadataDto[],
    _metadataHelper: FormMetadataHelper,
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
    const title = entity.typeAccessor ? humanizeModelType(entity.typeAccessor) : "Table";

    const titleContainer = findContainersWithPlaceholder(markup, "//*TABLEFILTER*//");

    if (titleContainer.length === 0) {
      throw new Error("No table filter container found in the markup.");
    }

    const builder = new DesignerToolbarSettings({});

    builder.addTableViewSelector({
      id: nanoid(),
      hidden: false,
      filters: [{
        id: nanoid(),
        name: title,
        sortOrder: 1,
        defaultSelected: true,
      }],
    });

    if (titleContainer[0].components && Array.isArray(titleContainer[0].components)) {
      titleContainer[0].components.push(...builder.toJson());
    }
  }

  /**
   * Adds columns to the table view based on the entity metadata and non-framework properties.
   * Properties are sorted with required fields first, then by dataType priority.
   *
   * @param nonFrameworkProperties The list of non-framework properties for the entity.
   * @param markup The JSON markup object.
   */
  private addColumns(nonFrameworkProperties: PropertyMetadataDto[], markup: any): void {
    const tableContainer = findContainersWithPlaceholder(markup, "//*TABLECOLUMNS*//");

    if (tableContainer.length === 0) {
      throw new Error("No table container found in the markup.");
    }

    // Sort the properties: required fields first, then by dataType priority
    const sortedProperties = [...nonFrameworkProperties].sort((a, b) => {
      // Sort by required status (required first)
      if (a.required !== b.required) {
        return a.required ? -1 : 1;
      }

      // Sort by dataType priority only
      const priorityA = getDataTypePriority(a.dataType, a.dataFormat);
      const priorityB = getDataTypePriority(b.dataType, b.dataFormat);

      return priorityA - priorityB;
    });

    // Implementation for adding columns to the markup
    const builder = new DesignerToolbarSettings({});

    const dataTableName = `datatable ${nanoid()}`;
    builder.addDatatable({
      id: nanoid(),
      propertyName: dataTableName,
      componentName: dataTableName,
      items: sortedProperties.map((prop, idx) => {
        // Get column width based on data type
        const width = getColumnWidthByDataType(prop.dataType, prop.dataFormat);

        return {
          id: nanoid(),
          columnType: 'data',
          propertyName: toCamelCase(prop.path || ''),
          caption: prop.label || '',
          isVisible: true,
          description: prop.description || '',
          sortOrder: idx,
          itemType: 'item',
          minWidth: width.min,
          maxWidth: width.max,
          allowSorting: true,
        };
      }),
    });

    if (tableContainer[0].components && Array.isArray(tableContainer[0].components)) {
      tableContainer[0].components.push(...builder.toJson());
    }
  }
}
