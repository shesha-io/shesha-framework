import { HttpClientApi } from "@/publicJsApis/httpClient";
import { EntityMetadataDto } from "../models/entityMetadata";
import qs from "qs";
import { AxiosResponse } from "axios";
import { IAbpWrappedGetEntityResponse } from "@/interfaces/gql";
import { PropertyMetadataDto } from "@/apis/metadata";
import { DataTypes, DesignerToolbarSettings, EditMode } from "@/index";
import { nanoid } from "@/utils/uuid";
import { toCamelCase } from "@/utils/string";

/**
 * Helper class for fetching and working with entity metadata
 */
export class EntityMetadataHelper {
  private _httpClient: HttpClientApi;

  constructor(httpClient: HttpClientApi) {
    this._httpClient = httpClient;
  }

/**
 * Fetch entity metadata from the backend or an API service
 * @param modelType The type of model to fetch metadata for
 * @param httpClient The HTTP client to use for the API request
 * @returns Entity metadata object
 */
  public async fetchEntityMetadata (modelType: string): Promise<EntityMetadataDto>{
  const url = `/api/services/app/Metadata/Get?${qs.stringify({ container: modelType })}`;
  return this._httpClient
    .get<any, AxiosResponse<IAbpWrappedGetEntityResponse<EntityMetadataDto>>>(url)
    .then(async (response) => {
      const metadata = response.data.result;
      return metadata as EntityMetadataDto;
    }).catch((error)=> {
      console.error(`Error fetching metadata for model type ${modelType}:`, error);
      throw new Error(`Unable to fetch metadata for model type: ${modelType}`);
    });
  };
  
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
        if (property.minLength > 300) {
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
