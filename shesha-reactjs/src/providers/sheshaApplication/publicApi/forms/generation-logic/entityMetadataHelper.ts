import { DataTypes, DesignerToolbarSettings, EditMode, IEntityMetadata } from "@/index";
import { nanoid } from "@/utils/uuid";
import { toCamelCase } from "@/utils/string";
import { IMetadataDispatcher } from "@/providers/metadataDispatcher/contexts";
import { PropertyMetadataDto } from "@/apis/metadata";

/**
 * Helper class for fetching and working with entity metadata.
 * Provides methods to retrieve entity metadata from the backend and to generate configuration fields for form builders.
 */
export class EntityMetadataHelper {
  private _metadataDispatcher: IMetadataDispatcher;

  /**
   * Creates an instance of EntityMetadataHelper.
   * @param metadataDispatcher The metadata dispatcher to use for fetching entity metadata.
   */
  constructor(metadataDispatcher: IMetadataDispatcher) {
    this._metadataDispatcher = metadataDispatcher;
  }

  /**
   * Fetches entity metadata from the backend or an API service using IMetadataDispatcher.
   * @param modelType The type of model to fetch metadata for.
   * @returns A promise that resolves to the entity metadata object.
   * @throws Error if the model type is empty or if the request fails.
   */
  public async fetchEntityMetadataAsync(modelType: string): Promise<IEntityMetadata> {
    if (!modelType?.trim()) {
      throw new Error('Model type is required and cannot be empty');
    }
    
    try {
      const metadata = await this._metadataDispatcher.getMetadata({ 
        modelType: modelType, 
        dataType: DataTypes.entityReference 
      });
      
      if (!metadata) {
        throw new Error(`No metadata found for model type: ${modelType}`);
      }
      
      return metadata as IEntityMetadata;
      
    } catch (error) {
      console.error(`Error fetching metadata for model type ${modelType}:`, error);
      throw new Error(`Unable to fetch metadata for model type: ${modelType}: ${error.message || error}`);
    }
  };
  
  /**
   * Adds configuration fields to a form builder for a given property.
   * Determines the appropriate form field type based on the property metadata and adds it to the builder.
   *
   * @param property The property metadata to generate a field for.
   * @param builder The form builder instance to add the field to.
   * @param isReadOnly Whether the field should be read-only (default: false).
   * @throws Error if required metadata is missing for certain property types.
   */
  public getConfigFields(property: PropertyMetadataDto, builder: DesignerToolbarSettings<{}>, isReadOnly: boolean = false): void {
    const commonProps = {
      id: nanoid(),
      propertyName: toCamelCase(property.path),
      label: property.label,
      editMode: isReadOnly ? 'readOnly' as EditMode : 'inherited' as EditMode,
      hideLabel: isReadOnly,
      hidden: false,
      hideBorder: isReadOnly,
      componentName: toCamelCase(property.path)
    };

    switch (property.dataType) {
      case DataTypes.string:
        if (property.dataFormat === 'multiline') {
          builder.addTextArea({
            ...commonProps,
          });
          break;
        } else {
          builder.addTextField({
            ...commonProps,
          });
        }
        break;

      case DataTypes.number:
        builder.addNumberField(commonProps);
        break;

      case DataTypes.entityReference:
        if (!property.entityType) {
          throw new Error('Entity type is required for entityReference type');
        }
        builder.addAutocomplete({
          ...commonProps,
          entityType: property.entityType,
          dataSourceType: 'entitiesList',
        });
        break;

      case DataTypes.referenceListItem:
        if (!property.referenceListName || !property.referenceListModule) {
          throw new Error('Reference list name and namespace are required for referenceListItem type');
        }
        builder.addDropdown({
          ...commonProps,
          dataSourceType: 'referenceList',
          referenceListName: property.referenceListName,
          referenceListId:{
            module: property.referenceListModule,
            name: property.referenceListName},
        });
        break;

      case DataTypes.boolean:
        builder.addCheckbox(commonProps);
        break;

      default:
        break;
    }
  }
}
