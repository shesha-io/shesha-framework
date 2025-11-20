import { PropertyMetadataDto } from "@/apis/metadata";
import { EditMode, IEntityMetadata } from "@/interfaces";
import { nanoid } from "@/utils/uuid";
import { toCamelCase } from "@/utils/string";
import { FormMetadataHelper } from "../formMetadataHelper";
import { IConfigurableColumnsProps, standardCellComponentTypes } from "@/providers/datatableColumnsConfigurator/models";
import { findContainersWithPlaceholder, castToExtensionType, humanizeModelType, addDetailsPanel, getDataTypePriority, getColumnWidthByDataType } from "../viewGenerationUtils";
import { DetailsViewExtensionJson } from "../../models/DetailsViewExtensionJson";
import { ROW_COUNT } from "../../constants";
import { BaseGenerationLogic } from "../baseGenerationLogic";
import { IEntityTypeIdentifier } from "../../../entities/models";
import { ITableContextComponentProps } from "@/designer-components/dataTable/tableContext/models";

/**
 * Implements generation logic for detail views.
 * Handles processing template markup for detail views, including specific header components, key information bars, and child tables.
 */
export class DetailsViewGenerationLogic extends BaseGenerationLogic {
  readonly typeName = "DetailsViewGenerationLogic";

  protected getModelTypeFromReplacements(replacements: object): string | IEntityTypeIdentifier | null {
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
      addDetailsPanel(propertiesForDetailsPanel, markup, metadataHelper, () => this.getFormBuilder());

      // Add child tables if configured
      if (extensionJson.addChildTables) {
        await this.addChildTablesAsync(entity, markup, extensionJson, metadataHelper);
      }
    } catch (error) {
      console.error("Error adding components to details view markup:", error);
      throw error;
    }
  }

  /**
   * Attempts to find a suitable display name property from the entity metadata.
   * Checks for common property names like 'fullName' and 'name'.
   *
   * @param metadata The properties metadata.
   * @returns The path to a display name property, or null if not found.
   */
  private findDisplayNameProperty(metadata: PropertyMetadataDto[]): string | null {
    // Common property names that typically serve as display names, in order of preference
    const commonDisplayNames = ['fullName', 'name'];

    for (const displayName of commonDisplayNames) {
      const property = metadata.find((prop) =>
        prop.path?.toLowerCase() === displayName.toLowerCase(),
      );
      if (property) {
        return property.path;
      }
    }

    return null;
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
   * @returns Array of property paths used in key information bar, empty array if none used
   */
  private addHeader(entity: IEntityMetadata, metadata: PropertyMetadataDto[], markup: any, extensionJson: DetailsViewExtensionJson, metadataHelper: FormMetadataHelper): string[] {
    // Try to find a display name property, falling back to static entity type name
    const displayNameProperty = this.findDisplayNameProperty(metadata);
    const title = displayNameProperty
      ? `{{${toCamelCase(displayNameProperty)}}}`
      : `${entity.typeAccessor} Details`;

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
        const keyInfoBarBuilder = this.getFormBuilder();

        keyInfoBarBuilder.addKeyInformationBar({
          id: nanoid(),
          propertyName: "keyInformationBar",
          label: "Key Information Bar",
          editMode: 'readOnly' as EditMode,
          hideLabel: true,
          componentName: "keyInformationBar",
          columns: keyInfoProperties.map((prop, index) => {
            const keyInfoBuilder = this.getFormBuilder();
            const count = index + 1;
            const customDefaults = {
              font: {
                weight: '700',
                size: 14,
                color: '#000',
                type: 'Segoe UI',
              },
            };

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
              desktop: { ...customDefaults },
              tablet: { ...customDefaults },
              mobile: { ...customDefaults },
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
   * Generates edit/create component configuration for a datatable column based on property metadata.
   *
   * @param property The property metadata to generate component configuration for.
   * @param metadataHelper The metadata helper instance.
   * @returns An object containing the component type and settings for inline editing.
   */
  private getColumnEditorConfig(property: PropertyMetadataDto, metadataHelper: FormMetadataHelper): { type: string; settings?: Record<string, unknown> } {
    const tempBuilder = this.getFormBuilder();
    metadataHelper.getConfigFields(property, tempBuilder, false);
    const componentConfigs = tempBuilder.toJson();

    if (componentConfigs.length === 0) {
      return { type: 'textField' };
    }

    const component = componentConfigs[0];
    const { id, propertyName, componentName, ...settings } = component;

    const typedSettings: Record<string, unknown> = settings;

    return {
      type: component.type,
      settings: Object.keys(typedSettings).length > 0 ? typedSettings : undefined,
    };
  }

  /**
   * Adds child tables to the markup if configured.
   * Creates tabs for each child entity and injects datatable components for their properties.
   *
   * @param markup The JSON markup object.
   * @param extensionJson The extension configuration.
   * @param metadataHelper The metadata helper instance.
   */
  private async addChildTablesAsync(entity: IEntityMetadata, markup: any, extensionJson: DetailsViewExtensionJson, metadataHelper: FormMetadataHelper): Promise<void> {
    const builder = this.getFormBuilder();

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
        tabType: "card",
        propertyName: "childTables",
        label: "Child Tables",
        editMode: 'inherited' as EditMode,
        hideLabel: true,
        hidden: false,
        componentName: "childTables",
        tabs: await Promise.all(entities.map(async (childTable, index) => {
          const nonFrameworkProperties = await metadataHelper.extractNonFrameworkProperties(childTable);

          const childTableAccessoriesBuilder = this.getFormBuilder();
          childTableAccessoriesBuilder.addDatatableQuickSearch({
            id: nanoid(),
            componentName: 'childTableQuickSearch',
            propertyName: "childTableQuickSearch",
            version: 1,
          });

          childTableAccessoriesBuilder.addDatatablePager({
            id: nanoid(),
            propertyName: "childTablePager",
            componentName: 'childTablePager',
            label: "Child Table Pager",
            version: 1,
          });

          const childTableContainerBuilder = this.getFormBuilder();

          childTableContainerBuilder.addContainer({
            id: nanoid(),
            propertyName: "childTableContainer",
            editMode: 'editable' as EditMode,
            componentName: "childTableContainer",
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'right',
            isDynamic: false,
            desktop: {
              stylingBox: '{"marginBottom":"14","marginRight":"14"}',
            },
            components: childTableAccessoriesBuilder.toJson(),
          });

          const filterProperty = (childTable.properties as PropertyMetadataDto[]).find((p) => p.entityType === entity.typeAccessor)?.path;

          const sortedProperties = [...nonFrameworkProperties]
            .filter((prop) => prop.path !== filterProperty)
            .sort((a, b) => {
              // Sort by required status (required first)
              if (a.required !== b.required) {
                return a.required ? -1 : 1;
              }

              // Sort by dataType priority only
              const priorityA = getDataTypePriority(a.dataType, a.dataFormat);
              const priorityB = getDataTypePriority(b.dataType, b.dataFormat);

              return priorityA - priorityB;
            });

          const columns = sortedProperties.map<IConfigurableColumnsProps>((prop, idx) => {
            const width = getColumnWidthByDataType(prop.dataType, prop.dataFormat);
            const editorConfig = this.getColumnEditorConfig(prop, metadataHelper);

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
              displayComponent: { type: standardCellComponentTypes.defaultDisplay },
              editComponent: editorConfig,
              createComponent: editorConfig,
            };
          });
          const dataTableName = `childTable${index + 1}`;

          const datatableBuilder = this.getFormBuilder();
          datatableBuilder.addDatatable({
            id: nanoid(),
            propertyName: dataTableName,
            componentName: dataTableName,
            canAddInline: 'yes',
            canEditInline: 'yes',
            canDeleteInline: 'yes',
            onNewRowInitialize: `return {${toCamelCase(filterProperty || 'parentId')}: form.data.id}`,
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

          const contextComponents = [
            ...childTableContainerBuilder.toJson(),
            ...datatableBuilder.toJson(),
          ];

          const childTableContextBuilder = this.getFormBuilder();
          childTableContextBuilder.addDataContext({
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
            components: contextComponents,
          } as ITableContextComponentProps);

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
