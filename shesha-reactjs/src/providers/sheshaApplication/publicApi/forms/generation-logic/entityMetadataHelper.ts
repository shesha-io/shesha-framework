import { HttpClientApi } from "@/publicJsApis/httpClient";
import { EntityMetadataDto } from "../models/entityMetadata";
import qs from "qs";
import { IAbpWrappedGetEntityResponse } from "@/interfaces/gql";
import { PropertyMetadataDto } from "@/apis/metadata";
import { DataTypes, DesignerToolbarSettings, EditMode } from "@/index";
import { nanoid } from "@/utils/uuid";
import { toCamelCase } from "@/utils/string";

/**
 * Helper class for fetching and working with entity metadata.
 * Provides methods to retrieve entity metadata from the backend and to generate configuration fields for form builders.
 */
export class EntityMetadataHelper {
  private _httpClient: HttpClientApi;

  /**
   * Creates an instance of EntityMetadataHelper.
   * @param httpClient The HTTP client to use for API requests.
   */
  constructor(httpClient: HttpClientApi) {
    this._httpClient = httpClient;
  }

  /**
   * Fetches entity metadata from the backend or an API service.
   * @param modelType The type of model to fetch metadata for.
   * @returns A promise that resolves to the entity metadata object.
   * @throws Error if the model type is empty or if the request fails.
   */
  public async fetchEntityMetadata (modelType: string): Promise<EntityMetadataDto>{
    if (!modelType?.trim()) {
      throw new Error('Model type is required and cannot be empty');
    }
    
    const url = `/api/services/app/Metadata/Get?${qs.stringify({ container: modelType })}`;
    return this._httpClient
      .get<IAbpWrappedGetEntityResponse<EntityMetadataDto>>(url)
      .then(async (response) => {
        const metadata = response.data.result;
        return metadata as EntityMetadataDto;
      })
      .catch((error) => {
        console.error(`Error fetching metadata for model type ${modelType}:`, error);
        throw new Error(`Unable to fetch metadata for model type: ${modelType}`);
      });
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
