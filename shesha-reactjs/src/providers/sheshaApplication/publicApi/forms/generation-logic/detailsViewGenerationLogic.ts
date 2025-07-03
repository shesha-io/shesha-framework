import { FormConfigurationDto } from "@/providers/form/api";
import { evaluateString } from "@/providers/form/utils";
import { GenerationLogic } from "./interface";
import { PropertyMetadataDto } from "@/apis/metadata";
import { EntityMetadataDto } from "../models/entityMetadata";
import { DesignerToolbarSettings, EditMode } from "@/index";
import { nanoid } from "nanoid";
import { toCamelCase } from "@/utils/string";
import { EntityMetadataHelper } from "./entityMetadataHelper";
import { IConfigurableColumnsProps } from "@/providers/datatableColumnsConfigurator/models";
import { findContainersWithPlaceholder, safeStringify, deserializeExtensionJson, humanizeModelType, processBaseMarkup } from "./viewGenerationUtils";

/**
 * Interface for the extension JSON configuration for Details View
 */
export interface DetailsViewExtensionJson {
  modelType: string;
  showKeyInformationBar: boolean;
  keyInformationBarProperties: string[];
  addChildTables: boolean;
  childTablesList: string[];
}

/**
 * Implements generation logic for detail views
 * Handles processing template markup for detail views, 
 * including specific header components, key information bars, and child tables
 */
export class DetailsViewGenerationLogic implements GenerationLogic {

  /**
   * Process the template markup with replacements and specialized logic for detail views
   * @param markup The original template markup
   * @param replacements An object containing values to replace in the template
   * @returns The processed markup ready for use
   */
  async processTemplate(markup: string, replacements: object, metadataHelper?: EntityMetadataHelper): Promise<string> {
    try {
      let processedMarkup = processBaseMarkup(markup, replacements);

      const markupObj = JSON.parse(processedMarkup);

      const extensionJson = deserializeExtensionJson<DetailsViewExtensionJson>(replacements);
      if (extensionJson?.modelType) {
        const entity = await metadataHelper.fetchEntityMetadata(extensionJson.modelType);

        const nonFrameworkProperties = entity.properties.filter(x => !x.isFrameworkRelated);

        await this.addComponentsToMarkup(markupObj, extensionJson, entity, nonFrameworkProperties, metadataHelper);
      }
      return safeStringify(markupObj, 2);
    } catch (error) {
      console.error("Error processing details view markup:", error);
      // In case of error, return the original markup with basic replacements
      return evaluateString(markup, replacements, true);
    }
  }
    /**
   * Check if this generation logic implementation supports the given template
   * @param template The form template to check
   * @returns True if this implementation supports the template
   */
  supportsTemplate(template: FormConfigurationDto): boolean {
    // Check template attributes that indicate this is a details view template
    return template?.generationLogicTypeName === "DetailsViewGenerationLogic";
  }
  
  /**
   * Add components to the markup based on extension configuration
   * @param markup JSON markup object
   * @param extensionJson Extension configuration
   * @param entity Entity metadata
   * @param nonFrameworkProperties Filtered properties
   * @param builder Form builder instance
   */
  private async addComponentsToMarkup(markup: any, extensionJson: DetailsViewExtensionJson, entity: EntityMetadataDto, nonFrameworkProperties: PropertyMetadataDto[], metadataHelper: EntityMetadataHelper): Promise<any> {
    try {
      // Add header components
      this.addHeader(entity, nonFrameworkProperties, markup, extensionJson, metadataHelper);
      
      // Add details panel
      this.addDetailsPanel(nonFrameworkProperties, markup, extensionJson, metadataHelper);
      
      // Add child tables if configured
      if (extensionJson.addChildTables) {
        await this.addChildTablesAsync(markup, extensionJson, metadataHelper);
      }
    } catch (error) {
      console.error("Error adding components to markup:", error);
    }
    
    return markup;
  }
  
  /**
   * Add header components
   * @param entity Entity metadata
   * @param metadata Properties metadata
   * @param markup JSON markup object
   * @param extensionJson Extension configuration
   * @param builder Form builder instance
   */
  private addHeader(entity: EntityMetadataDto, metadata: PropertyMetadataDto[], markup: any, extensionJson: DetailsViewExtensionJson, metadataHelper: EntityMetadataHelper): void {
    const title = `${entity.typeAccessor} Details`;
    
    const titleContainer = findContainersWithPlaceholder(markup, "//*TITLE*//");
    
    if (titleContainer.length === 0) {
      throw new Error("No title container found in the markup.");
    }
    
    titleContainer[0].content = title;
    
    // Add key information bar if configured
    const builder = new DesignerToolbarSettings({});
    if (extensionJson.showKeyInformationBar) {
      const keyInfoProperties = metadata.filter(x => 
        extensionJson.keyInformationBarProperties.includes(x.path || x.label)
      );
      
      if (keyInfoProperties.length === 0) {
        throw new Error("No key information properties found for the key information bar.");
      }

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
            content: prop.label,
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

      const keyInfoBarContainer = findContainersWithPlaceholder(markup, "//*KEYINFOBAR*//");
      
      if (keyInfoBarContainer.length === 0) {
        throw new Error("No key information bar container found in the markup.");
      }
      
      if (keyInfoBarContainer[0].components && Array.isArray(keyInfoBarContainer[0].components)) {
        keyInfoBarContainer[0].components.push(...builder.toJson());     
      }
    }
  }
  
  /**
   * Add details panel components
   * @param metadata Properties metadata
   * @param markup JSON markup object
   * @param builder Form builder instance
   */
  private addDetailsPanel(metadata: any[], markup: any, _extensionJson: DetailsViewExtensionJson, metadataHelper: EntityMetadataHelper): void {
    const builder = new DesignerToolbarSettings({});

    const detailsPanelContainer = findContainersWithPlaceholder(markup, "//*DETAILSPANEL*//");
    
    if (detailsPanelContainer.length === 0) {
      throw new Error("No details panel container found in the markup.");
    }

    var column1 = [];
    var column2 = [];
    if (metadata.length > 5) {

      metadata.forEach((prop, index) => {
        const columnBuilder = new DesignerToolbarSettings({});
        metadataHelper.getConfigFields(prop, columnBuilder);

        if (index % 2 === 0) {
          column1.push(...columnBuilder.toJson());
        } else {
          column2.push(...columnBuilder.toJson());
        }
      })

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
      })
    } else {
      metadata.forEach(prop => {
        metadataHelper.getConfigFields(prop, builder);
      });
    }
    
    if (detailsPanelContainer[0].components && Array.isArray(detailsPanelContainer[0].components)) {
      detailsPanelContainer[0].components.push(...builder.toJson());
    }
  }
  
  /**
   * Add child tables
   * @param markup JSON markup object
   * @param extensionJson Extension configuration
   * @param builder Form builder instance
   */ 
  private async addChildTablesAsync(markup: any, extensionJson: DetailsViewExtensionJson, metadataHelper: EntityMetadataHelper): Promise<void> {
    const builder = new DesignerToolbarSettings({});
    
    const childTableContainer = findContainersWithPlaceholder(markup, "//*CHILDTABLES*//");
    
    if (childTableContainer.length === 0) {
      throw new Error("No child table container found in the markup.");
    }

    var entities: EntityMetadataDto[] = []; 

    const fetchPromises = extensionJson.childTablesList.map(async (childTable: string) => {
      return await metadataHelper.fetchEntityMetadata(childTable);
    });
    
    entities = await Promise.all(fetchPromises);
    
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
        tabs: entities.map((childTable, index) => {
          const nonFrameworkProperties = childTable.properties.filter(x => !x.isFrameworkRelated);

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
          })

          var columns: IConfigurableColumnsProps[] = nonFrameworkProperties.map((prop, idx) => {
                return {
                  id: nanoid(),
                  columnType: 'data',
                  propertyName: toCamelCase(prop.path),
                  caption: prop.label,
                  isVisible: true,
                  description: prop.description,
                  sortOrder: idx,
                  itemType: 'item'
                }
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
            defaultPageSize: 5,
            sortMode: "standard",
            permanentFilter: {
              "and": [
                {
                  "==": [
                    {
                      "var": "address"
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
            entityType: extensionJson.childTablesList[index],
            components: childTableBuilder.toJson()
          });

          return {
            id: nanoid(),
            title: humanizeModelType(childTable.typeAccessor),
            key: String(index),
            label: humanizeModelType(childTable.typeAccessor),
            closable: false,
            components: childTableContextBuilder.toJson()
          };
        })      
    })
      
      if (childTableContainer[0].components && Array.isArray(childTableContainer[0].components)) {
        childTableContainer[0].components.push(...builder.toJson());
      }
    }
  }
  
}
