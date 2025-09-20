import { PropertyMetadataDto } from "@/apis/metadata";
import { DesignerToolbarSettings, EditMode, IEntityMetadata } from "@/index";
import { nanoid } from "@/utils/uuid";
import { toCamelCase } from "@/utils/string";
import { FormMetadataHelper } from "../formMetadataHelper";
import { IConfigurableColumnsProps } from "@/providers/datatableColumnsConfigurator/models";
import { findContainersWithPlaceholder, castToExtensionType, humanizeModelType, addDetailsPanel } from "../viewGenerationUtils";
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
    markup: any, 
    entity: IEntityMetadata, 
    nonFrameworkProperties: PropertyMetadataDto[],
    metadataHelper: FormMetadataHelper,
    replacements: object
  ): Promise<void> {
    try {
      const extensionJson = castToExtensionType<DetailsViewExtensionJson>(replacements);
      
      // Add header components
      this.addHeader(entity, nonFrameworkProperties, markup, extensionJson, metadataHelper);

      // Add details panel - using shared function
      addDetailsPanel(nonFrameworkProperties, markup, metadataHelper);

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
   */
  private addHeader(entity: IEntityMetadata, metadata: PropertyMetadataDto[], markup: any, extensionJson: DetailsViewExtensionJson, metadataHelper: FormMetadataHelper): void {
    const title = `${entity.typeAccessor} Details`;

    const titleContainer = findContainersWithPlaceholder(markup, "//*TITLE*//");

    if (titleContainer.length === 0) {
      throw new Error("No title container found in the markup.");
    }

    titleContainer[0].content = title;

    // Add key information bar if configured
    const builder = new DesignerToolbarSettings({});
    if (extensionJson.showKeyInformationBar) {
      const keyInfoBarContainer = findContainersWithPlaceholder(markup, "//*KEYINFOBAR*//");

      if (keyInfoBarContainer.length === 0) {
        throw new Error("No key information bar container found in the markup.");
      }
      const keyInfoProperties = metadata.filter(x =>
        extensionJson.keyInformationBarProperties?.includes(x.path || x.label || '')
      );

      if (keyInfoProperties.length === 0) {
        console.warn(`No key information properties found for the key information bar. Requested properties: ${extensionJson.keyInformationBarProperties?.join(', ')}`);
        return;
      } else {
        builder.addKeyInformationBar({
          id: nanoid(),
          propertyName: "keyInformationBar",
          label: "Key Information Bar",
          editMode: 'readOnly' as EditMode,
          hideLabel: true,
          hidden: false,
          componentName: "keyInformationBar",
          columns: keyInfoProperties.map(prop => {
            const keyInfoBuilder = new DesignerToolbarSettings({});

            keyInfoBuilder.addText({
              id: nanoid(),
              propertyName: 'text1',
              label: prop.label,
              editMode: 'inherited' as EditMode,
              hideLabel: true,
              hidden: false,
              componentName: 'text1',
              content: prop.label || '',
              contentDisplay: 'content',
              textType: "span",
              color: 'default',
              strong: true
            });

            metadataHelper.getConfigFields(prop, keyInfoBuilder, true);

            return {
              id: nanoid(),
              width: 200,
              flexDirection: 'row',
              textAlign: 'start',
              components: keyInfoBuilder.toJson()
            };
          })
        });

        if (keyInfoBarContainer[0].components && Array.isArray(keyInfoBarContainer[0].components)) {
          keyInfoBarContainer[0].components.push(...builder.toJson());
        }
      }
    }
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
      })
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
            components: childTableAccessoriesBuilder.toJson()
          });

          const columns: IConfigurableColumnsProps[] = nonFrameworkProperties.map((prop, idx) => {
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
                itemType: 'item'
              },
              ...columns
            ]
          });

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
              "and": [
                {
                  "==": [
                    {
                      // Fallback to "parentId" if no matching property is found
                      "var": (childTable.properties as PropertyMetadataDto[])
                        .find(p => p.entityType === extensionJson.modelType)
                        ?.path
                        || "parentId",
                    },
                    {
                      "evaluate": [
                        {
                          "expression": "{{data.id}}",
                          "required": true,
                          "type": "mustache"
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            entityType: extensionJson.childTablesList[index] || '',
            components: childTableBuilder.toJson()
          });

          return {
            id: nanoid(),
            title: humanizeModelType(childTable.typeAccessor || ''),
            key: String(index),
            label: humanizeModelType(childTable.typeAccessor || ''),
            closable: false,
            components: childTableContextBuilder.toJson()
          };
        }))
      });

      if (childTableContainer[0].components && Array.isArray(childTableContainer[0].components)) {
        childTableContainer[0].components.push(...builder.toJson());
      }
    }
  }

}
