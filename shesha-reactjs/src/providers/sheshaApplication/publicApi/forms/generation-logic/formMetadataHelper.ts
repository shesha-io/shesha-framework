import { DataTypes, EditMode, IConfigurableFormComponent, IEntityMetadata, IInputStyles } from "@/interfaces";
import { nanoid } from "@/utils/uuid";
import { toCamelCase } from "@/utils/string";
import { IMetadataDispatcher } from "@/providers/metadataDispatcher/contexts";
import { isPropertiesArray, isPropertiesLoader } from "@/interfaces/metadata";
import { IEntityTypeIdentifier } from "../../entities/models";
import { isEntityTypeIdEmpty } from "@/providers/metadataDispatcher/entities/utils";
import { FormBuilder } from "@/form-factory/interfaces";
import { isDefined } from "@/utils/nullables";
import { IPropertyMetadata } from "@/publicJsApis/metadata";

/**
 * Helper class for fetching entity metadata and generating form fields based on that metadata.
 * Provides methods to retrieve entity metadata from the backend and to generate configuration fields for form builders.
 */
export class FormMetadataHelper {
  private _metadataDispatcher: IMetadataDispatcher;

  private _modelType: string | IEntityTypeIdentifier | null = null;

  /**
   * Creates an instance of FormMetadataHelper.
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
  public async fetchEntityMetadataAsync(modelType: string | IEntityTypeIdentifier): Promise<IEntityMetadata> {
    if (isEntityTypeIdEmpty(modelType)) {
      throw new Error('Model type is required and cannot be empty');
    }

    try {
      // Store the model type for use in other methods
      this._modelType = modelType;
      const metadata = await this._metadataDispatcher.getMetadata({
        modelType: modelType,
        dataType: DataTypes.entityReference,
      });

      if (!isDefined(metadata)) {
        throw new Error(`No metadata found for model type: ${modelType}`);
      }

      return metadata as IEntityMetadata;
    } catch (error) {
      console.error(`Error fetching metadata for model type ${modelType}:`, error);
      throw new Error(`Unable to fetch metadata for model type: ${modelType}: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  /**
   * Fetches entity metadata and extracts non-framework properties in a single operation.
   * @param modelType The type of model to fetch metadata for.
   * @returns A promise that resolves to an object containing entity metadata and non-framework properties.
   * @throws Error if the model type is empty or if the request fails.
   */
  public async fetchEntityMetadataWithPropertiesAsync(modelType: string | IEntityTypeIdentifier): Promise<{ entity: IEntityMetadata; nonFrameworkProperties: IPropertyMetadata[] }> {
    const entity = await this.fetchEntityMetadataAsync(modelType);
    const nonFrameworkProperties = await this.extractNonFrameworkProperties(entity);

    return { entity, nonFrameworkProperties };
  };

  /**
   * Safely extracts non-framework properties from an entity metadata object.
   * Handles different types of property structures (array, loader function, or null/undefined).
   * Ensures all returned properties have non-null string values to prevent type errors.
   *
   * @param entity The entity metadata to extract properties from
   * @returns Array of non-framework properties as PropertyMetadataDto with safe non-null values
   */
  public async extractNonFrameworkProperties(entity: IEntityMetadata): Promise<IPropertyMetadata[]> {
    const nonFrameworkProperties: IPropertyMetadata[] = [];

    if (isPropertiesArray(entity.properties)) {
      // Handle case when properties is an array
      const propertiesArray = entity.properties;

      // Filter out framework-related properties and add to our collection with safe values
      for (const prop of propertiesArray) {
        if (!prop.isFrameworkRelated) {
          nonFrameworkProperties.push(prop);
        }
      }
    } else if (isPropertiesLoader(entity.properties)) {
      // Handle case when properties is a loader function
      try {
        const loadedProperties = await entity.properties();

        // Filter out framework-related properties and add to our collection with safe values
        for (const prop of loadedProperties) {
          if (!prop.isFrameworkRelated) {
            nonFrameworkProperties.push(prop);
          }
        }
      } catch (error) {
        console.error("Error loading properties from loader:", error);
      }
    } else if (!isDefined(entity.properties)) {
      // Handle case when properties is null or undefined
      console.warn("Entity properties are null or undefined");
    } else {
      // Handle any other unexpected type
      console.warn("Entity properties has an unexpected type");
    }

    return nonFrameworkProperties;
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
  public getConfigFields(property: IPropertyMetadata, builder: FormBuilder, isReadOnly: boolean = false): void {
    const commonProps: Omit<IConfigurableFormComponent, 'type'> = {
      id: nanoid(),
      propertyName: toCamelCase(property.path) || "",
      label: property.label,
      editMode: isReadOnly ? 'readOnly' as EditMode : 'inherited' as EditMode,
      hideLabel: isReadOnly,
      hidden: !property.isVisible,
      validate: {
        required: property.required ?? false,
      },
      componentName: toCamelCase(property.path) || "",
    };
    const styledProps: Omit<IConfigurableFormComponent, 'type'> & IInputStyles = {
      ...commonProps,
      hideBorder: isReadOnly,
    };

    switch (property.dataType) {
      case DataTypes.string:
        if (property.dataFormat === 'multiline') {
          builder.addTextArea(styledProps, property);
        } else {
          builder.addTextField(styledProps, property);
        }
        break;

      case DataTypes.number:
        builder.addNumberField(styledProps, property);
        break;

      case DataTypes.entityReference:
        if (!property.entityType) {
          throw new Error(`Entity type is required for entityReference type. Property: ${property.path}`);
        }
        builder.addAutocomplete({
          ...commonProps,
          entityType: property.entityType
            ? { name: property.entityType, module: property.entityModule } as IEntityTypeIdentifier
            : undefined,
          dataSourceType: 'entitiesList',
        }, property);
        break;

      case DataTypes.referenceListItem:
        if (!property.referenceListName || !property.referenceListModule) {
          throw new Error('Reference list name and namespace are required for referenceListItem type');
        }
        builder.addDropdown({
          ...styledProps,
          dataSourceType: 'referenceList',
          border: {
            hideBorder: false,
            radiusType: 'all',
            borderType: 'all',
            border: {
              all: { width: 1, style: 'solid', color: '#d9d9d9' },
            },
            radius: { all: 8 },
          },
          referenceListName: property.referenceListName,
          referenceListId: {
            module: property.referenceListModule,
            name: property.referenceListName,
          },
        }, property);
        break;

      case DataTypes.boolean:
        builder.addCheckbox(styledProps, property);
        break;

      case DataTypes.date:
      case DataTypes.dateTime:
        builder.addDateField(styledProps, property);
        break;

      case DataTypes.time:
        builder.addTimePicker(styledProps, property);
        break;

      case DataTypes.file:
        builder.addFileUpload({
          ...commonProps,
          font: { size: 14 },
          ownerId: '{data.id}',
          ownerType: this._modelType || '',
          useSync: false,
        }, property);
        break;
      default:
        break;
    }
  }
}
