import { PropertyMetadataDto } from "@/apis/metadata";
import { DesignerToolbarSettings, EditMode, IEntityMetadata } from "@/interfaces";
import { nanoid } from "@/utils/uuid";
import { toCamelCase } from "@/utils/string";
import { FormMetadataHelper } from "../formMetadataHelper";
import { IConfigurableColumnsProps } from "@/providers/datatableColumnsConfigurator/models";
import { findContainersWithPlaceholder, castToExtensionType, humanizeModelType, addDetailsPanel, getDataTypePriority, getColumnWidthByDataType } from "../viewGenerationUtils";
import { DetailsViewExtensionJson } from "../../models/DetailsViewExtensionJson";
import { ROW_COUNT } from "../../constants";
import { BaseGenerationLogic } from "../baseGenerationLogic";

/**
 * Implements generation logic for detail views.
 * Handles processing template markup for detail views, including specific header components, key information bars, and child tables.
 */
export class DetailsViewGenerationLogic extends BaseGenerationLogic {
  readonly typeName = "DetailsViewGenerationLogic";

  protected getModelTypeFromReplacements(replacements: object): string | null {
    const extensionJson = castToExtensionType<DetailsViewExtensionJson>(replacements);
    return extensionJson?.modelType || null;
  }

  protected async addComponentsToMarkup(
    markup: unknown,
    entity: IEntityMetadata,
    nonFrameworkProperties: PropertyMetadataDto[],
    metadataHelper: FormMetadataHelper,
    replacements: object,
  ): Promise<void> {
    try {
      const extensionJson = castToExtensionType<DetailsViewExtensionJson>(replacements);

      // Add header components and get properties used in key information bar
      const usedKeyInfoPropertyPaths = this.addHeader(entity, nonFrameworkProperties, markup, extensionJson, metadataHelper);

      // Filter out properties shown in the key information bar
      const propertiesForDetailsPanel = nonFrameworkProperties.filter((prop) => {
        const propIdentifier = prop.path || prop.label || '';
        return !usedKeyInfoPropertyPaths.includes(propIdentifier);
      });

      // Add details panel - using shared function with filtered properties
      addDetailsPanel(propertiesForDetailsPanel, markup, metadataHelper);

      // Add child tables if configured
      if (extensionJson.addChildTables) {
        await this.addChildTablesAsync(markup, extensionJson, metadataHelper);
      }
    } catch (error) {
      console.error("Error adding components to details view markup:", error);
      throw error;
    }
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

  /**
   * Adds header components to the markup.
   * Sets the title and optionally adds a key information bar if configured.
   *
   * @param entity The entity metadata.
   * @param metadata The properties metadata.
   * @param markup The JSON markup object.
   * @param extensionJson The extension configuration.
   * @param metadataHelper The metadata helper instance.
   * @returns Array of property paths used in key information bar, empty array if none used
   */
  private addHeader(entity: IEntityMetadata, metadata: PropertyMetadataDto[], markup: any, extensionJson: DetailsViewExtensionJson, metadataHelper: FormMetadataHelper): string[] {
    const title = `${entity.typeAccessor} Details`;

    const titleContainer = findContainersWithPlaceholder(markup, "//*TITLE*//");

    if (titleContainer.length === 0) {
      throw new Error("No title container found in the markup.");
    }

    titleContainer[0].content = title;

    // Keep track of property paths used in key information bar
    const usedKeyInfoPropertyPaths: string[] = [];

    // Add key information bar if configured
    if (extensionJson.showKeyInformationBar && extensionJson.keyInformationBarProperties?.length) {
      const keyInfoBarContainer = findContainersWithPlaceholder(markup, "//*KEYINFOBAR*//");

      if (keyInfoBarContainer.length === 0) {
        throw new Error("No key information bar container found in the markup.");
      }

      // Save paths of properties that will be used in the key info bar
      extensionJson.keyInformationBarProperties.forEach((path) => {
        usedKeyInfoPropertyPaths.push(path);
      });

      const keyInfoProperties = metadata.filter((x) =>
        extensionJson.keyInformationBarProperties?.includes(x.path || x.label || ''),
      );

      if (keyInfoProperties.length === 0) {
        console.warn(`No key information properties found for the key information bar. Requested properties: ${extensionJson.keyInformationBarProperties?.join(', ')}`);
        return usedKeyInfoPropertyPaths;
      } else {
        const keyInfoBarBuilder = new DesignerToolbarSettings({});

        keyInfoBarBuilder.addKeyInformationBar({
          id: nanoid(),
          propertyName: "keyInformationBar",
          label: "Key Information Bar",
          editMode: 'readOnly' as EditMode,
          hideLabel: true,
          hidden: false,
          componentName: "keyInformationBar",
          columns: keyInfoProperties.map((prop, index) => {
            const keyInfoBuilder = new DesignerToolbarSettings({});
            const count = index + 1;

            keyInfoBuilder.addText({
              id: nanoid(),
              propertyName: `text${count}`,
              label: prop.label,
              editMode: 'inherited' as EditMode,
              hideLabel: true,
              hidden: false,
              componentName: `text${count}`,
              content: prop.label || '',
              contentDisplay: 'content',
              textType: "span",
              color: 'default',
              desktop: {
                weight: 500,
              },
              strong: true,
            });

            metadataHelper.getConfigFields(prop, keyInfoBuilder, true);

            return {
              id: nanoid(),
              width: 200,
              flexDirection: 'column',
              textAlign: 'center',
              components: keyInfoBuilder.toJson(),
            };
          }),
        });

        if (keyInfoBarContainer[0].components && Array.isArray(keyInfoBarContainer[0].components)) {
          keyInfoBarContainer[0].components.push(...keyInfoBarBuilder.toJson());
        }
      }
    }

    return usedKeyInfoPropertyPaths;
  }

  /**
   * Adds child tables to the markup if configured.
   * Creates tabs for each child entity and injects datatable components for their properties.
   *
   * @param markup The JSON markup object.
   * @param extensionJson The extension configuration.
   * @param metadataHelper The metadata helper instance.
   */
  private async addChildTablesAsync(markup: any, extensionJson: DetailsViewExtensionJson, metadataHelper: FormMetadataHelper): Promise<void> {
    const builder = new DesignerToolbarSettings({});

    const childTableContainer = findContainersWithPlaceholder(markup, "//*CHILDTABLES*//");

    if (childTableContainer.length === 0) {
      throw new Error("No child table container found in the markup.");
    }

    const entities: IEntityMetadata[] = await Promise.all(
      extensionJson.childTablesList.map(async (childTable: string) => {
        return await metadataHelper.fetchEntityMetadataAsync(childTable);
      }),
    );

    if (entities.length > 0) {
      builder.addTabs({
        id: nanoid(),
        tabType: "line",
        propertyName: "childTables",
        label: "Child Tables",
        editMode: 'inherited' as EditMode,
        hideLabel: true,
        hidden: false,
        componentName: "childTables",
        tabs: await Promise.all(entities.map(async (childTable, index) => {
          const nonFrameworkProperties = await metadataHelper.extractNonFrameworkProperties(childTable);

          const childTableAccessoriesBuilder = new DesignerToolbarSettings({});
          childTableAccessoriesBuilder.addQuickSearch({
            id: nanoid(),
            componentName: 'childTableQuickSearch',
            propertyName: "childTableQuickSearch",
            version: 1,
          });

          childTableAccessoriesBuilder.addTablePager({
            id: nanoid(),
            propertyName: "childTablePager",
            componentName: 'childTablePager',
            label: "Child Table Pager",
            version: 1,
          });

          const childTableBuilder = new DesignerToolbarSettings({});

          childTableBuilder.addContainer({
            id: nanoid(),
            propertyName: "childTableContainer",
            editMode: 'editable' as EditMode,
            componentName: "childTableContainer",
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'right',
            components: childTableAccessoriesBuilder.toJson(),
          });

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

          const columns: IConfigurableColumnsProps[] = sortedProperties.map((prop, idx) => {
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
          });

          childTableBuilder.addDatatable({
            id: nanoid(),
            propertyName: "childTable",
            canAddInline: 'yes',
            canEditInline: 'yes',
            canDeleteInline: 'yes',
            items: [
              {
                id: nanoid(),
                columnType: 'crud-operations',
                caption: '',
                isVisible: true,
                sortOrder: -1,
                itemType: 'item',
              },
              ...columns,
            ],
          });

          const filterProperty = (childTable.properties as PropertyMetadataDto[]).find((p) => p.entityType === extensionJson.modelType)?.path;

          const childTableContextBuilder = new DesignerToolbarSettings({});
          childTableContextBuilder.addDatatableContext({
            id: nanoid(),
            propertyName: "childTableContext",
            editMode: 'inherited' as EditMode,
            hideLabel: true,
            hidden: false,
            componentName: "childTableContext",
            sourceType: "Entity",
            dataFetchingMode: "paging",
            defaultPageSize: ROW_COUNT,
            sortMode: "standard",
            permanentFilter: {
              and: [
                {
                  "==": [
                    {
                      // Fallback to "parentId" if no matching property is found
                      var: filterProperty ? toCamelCase(filterProperty) : "parentId",
                    },
                    {
                      evaluate: [
                        {
                          expression: "{{data.id}}",
                          required: true,
                          type: "mustache",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            entityType: extensionJson.childTablesList[index] || '',
            components: childTableBuilder.toJson(),
          });

          return {
            id: nanoid(),
            title: humanizeModelType(childTable.typeAccessor || ''),
            key: String(index),
            label: humanizeModelType(childTable.typeAccessor || ''),
            closable: false,
            components: childTableContextBuilder.toJson(),
          };
        })),
      });

      if (childTableContainer[0].components && Array.isArray(childTableContainer[0].components)) {
        childTableContainer[0].components.push(...builder.toJson());
      }
    }
  }
}
