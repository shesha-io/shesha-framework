import { IPropertySetting } from '@/providers/form/models';

export type RequestValue = string | IPropertySetting<string>;

export interface IRequestParam {
  key: string;
  value: RequestValue;
  description?: string;
  enabled: boolean;
}

export interface IRequestHeader {
  key: string;
  value: RequestValue;
  enabled: boolean;
}

export type BodyType = 'none' | 'json' | 'form-data' | 'x-www-form-urlencoded' | 'raw';

export interface IFormDataField {
  key: string;
  value: RequestValue;
  enabled: boolean;
}

export type RawBodySubType = 'text' | 'json' | 'xml' | 'html' | 'javascript';

export interface IRequestBody {
  type: BodyType;
  // form-data / x-www-form-urlencoded use IFormDataField[]; json/raw use string.
  // Legacy storage of JSON-stringified form-data is still readable for back-compat.
  content: string | Record<string, any> | IFormDataField[];
  // Only used when type === 'raw'. Drives the request Content-Type header and the editor's syntax highlighting.
  rawSubType?: RawBodySubType;
}

/**
 * Optional transformation applied to the API response before it is displayed/consumed.
 * The original response is left unchanged; only the value handed downstream is transformed.
 */
export interface IResponseTransformationConfiguration {
  enabled: boolean;
  /** JavaScript body that receives `input` (the response) and returns the transformed value. */
  script: string;
}

export interface IRequestConfig {
  params: IRequestParam[];
  headers: IRequestHeader[];
  body: IRequestBody;
  responseTransformation?: IResponseTransformationConfiguration;
}
